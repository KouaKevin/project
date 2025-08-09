import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Baby, 
  Calendar, 
  BarChart3, 
  Settings,
  UserCheck,
  Menu,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard', roles: ['admin'] },
    { icon: Baby, label: 'Enfants', path: '/children', roles: ['admin', 'tata'] },
    { icon: Clock, label: 'Présences', path: '/attendance', roles: ['admin', 'tata'] },
    { icon: CreditCard, label: 'Paiements', path: '/payments', roles: ['admin', 'tata'] },
    { icon: Menu, label: 'Menus', path: '/menus', roles: ['admin', 'tata'] },
    { icon: BarChart3, label: 'Rapports', path: '/reports', roles: ['admin'] },
    { icon: Users, label: 'Utilisateurs', path: '/users', roles: ['admin'] },
    { icon: Settings, label: 'Paramètres', path: '/settings', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'tata')
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center">
              <img src="LOGO-TOUP_TI.ico" alt="toupti"  />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">TOUP'TI</h1>
              <p className="text-sm text-gray-500">Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 uppercase">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;