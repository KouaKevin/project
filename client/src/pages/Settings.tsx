import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  // Bell, 
  Database,
  Shield,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import Badge from '../components/UI/Badge';

interface ProfileForm {
  name: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  paymentReminders: boolean;
  dailyReports: boolean;
  systemAlerts: boolean;
}

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'system'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    paymentReminders: true,
    dailyReports: false,
    systemAlerts: true
  });

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordForm>();

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'system', label: 'Système', icon: Database }
  ];

  const handleProfileUpdate = async (data: ProfileForm) => {
    try {
      await updateProfile(data);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Mot de passe modifié avec succès');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du mot de passe');
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Paramètres de notification mis à jour');
  };

  const handleBackupDatabase = async () => {
    try {
      toast.success('Sauvegarde en cours...');
      // Simulate backup process
      setTimeout(() => {
        toast.success('Sauvegarde terminée avec succès');
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleRestoreDatabase = () => {
    if (window.confirm('Êtes-vous sûr de vouloir restaurer la base de données ? Cette action est irréversible.')) {
      toast.success('Restauration en cours...');
      // Simulate restore process
      setTimeout(() => {
        toast.success('Restauration terminée avec succès');
      }, 3000);
    }
  };

  const handleClearCache = () => {
    toast.success('Cache vidé avec succès');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez vos préférences et paramètres système</p>
        </div>
        {/* <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <Badge variant={user?.role === 'admin' ? 'error' : 'info'} size="sm">
              {user?.role === 'admin' ? 'Administrateur' : 'Tata'}
            </Badge>
          </div>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Informations du profil</h2>
                  <p className="text-gray-600">Mettez à jour vos informations personnelles</p>
                </div>

                <form onSubmit={handleProfileSubmit(handleProfileUpdate)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        {...registerProfile('name', { required: 'Le nom est requis' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {profileErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        {...registerProfile('phone')}
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle
                      </label>
                      <input
                        type="text"
                        value={user?.role === 'admin' ? 'Administrateur' : 'Tata'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Save className="w-5 h-5" />
                      <span>Sauvegarder</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Changer le mot de passe</h2>
                  <p className="text-gray-600">Assurez-vous d'utiliser un mot de passe sécurisé</p>
                </div>

                <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel *
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('currentPassword', { required: 'Le mot de passe actuel est requis' })}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('newPassword', { 
                          required: 'Le nouveau mot de passe est requis',
                          minLength: {
                            value: 4,
                            message: 'Le mot de passe doit contenir au moins 4 caractères'
                          }
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword('confirmPassword', { required: 'La confirmation est requise' })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Lock className="w-5 h-5" />
                      <span>Changer le mot de passe</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Paramètres de notification</h2>
                  <p className="text-gray-600">Choisissez les notifications que vous souhaitez recevoir</p>
                </div>

                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => {
                    const labels = {
                      emailNotifications: 'Notifications par email',
                      paymentReminders: 'Rappels de paiement',
                      dailyReports: 'Rapports journaliers',
                      systemAlerts: 'Alertes système'
                    };

                    const descriptions = {
                      emailNotifications: 'Recevoir des notifications par email pour les événements importants',
                      paymentReminders: 'Recevoir des rappels pour les paiements en retard',
                      dailyReports: 'Recevoir un résumé quotidien des activités',
                      systemAlerts: 'Recevoir des alertes pour les problèmes système'
                    };

                    return (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {labels[key as keyof typeof labels]}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {descriptions[key as keyof typeof descriptions]}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key as keyof NotificationSettings)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            value ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'system' && user?.role === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Paramètres système</h2>
                  <p className="text-gray-600">Gérez les paramètres avancés du système</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Database Management */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Database className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Base de données</h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={handleBackupDatabase}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors duration-200"
                      >
                        <Download className="w-5 h-5" />
                        <span>Sauvegarder</span>
                      </button>
                      <button
                        onClick={handleRestoreDatabase}
                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center space-x-2 transition-colors duration-200"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Restaurer</span>
                      </button>
                    </div>
                  </div>

                  {/* System Maintenance */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Maintenance</h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={handleClearCache}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2 transition-colors duration-200"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Vider le cache</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations système</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Version:</span>
                      <span className="ml-2 text-gray-600">1.0.0</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Environnement:</span>
                      <span className="ml-2 text-gray-600">Production</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Base de données:</span>
                      <span className="ml-2 text-gray-600">MongoDB</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Dernière sauvegarde:</span>
                      <span className="ml-2 text-gray-600">Aujourd'hui à 03:00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && user?.role !== 'admin' && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Accès restreint</h3>
                <p className="text-gray-500">Seuls les administrateurs peuvent accéder aux paramètres système</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;