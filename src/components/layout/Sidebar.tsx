import React from 'react';
// Using text/icon placeholders instead of MUI icons
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();

  const navigationItems: NavigationItem[] = React.useMemo(() => [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <span>📊</span>,
      path: '/dashboard',
    },
    {
      id: 'categories',
      label: t('navigation.categories'),
      icon: <span>🏷️</span>,
      path: '/categories',
    },
    {
      id: 'programs',
      label: t('navigation.programs'),
      icon: <span>🎓</span>,
      path: '/programs',
    },
    {
      id: 'applications',
      label: t('navigation.applications'),
      icon: <span>📄</span>,
      path: '/applications',
    },
    {
      id: 'donations',
      label: t('navigation.donations'),
      icon: <span>💗</span>,
      path: '/donations',
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: <span>⚙️</span>,
      path: '/settings',
    },
  ], [t]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawerContent = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-5">
        <div className="inline-flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">WF</div>
          <div>
            <div className="text-base font-semibold tracking-tight">Welfare Fund</div>
            <div className="text-xs text-gray-500">Admin Portal</div>
          </div>
        </div>
      </div>
      <div className="h-px bg-indigoSoft-200 dark:bg-gray-800" />
      <nav className="flex-1 py-3">
        {navigationItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`relative group w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl mx-2 transition-all ${selected ? 'bg-primary-50 text-primary-900 ring-1 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-100 dark:ring-primary-800 font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-indigoSoft-100 dark:hover:bg-gray-800'}`}
            >
              {/* Active indicator */}
              {selected && (
                <span className={`absolute inset-y-1.5 ${isRTL ? 'right-1' : 'left-1'} w-1 rounded-full bg-primary-500`} />
              )}
              <span className="inline-flex items-center justify-center w-5 h-5">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              <span className={`ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'mr-auto ml-0' : ''}`}>›</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div
      className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 sm:hidden transition-transform duration-200 ${open ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}`}
      style={{ width: drawerWidth }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute top-0 bottom-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur border-r border-gray-200 dark:border-gray-800">
        {drawerContent}
      </aside>
    </div>
  );
};

export const PermanentSidebar: React.FC<{ drawerWidth: number }> = ({ drawerWidth }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();

  const navigationItems: NavigationItem[] = React.useMemo(() => [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <span>📊</span>,
      path: '/dashboard',
    },
    {
      id: 'categories',
      label: t('navigation.categories'),
      icon: <span>🏷️</span>,
      path: '/categories',
    },
    {
      id: 'programs',
      label: t('navigation.programs'),
      icon: <span>🎓</span>,
      path: '/programs',
    },
    {
      id: 'applications',
      label: t('navigation.applications'),
      icon: <span>📄</span>,
      path: '/applications',
    },
    {
      id: 'donations',
      label: t('navigation.donations'),
      icon: <span>💗</span>,
      path: '/donations',
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: <span>⚙️</span>,
      path: '/settings',
    },
  ], [t]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const drawerContent = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-5">
        <div className="inline-flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">WF</div>
          <div>
            <div className="text-base font-semibold tracking-tight">Welfare Fund</div>
            <div className="text-xs text-gray-500">Admin Portal</div>
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-800" />
      <nav className="flex-1 py-3">
        {navigationItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`relative group w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all ${selected ? 'bg-primary-50 text-primary-900 ring-1 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-100 dark:ring-primary-800 font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {selected && (
                <span className={`absolute inset-y-1.5 ${isRTL ? 'right-1' : 'left-1'} w-1 rounded-full bg-primary-500`} />
              )}
              <span className="inline-flex items-center justify-center w-5 h-5">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              <span className={`ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'mr-auto ml-0' : ''}`}>›</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside
      className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} hidden sm:flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur border-r border-gray-200 dark:border-gray-800`}
      style={{ width: drawerWidth }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {drawerContent}
    </aside>
  );
};
