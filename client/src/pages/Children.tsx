import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Baby,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users as UsersIcon
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import { useForm } from 'react-hook-form';

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  class: string;
  paymentMode: string;
  parent: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  isActive: boolean;
  enrollmentDate: string;
  notes?: string;
  age?: number;
}

interface ChildForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  class: string;
  paymentMode: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentAddress?: string;
  notes?: string;
}

const Children: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [viewingChild, setViewingChild] = useState<Child | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ChildForm>();

  const classes = ['Tous-Petits', 'Garderie', 'Crèche', 'Maternelle'];
  const paymentModes = ['Journalier', 'Mensuel', 'Trimestriel'];

  useEffect(() => {
    fetchChildren();
  }, [searchTerm, classFilter, paymentModeFilter]);

  const fetchChildren = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (classFilter) params.append('class', classFilter);
      if (paymentModeFilter) params.append('paymentMode', paymentModeFilter);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/children?${params}`);
      setChildren(response.data.children || response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Erreur lors du chargement des enfants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: ChildForm) => {
    try {
      const childData = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        class: data.class,
        paymentMode: data.paymentMode,
        parent: {
          name: data.parentName,
          phone: data.parentPhone,
          email: data.parentEmail,
          address: data.parentAddress
        },
        notes: data.notes
      };

      if (editingChild) {
        await axios.put(`${import.meta.env.VITE_API_URL}/children/${editingChild._id}`, childData);
        toast.success('Enfant modifié avec succès');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/children`, childData);
        toast.success('Enfant ajouté avec succès');
      }

      setIsModalOpen(false);
      setEditingChild(null);
      reset();
      fetchChildren();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setValue('firstName', child.firstName);
    setValue('lastName', child.lastName);
    setValue('dateOfBirth', child.dateOfBirth.split('T')[0]);
    setValue('class', child.class);
    setValue('paymentMode', child.paymentMode);
    setValue('parentName', child.parent.name);
    setValue('parentPhone', child.parent.phone);
    setValue('parentEmail', child.parent.email || '');
    setValue('parentAddress', child.parent.address || '');
    setValue('notes', child.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/children/${id}`);
        toast.success('Enfant supprimé avec succès');
        fetchChildren();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
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

  const getPaymentModeColor = (mode: string) => {
    const colors = {
      'Journalier': 'bg-orange-100 text-orange-800',
      'Mensuel': 'bg-blue-100 text-blue-800',
      'Trimestriel': 'bg-green-100 text-green-800'
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Enfants</h1>
          <p className="text-gray-600">Gérez les informations des enfants de la garderie</p>
        </div>
        <button
          onClick={() => {
            setEditingChild(null);
            reset();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un enfant</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un enfant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les modes de paiement</option>
            {paymentModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="w-4 h-4 mr-2" />
            {children.length} enfant{children.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <div key={child._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Baby className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {child.firstName} {child.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {calculateAge(child.dateOfBirth)} ans
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setViewingChild(child)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(child)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(child._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassColor(child.class)}`}>
                  {child.class}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentModeColor(child.paymentMode)}`}>
                  {child.paymentMode}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  <span>{child.parent.name}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{child.parent.phone}</span>
                </div>
                {child.parent.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{child.parent.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Inscrit le {new Date(child.enrollmentDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {children.length === 0 && (
        <div className="text-center py-12">
          <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enfant trouvé</h3>
          <p className="text-gray-500 mb-4">Commencez par ajouter votre premier enfant</p>
          <button
            onClick={() => {
              setEditingChild(null);
              reset();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un enfant</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingChild(null);
          reset();
        }}
        title={editingChild ? 'Modifier l\'enfant' : 'Ajouter un enfant'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                {...register('firstName', { required: 'Le prénom est requis' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                {...register('lastName', { required: 'Le nom est requis' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance *
              </label>
              <input
                {...register('dateOfBirth', { required: 'La date de naissance est requise' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <select
                {...register('class', { required: 'La classe est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.class && (
                <p className="text-red-500 text-sm mt-1">{errors.class.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement *
              </label>
              <select
                {...register('paymentMode', { required: 'Le mode de paiement est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un mode</option>
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
              {errors.paymentMode && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du parent *
              </label>
              <input
                {...register('parentName', { required: 'Le nom du parent est requis' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.parentName && (
                <p className="text-red-500 text-sm mt-1">{errors.parentName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone du parent *
              </label>
              <input
                {...register('parentPhone', { required: 'Le téléphone du parent est requis' })}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.parentPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.parentPhone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du parent
              </label>
              <input
                {...register('parentEmail')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse du parent
            </label>
            <textarea
              {...register('parentAddress')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
                setEditingChild(null);
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
              {editingChild ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Child Modal */}
      {viewingChild && (
        <Modal
          isOpen={!!viewingChild}
          onClose={() => setViewingChild(null)}
          title={`${viewingChild.firstName} ${viewingChild.lastName}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Baby className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {viewingChild.firstName} {viewingChild.lastName}
                </h3>
                <p className="text-gray-600">
                  {calculateAge(viewingChild.dateOfBirth)} ans • {viewingChild.class}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informations de l'enfant</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">
                      Né(e) le {new Date(viewingChild.dateOfBirth).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="info" size="sm">{viewingChild.class}</Badge>
                    <Badge variant="success" size="sm" className="ml-2">{viewingChild.paymentMode}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Inscrit le {new Date(viewingChild.enrollmentDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informations du parent</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">{viewingChild.parent.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">{viewingChild.parent.phone}</span>
                  </div>
                  {viewingChild.parent.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm">{viewingChild.parent.email}</span>
                    </div>
                  )}
                  {viewingChild.parent.address && (
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                      <span className="text-sm">{viewingChild.parent.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {viewingChild.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {viewingChild.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setViewingChild(null);
                  handleEdit(viewingChild);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Children;