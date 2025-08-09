import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  CreditCard,
  AlertTriangle,
  Baby,
  Calendar,
  Eye
} from 'lucide-react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';

interface DashboardStats {
  totalChildren: number;
  totalUsers: number;
  todayRevenue: number;
  monthlyRevenue: number;
  todayPayments: number;
  monthlyPayments: number;
  overduePayments: number;
  childrenByClass: Array<{ _id: string; count: number }>;
  revenueByMethod: Array<{ _id: string; total: number; count: number }>;
  revenueTrend: Array<{ date: string; revenue: number; payments: number }>;
  recentPayments: Array<any>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement des statistiques</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ icon: Icon, title, value, change, color, badge }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {badge && (
        <div className="mt-3">
          {badge}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {isModalOpen && selectedPayment && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        onClick={() => setIsModalOpen(false)}
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4">Détails du paiement</h2>
      <div className="space-y-2">
        <div><strong>Enfant :</strong> {selectedPayment.child.firstName} {selectedPayment.child.lastName}</div>
        <div><strong>Classe :</strong> {selectedPayment.child.class}</div>
        <div><strong>Montant :</strong> {formatCurrency(selectedPayment.amount)}</div>
        <div><strong>Type :</strong> {selectedPayment.type}</div>
        <div><strong>Pour le(s) mois de :</strong> {selectedPayment.period || '—'}</div> 
        <div><strong>Méthode :</strong> {selectedPayment.paymentMethod}</div>
        <div><strong>Date :</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString('fr-FR')}</div>
        <div><strong>Notes :</strong> {selectedPayment.notes || '—'}</div>
        <div><strong>Numéro de reçu :</strong> {selectedPayment.receiptNumber || '—'}</div>
      </div>
    </div>
  </div>
)}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre garderie</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dernière mise à jour</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Baby}
          title="Total Enfants"
          value={stats.totalChildren}
          color="bg-blue-500"
        />
        <StatCard
          icon={CreditCard}
          title="Revenus Aujourd'hui"
          value={formatCurrency(stats.todayRevenue)}
          color="bg-green-500"
          badge={<Badge variant="info" size="sm">{stats.todayPayments} paiements</Badge>}
        />
        <StatCard
          icon={TrendingUp}
          title="Revenus du Mois"
          value={formatCurrency(stats.monthlyRevenue)}
          color="bg-purple-500"
          badge={<Badge variant="success" size="sm">{stats.monthlyPayments} paiements</Badge>}
        />
        <StatCard
          icon={AlertTriangle}
          title="Paiements en Retard"
          value={stats.overduePayments}
          color="bg-red-500"
          badge={stats.overduePayments > 0 && <Badge variant="error" size="sm">Action requise</Badge>}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Children by Class */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Classe</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.childrenByClass}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ _id, count }) => `${_id}: ${count}`}
              >
                {stats.childrenByClass.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Payment Method */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus par Méthode de Paiement (ce mois)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.revenueByMethod}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Montant']}
            />
            <Legend />
            <Bar dataKey="total" fill="#3B82F6" name="Montant Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Paiements Récents</h3>
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentPayments.map((payment) => (
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
                    {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    
  );
  
};

export default Dashboard;