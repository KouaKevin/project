import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  BarChart3,
  UserCheck,
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import { useAuth } from '../contexts/AuthContext';

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  class: string;
  parent: {
    name: string;
    phone: string;
  };
  isPresent?: boolean;
}

interface Attendance {
  _id: string;
  child: {
    _id: string;
    firstName: string;
    lastName: string;
    class: string;
    parent: {
      name: string;
      phone: string;
    };
  };
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  recordedBy: {
    name: string;
  };
  notes?: string;
  status: string;
}

interface AttendanceStats {
  date: string;
  totalPresent: number;
  totalChildren: number;
  absentCount: number;
  attendanceRate: string;
  attendanceByClass: Array<{ _id: string; count: number }>;
  weeklyStats: Array<{ _id: string; count: number }>;
}

const Attendance: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [classFilter, setClassFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [notes, setNotes] = useState('');

  const { user } = useAuth();
  const classes = ['Tous-Petits', 'Garderie', 'Crèche', 'Maternelle'];

  useEffect(() => {
    fetchAttendances();
    fetchChildren();
    fetchStats();
  }, [selectedDate, classFilter]);

  const fetchAttendances = async () => {
    try {
      const params = new URLSearchParams();
      params.append('date', selectedDate);
      if (classFilter) params.append('class', classFilter);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendance?${params}`);
      setAttendances(response.data.attendances || []);
    } catch (error) {
      console.error('Error fetching attendances:', error);
      toast.error('Erreur lors du chargement des présences');
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/children?date=${selectedDate}`);
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/stats?date=${selectedDate}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMarkAttendance = async (childId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/attendance`, {
        childId,
        notes
      });
      
      toast.success('Présence enregistrée avec succès');
      setIsMarkingModalOpen(false);
      setSelectedChild(null);
      setNotes('');
      fetchAttendances();
      fetchChildren();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette présence ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/attendance/${id}`);
        toast.success('Présence supprimée avec succès');
        fetchAttendances();
        fetchChildren();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getClassColor = (className: string) => {
    const colors = {
      'Tous-Petits': 'bg-pink-100 text-pink-800',
      'Garderie': 'bg-blue-100 text-blue-800',
      'Crèche': 'bg-green-100 text-green-800',
      'Maternelle': 'bg-purple-100 text-purple-800'
    };
    return colors[className as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredChildren = children.filter(child => {
    const matchesSearch = searchTerm === '' || 
      child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === '' || child.class === classFilter;
    
    return matchesSearch && matchesClass;
  });

  const presentChildren = filteredChildren.filter(child => child.isPresent);
  const absentChildren = filteredChildren.filter(child => !child.isPresent);

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
          <p className="text-gray-600">
            Marquez les présences des enfants pour le {new Date(selectedDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        {user?.role !== 'admin' && (
          <button
            onClick={() => setIsMarkingModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Marquer présence</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Présents</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Absents</p>
                <p className="text-2xl font-bold text-red-600">{stats.absentCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Enfants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChildren}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Taux de Présence</p>
                <p className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nom de l'enfant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setClassFilter('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Interface pour les Tatas - Liste des enfants */}
      {user?.role !== 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enfants Présents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  Enfants Présents ({presentChildren.length})
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {presentChildren.map((child) => (
                <div key={child._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassColor(child.class)}`}>
                          {child.class}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Présent</Badge>
                </div>
              ))}
              {presentChildren.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>Aucun enfant présent pour le moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Enfants Absents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
              <div className="flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">
                  Enfants Absents ({absentChildren.length})
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {absentChildren.map((child) => (
                <div key={child._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassColor(child.class)}`}>
                          {child.class}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedChild(child);
                      setIsMarkingModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Marquer présent
                  </button>
                </div>
              ))}
              {absentChildren.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />
                  <p>Tous les enfants sont présents !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interface Admin - Tableau des présences */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Détail des Présences - {new Date(selectedDate).toLocaleDateString('fr-FR')}
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
                    Classe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure d'arrivée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enregistré par
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((attendance) => (
                  <tr key={attendance._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {attendance.child.firstName} {attendance.child.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Parent: {attendance.child.parent.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassColor(attendance.child.class)}`}>
                        {attendance.child.class}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(attendance.checkInTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.recordedBy.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success" size="sm">
                        {attendance.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteAttendance(attendance._id)}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attendances.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune présence enregistrée</h3>
              <p className="text-gray-500">Aucune présence n'a été enregistrée pour cette date</p>
            </div>
          )}
        </div>
      )}

      {/* Modal pour marquer la présence */}
      <Modal
        isOpen={isMarkingModalOpen}
        onClose={() => {
          setIsMarkingModalOpen(false);
          setSelectedChild(null);
          setNotes('');
        }}
        title="Marquer la présence"
        size="md"
      >
        <div className="space-y-4">
          {!selectedChild ? (
            <>
              <p className="text-gray-600 mb-4">Sélectionnez un enfant à marquer présent :</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {absentChildren.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{child.class}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedChild.firstName} {selectedChild.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{selectedChild.class}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Remarques particulières..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedChild(null);
                    setNotes('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Retour
                </button>
                <button
                  onClick={() => handleMarkAttendance(selectedChild._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Marquer présent
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Attendance;