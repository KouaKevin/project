import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar,
  ChefHat,
  Coffee,
  Utensils,
  Cookie
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface Menu {
  _id: string;
  weekStartDate: string;
  weekEndDate: string;
  meals: {
    monday: MealDay;
    tuesday: MealDay;
    wednesday: MealDay;
    thursday: MealDay;
    friday: MealDay;
    saturday: MealDay;
  };
  createdBy: {
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface MealDay {
  breakfast: string;
  lunch: string;
  snack: string;
}

interface MenuForm {
  weekStartDate: string;
  weekEndDate: string;
  mondayBreakfast: string;
  mondayLunch: string;
  mondaySnack: string;
  tuesdayBreakfast: string;
  tuesdayLunch: string;
  tuesdaySnack: string;
  wednesdayBreakfast: string;
  wednesdayLunch: string;
  wednesdaySnack: string;
  thursdayBreakfast: string;
  thursdayLunch: string;
  thursdaySnack: string;
  fridayBreakfast: string;
  fridayLunch: string;
  fridaySnack: string;
  saturdayBreakfast: string;
  saturdayLunch: string;
  saturdaySnack: string;
}

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [menuToDuplicate, setMenuToDuplicate] = useState<Menu | null>(null);

  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<MenuForm>();

  const days = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' }
  ];

  const mealTypes = [
    { key: 'breakfast', label: 'Petit-déjeuner', icon: Coffee, color: 'text-orange-600' },
    { key: 'lunch', label: 'Déjeuner', icon: Utensils, color: 'text-green-600' },
    { key: 'snack', label: 'Goûter', icon: Cookie, color: 'text-purple-600' }
  ];

  useEffect(() => {
    fetchMenus();
    fetchCurrentMenu();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/menus`);
      setMenus(response.data);
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast.error('Erreur lors du chargement des menus');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMenu = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/menus/current`);
      setCurrentMenu(response.data);
    } catch (error) {
      console.log('No current menu found');
    }
  };

  const handleCreateOrUpdate = async (data: MenuForm) => {
    try {
      const menuData = {
        weekStartDate: data.weekStartDate,
        weekEndDate: data.weekEndDate,
        meals: {
          monday: {
            breakfast: data.mondayBreakfast,
            lunch: data.mondayLunch,
            snack: data.mondaySnack
          },
          tuesday: {
            breakfast: data.tuesdayBreakfast,
            lunch: data.tuesdayLunch,
            snack: data.tuesdaySnack
          },
          wednesday: {
            breakfast: data.wednesdayBreakfast,
            lunch: data.wednesdayLunch,
            snack: data.wednesdaySnack
          },
          thursday: {
            breakfast: data.thursdayBreakfast,
            lunch: data.thursdayLunch,
            snack: data.thursdaySnack
          },
          friday: {
            breakfast: data.fridayBreakfast,
            lunch: data.fridayLunch,
            snack: data.fridaySnack
          },
          saturday: {
            breakfast: data.saturdayBreakfast,
            lunch: data.saturdayLunch,
            snack: data.saturdaySnack
          }
        }
      };

      if (editingMenu) {
        await axios.put(`${import.meta.env.VITE_API_URL}/menus/${editingMenu._id}`, menuData);
        toast.success('Menu modifié avec succès');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/menus`, menuData);
        toast.success('Menu créé avec succès');
      }

      setIsModalOpen(false);
      setEditingMenu(null);
      reset();
      fetchMenus();
      fetchCurrentMenu();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setValue('weekStartDate', menu.weekStartDate.split('T')[0]);
    setValue('weekEndDate', menu.weekEndDate.split('T')[0]);
    
    days.forEach(day => {
      const dayMeals = menu.meals[day.key as keyof typeof menu.meals];
      setValue(`${day.key}Breakfast` as keyof MenuForm, dayMeals.breakfast);
      setValue(`${day.key}Lunch` as keyof MenuForm, dayMeals.lunch);
      setValue(`${day.key}Snack` as keyof MenuForm, dayMeals.snack);
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/menus/${id}`);
        toast.success('Menu supprimé avec succès');
        fetchMenus();
        fetchCurrentMenu();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleDuplicate = (menu: Menu) => {
    setMenuToDuplicate(menu);
    setIsDuplicateModalOpen(true);
  };

  const handleDuplicateSubmit = async (data: { weekStartDate: string; weekEndDate: string }) => {
    if (!menuToDuplicate) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/menus/${menuToDuplicate._id}/duplicate`, {
        weekStartDate: data.weekStartDate,
        weekEndDate: data.weekEndDate
      });
      
      toast.success('Menu dupliqué avec succès');
      setIsDuplicateModalOpen(false);
      setMenuToDuplicate(null);
      fetchMenus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la duplication');
    }
  };

  const getWeekDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    const end = new Date(endDate).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  const isCurrentWeek = (menu: Menu) => {
    const today = new Date();
    const startDate = new Date(menu.weekStartDate);
    const endDate = new Date(menu.weekEndDate);
    return today >= startDate && today <= endDate;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Menus</h1>
          <p className="text-gray-600">Planifiez les repas de la semaine pour les enfants</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setEditingMenu(null);
              reset();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau menu</span>
          </button>
        )}
      </div>

      {/* Current Menu */}
      {currentMenu && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Menu de la semaine actuelle</h2>
                <p className="text-blue-600 font-medium">
                  {getWeekDateRange(currentMenu.weekStartDate, currentMenu.weekEndDate)}
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">Actuel</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map(day => (
              <div key={day.key} className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">{day.label}</h3>
                <div className="space-y-2">
                  {mealTypes.map(meal => {
                    const MealIcon = meal.icon;
                    const dayMeals = currentMenu.meals[day.key as keyof typeof currentMenu.meals];
                    const mealContent = dayMeals[meal.key as keyof MealDay];
                    
                    return (
                      <div key={meal.key} className="flex items-start space-x-2">
                        <MealIcon className={`w-4 h-4 mt-0.5 ${meal.color}`} />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600">{meal.label}</p>
                          <p className="text-sm text-gray-900">{mealContent || 'Non défini'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menus List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tous les menus</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {menus.map((menu) => (
            <div key={menu._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Semaine du {getWeekDateRange(menu.weekStartDate, menu.weekEndDate)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Créé par {menu.createdBy.name} le {new Date(menu.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isCurrentWeek(menu) && (
                    <Badge variant="success" size="sm">Semaine actuelle</Badge>
                  )}
                  
                  {user?.role === 'admin' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDuplicate(menu)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(menu)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(menu._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {days.map(day => (
                  <div key={day.key} className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 text-sm mb-2">{day.label}</h5>
                    <div className="space-y-1">
                      {mealTypes.map(meal => {
                        const dayMeals = menu.meals[day.key as keyof typeof menu.meals];
                        const mealContent = dayMeals[meal.key as keyof MealDay];
                        
                        return (
                          <div key={meal.key} className="text-xs">
                            <span className="font-medium text-gray-600">{meal.label}:</span>
                            <span className="text-gray-900 ml-1">
                              {mealContent || 'Non défini'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {menus.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun menu trouvé</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre premier menu</p>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setEditingMenu(null);
                  reset();
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Créer un menu</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Menu Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMenu(null);
          reset();
        }}
        title={editingMenu ? 'Modifier le menu' : 'Nouveau menu'}
        size="xl"
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                {...register('weekStartDate', { required: 'La date de début est requise' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.weekStartDate && (
                <p className="text-red-500 text-sm mt-1">{errors.weekStartDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                {...register('weekEndDate', { required: 'La date de fin est requise' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.weekEndDate && (
                <p className="text-red-500 text-sm mt-1">{errors.weekEndDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {days.map(day => (
              <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">{day.label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mealTypes.map(meal => (
                    <div key={meal.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {meal.label}
                      </label>
                      <textarea
                        {...register(`${day.key}${meal.key.charAt(0).toUpperCase() + meal.key.slice(1)}` as keyof MenuForm)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`${meal.label} du ${day.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingMenu(null);
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
              {editingMenu ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Duplicate Menu Modal */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => {
          setIsDuplicateModalOpen(false);
          setMenuToDuplicate(null);
        }}
        title="Dupliquer le menu"
        size="md"
      >
        <form onSubmit={handleSubmit(handleDuplicateSubmit)} className="space-y-4">
          <p className="text-gray-600">
            Dupliquer le menu de la semaine du{' '}
            {menuToDuplicate && getWeekDateRange(menuToDuplicate.weekStartDate, menuToDuplicate.weekEndDate)}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle date de début *
              </label>
              <input
                {...register('weekStartDate', { required: 'La date de début est requise' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle date de fin *
              </label>
              <input
                {...register('weekEndDate', { required: 'La date de fin est requise' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                setMenuToDuplicate(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Dupliquer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Menus;