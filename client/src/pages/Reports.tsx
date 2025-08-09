import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalPayments: number;
  paymentMethods: {
    [key: string]: number;
  };
}

interface DailyReport {
  date: string;
  payments: any[];
  summary: {
    totalAmount: number;
    totalPayments: number;
    paymentsByMethod: {
      [key: string]: number;
    };
    paymentsByType: {
      [key: string]: number;
    };
  };
}

const Reports: React.FC = () => {
  const [financialReport, setFinancialReport] = useState<FinancialReport[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'financial' | 'daily'>('financial');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    if (reportType === 'financial') {
      fetchFinancialReport();
    } else {
      fetchDailyReport();
    }
  }, [reportType, startDate, endDate, groupBy, selectedDate]);

  const fetchFinancialReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/financial-report`, {
        params: { startDate, endDate, groupBy }
      });
      setFinancialReport(response.data);
    } catch (error) {
      console.error('Error fetching financial report:', error);
      toast.error('Erreur lors du chargement du rapport financier');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments/daily-report`, {
        params: { date: selectedDate }
      });
      setDailyReport(response.data);
    } catch (error) {
      console.error('Error fetching daily report:', error);
      toast.error('Erreur lors du chargement du rapport journalier');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportToPDF = async () => {
    try {
      toast.success('Export PDF en cours de développement');
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const exportToExcel = async () => {
    try {
      toast.success('Export Excel en cours de développement');
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const getTotalRevenue = () => {
    return financialReport.reduce((sum, item) => sum + item.totalRevenue, 0);
  };

  const getTotalPayments = () => {
    return financialReport.reduce((sum, item) => sum + item.totalPayments, 0);
  };

  const getPaymentMethodsData = () => {
    const methods: { [key: string]: number } = {};

    financialReport.forEach(item => {
      Object.entries(item.paymentMethods).forEach(([method, amount]) => {
        methods[method] = (methods[method] || 0) + amount;
      });
    });

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h1>
          <p className="text-gray-600">Analysez les performances financières de la garderie</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors duration-200"
          >
            <Download className="w-5 h-5" />
            <span>PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors duration-200"
          >
            <Download className="w-5 h-5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setReportType('financial')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${reportType === 'financial'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Rapport Financier</span>
          </button>
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${reportType === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Rapport Journalier</span>
          </button>
        </div>

        {/* Filters */}
        {reportType === 'financial' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grouper par
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date sélectionnée
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {reportType === 'financial' ? (
            <>
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Revenus Total</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalRevenue())}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Nombre de Paiements</p>
                      <p className="text-2xl font-bold text-gray-900">{getTotalPayments()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Moyenne par Paiement</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {getTotalPayments() > 0 ? formatCurrency(getTotalRevenue() / getTotalPayments()) : formatCurrency(0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={financialReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                        labelFormatter={(label) => `Période: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Payment Methods Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Méthode de Paiement</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={getPaymentMethodsData() || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {(getPaymentMethodsData() || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payments Bar Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nombre de Paiements par Période</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalPayments" fill="#3B82F6" name="Nombre de Paiements" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              {/* Daily Report */}
              {dailyReport && (
                <>
                  {/* Daily Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Revenus du Jour</p>
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(dailyReport.summary.totalAmount)}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Paiements</p>
                          <p className="text-2xl font-bold text-gray-900">{dailyReport.summary.totalPayments}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Espèces</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(dailyReport.summary.paymentsByMethod['Espèce'] || 0)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Virements</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(dailyReport.summary.paymentsByMethod['Virement'] || 0)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Payments Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Paiements du {new Date(selectedDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Enfant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Méthode
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Heure
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reçu
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dailyReport.payments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {payment.child.firstName} {payment.child.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{payment.child.class}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="info" size="sm">{payment.type}</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.paymentMethod}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.paymentDate).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.receiptNumber}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {dailyReport.payments.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement</h3>
                        <p className="text-gray-500">Aucun paiement enregistré pour cette date</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;