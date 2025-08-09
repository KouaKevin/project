import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import { useForm } from 'react-hook-form';

interface Payment {
  _id: string;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    class: string;
  };
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  type: string;
  period?: string;
  receiptNumber: string;
  status: string;
  recordedBy: {
    name: string;
  };
  notes?: string;
}

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  class: string;
  paymentMode: string;
}

interface PaymentForm {
  childId: string;
  amount: number;
  paymentMethod: string;
  type: string;
  period?: string;
  notes?: string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    totalToday: 0,
    totalMonth: 0,
    countToday: 0,
    countMonth: 0
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PaymentForm>();

  const paymentMethods = ['Espèce', 'Virement', 'Mobile Money'];
  const paymentTypes = ['Journalier', 'Mensuel', 'Trimestriel'];
  const paymentStatuses = ['Payé', 'En attente', 'En retard'];

  const selectedType = watch('type');

  useEffect(() => {
    fetchPayments();
    fetchChildren();
    fetchStats();
  }, [searchTerm, statusFilter, typeFilter, startDate, endDate]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments?${params}`);
      setPayments(response.data.payments || response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/children`);
      setChildren(response.data.children || response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [todayResponse, monthResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/payments/daily-report?date=${today}`),
        axios.get(`${import.meta.env.VITE_API_URL}/payments?startDate=${startOfMonth}`)
      ]);

      const todayData = todayResponse.data.summary;
      const monthData = monthResponse.data.payments || monthResponse.data;

      setStats({
        totalToday: todayData.totalAmount || 0,
        countToday: todayData.totalPayments || 0,
        totalMonth: monthData.reduce((sum: number, p: Payment) => sum + p.amount, 0),
        countMonth: monthData.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  // cette fonctoon ne marche pas correcetement 
  const handleCreatePayment = async (data: PaymentForm) => {
    try {
      const selectedChild = children.find(c => c._id === data.childId);
      if (!selectedChild) {
        toast.error('Enfant non trouvé');
        return;
      }

      const paymentData = {
        child: data.childId, // <-- le champ doit s'appeler 'child'
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        type: data.type,
        period: data.type !== 'Journalier' ? data.period : undefined,
        notes: data.notes,
        receiptNumber: `REC-${Date.now()}` // <-- génère un numéro de reçu unique
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/payments`, paymentData);
      toast.success('Paiement enregistré avec succès');

      setIsModalOpen(false);
      reset();
      fetchPayments();
      fetchStats();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      console.log(response);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erreur lors du téléchargement du reçu');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Payé': 'success',
      'En attente': 'warning',
      'En retard': 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Journalier': 'bg-orange-100 text-orange-800',
      'Mensuel': 'bg-blue-100 text-blue-800',
      'Trimestriel': 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
          <p className="text-gray-600">Enregistrez et suivez les paiements des parents</p>
        </div>
        <button
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau paiement</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalToday)}</p>
              <p className="text-sm text-gray-500">{stats.countToday} paiements</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalMonth)}</p>
              <p className="text-sm text-gray-500">{stats.countMonth} paiements</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total paiements</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              <p className="text-sm text-gray-500">Tous les temps</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">En retard</p>
              <p className="text-2xl font-bold text-red-600">
                {payments.filter(p => p.status === 'En retard').length}
              </p>
              <p className="text-sm text-gray-500">Paiements</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            {paymentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Date début"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Date fin"
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
              setStartDate('');
              setEndDate('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reçu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(payment.type)}`}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(payment.status) as any} size="sm">
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.receiptNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadReceipt(payment._id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Reçu</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
            <p className="text-gray-500 mb-4">Commencez par enregistrer votre premier paiement</p>
            <button
              onClick={() => {
                reset();
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau paiement</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Nouveau paiement"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreatePayment)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enfant *
              </label>
              <select
                {...register('childId', { required: 'L\'enfant est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un enfant</option>
                {children.map(child => (
                  <option key={child._id} value={child._id}>
                    {child.firstName} {child.lastName} - {child.class}
                  </option>
                ))}
              </select>
              {errors.childId && (
                <p className="text-red-500 text-sm mt-1">{errors.childId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (FCFA) *
              </label>
              <input
                {...register('amount', {
                  required: 'Le montant est requis',
                  min: { value: 1, message: 'Le montant doit être positif' }
                })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de paiement *
              </label>
              <select
                {...register('type', { required: 'Le type est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un type</option>
                {paymentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement *
              </label>
              <select
                {...register('paymentMethod', { required: 'La méthode est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une méthode</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
              )}
            </div>
          </div>

          {selectedType && selectedType !== 'Journalier' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période *
              </label>
              <input
                {...register('period', {
                  required: selectedType !== 'Journalier' ? 'La période est requise' : false
                })}
                type="month"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.period && (
                <p className="text-red-500 text-sm mt-1">{errors.period.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;