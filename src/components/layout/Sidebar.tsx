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
  const [searchQuery, setSearchQuery] = React.useState('');

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
      id: 'campaigns',
      label: t('navigation.campaigns'),
      icon: <span>🎯</span>,
      path: '/campaigns',
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
      id: 'financialReport',
      label: t('navigation.financial_report'),
      icon: <span>📈</span>,
      path: '/financial-report',
    },
    {
      id: 'users',
      label: t('navigation.users'),
      icon: <span>👥</span>,
      path: '/users',
    },
    {
      id: 'auditLogs',
      label: t('navigation.audit_logs'),
      icon: <span>🧾</span>,
      path: '/audit-logs',
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

  // Filter navigation items based on search query
  const filteredNavigationItems = React.useMemo(() => {
    if (!searchQuery.trim()) return navigationItems;
    const query = searchQuery.toLowerCase();
    return navigationItems.filter(item => 
      item.label.toLowerCase().includes(query)
    );
  }, [navigationItems, searchQuery]);

  const drawerContent = (
    <div className="h-full flex flex-col relative overflow-hidden pt-20">
      {/* خلفية متدرجة جميلة */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
      
      {/* دوائر ديكور في الخلفية */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 -left-20 w-64 h-64 bg-gradient-to-br from-violet-300 to-fuchsia-300 dark:from-violet-900 dark:to-fuchsia-900 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-pink-300 to-rose-300 dark:from-pink-900 dark:to-rose-900 rounded-full blur-3xl"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Search Box */}
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search') || 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-2.5 pl-10 pr-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm focus:outline-none focus:border-violet-500 dark:focus:border-violet-600 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <svg className={`absolute top-2.5 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-2.5 ${isRTL ? 'left-3' : 'right-3'} w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 sm:py-4 px-2 sm:px-3 space-y-1 sm:space-y-1.5 overflow-y-auto">
          {filteredNavigationItems.length > 0 ? filteredNavigationItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`relative group w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-700 dark:to-fuchsia-700 text-white shadow-xl shadow-violet-500/40 scale-105' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 hover:shadow-lg hover:scale-102 active:scale-95'
                }`}
              >
                {/* Active glow effect */}
                {selected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 rounded-2xl blur-xl"></div>
                )}
                
                {/* Icon with background */}
                <span className={`relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all flex-shrink-0 ${
                  selected 
                    ? 'bg-white/25 backdrop-blur-sm border-2 border-white/40 shadow-lg' 
                    : 'bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-gray-800 dark:to-gray-700 group-hover:scale-110'
                }`}>
                  <span className={`text-lg sm:text-xl ${selected ? 'drop-shadow-lg' : ''}`}>{item.icon}</span>
                </span>

                {/* Label */}
                <span className={`relative truncate flex-1 ${selected ? 'drop-shadow-lg' : ''}`}>{item.label}</span>

                {/* Arrow indicator */}
                {selected ? (
                  <span className={`relative flex-shrink-0 text-white drop-shadow-lg animate-pulse`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className={`relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all text-violet-600 dark:text-violet-400`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
            </div>
          )}
        </nav>

        {/* Footer decoration */}
        <div className="p-3 sm:p-4">
          <div className="h-1 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 dark:from-violet-700 dark:via-fuchsia-700 dark:to-pink-700 shadow-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30 sm:hidden transition-transform duration-300 ${open ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}`}
      style={{ width: drawerWidth }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute top-0 bottom-0 w-full backdrop-blur-xl shadow-2xl shadow-violet-500/20">
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
  const [searchQuery, setSearchQuery] = React.useState('');

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
      id: 'campaigns',
      label: t('navigation.campaigns'),
      icon: <span>🎯</span>,
      path: '/campaigns',
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
      id: 'financialReport',
      label: t('navigation.financial_report'),
      icon: <span>📈</span>,
      path: '/financial-report',
    },
    {
      id: 'users',
      label: t('navigation.users'),
      icon: <span>👥</span>,
      path: '/users',
    },
    {
      id: 'auditLogs',
      label: t('navigation.audit_logs'),
      icon: <span>🧾</span>,
      path: '/audit-logs',
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

  // Filter navigation items based on search query
  const filteredNavigationItems = React.useMemo(() => {
    if (!searchQuery.trim()) return navigationItems;
    const query = searchQuery.toLowerCase();
    return navigationItems.filter(item => 
      item.label.toLowerCase().includes(query)
    );
  }, [navigationItems, searchQuery]);

  const drawerContent = (
    <div className="h-full flex flex-col relative overflow-hidden pt-20">
      {/* خلفية متدرجة جميلة */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
      
      {/* دوائر ديكور في الخلفية */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 -left-20 w-64 h-64 bg-gradient-to-br from-violet-300 to-fuchsia-300 dark:from-violet-900 dark:to-fuchsia-900 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-pink-300 to-rose-300 dark:from-pink-900 dark:to-rose-900 rounded-full blur-3xl"></div>
      </div>

      {/* المحتوى */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Search Box */}
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search') || 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-2.5 pl-10 pr-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm focus:outline-none focus:border-violet-500 dark:focus:border-violet-600 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <svg className={`absolute top-2.5 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-2.5 ${isRTL ? 'left-3' : 'right-3'} w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 sm:py-4 px-2 sm:px-3 space-y-1 sm:space-y-1.5 overflow-y-auto">
          {filteredNavigationItems.length > 0 ? filteredNavigationItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`relative group w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-700 dark:to-fuchsia-700 text-white shadow-xl shadow-violet-500/40 scale-105' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/5 hover:shadow-lg hover:scale-102 active:scale-95'
                }`}
              >
                {/* Active glow effect */}
                {selected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 rounded-2xl blur-xl"></div>
                )}
                
                {/* Icon with background */}
                <span className={`relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all flex-shrink-0 ${
                  selected 
                    ? 'bg-white/25 backdrop-blur-sm border-2 border-white/40 shadow-lg' 
                    : 'bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-gray-800 dark:to-gray-700 group-hover:scale-110'
                }`}>
                  <span className={`text-lg sm:text-xl ${selected ? 'drop-shadow-lg' : ''}`}>{item.icon}</span>
                </span>

                {/* Label */}
                <span className={`relative truncate flex-1 ${selected ? 'drop-shadow-lg' : ''}`}>{item.label}</span>

                {/* Arrow indicator */}
                {selected ? (
                  <span className={`relative flex-shrink-0 text-white drop-shadow-lg animate-pulse`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className={`relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all text-violet-600 dark:text-violet-400`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
            </div>
          )}
        </nav>

        {/* Footer decoration */}
        <div className="p-3 sm:p-4">
          <div className="h-1 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 dark:from-violet-700 dark:via-fuchsia-700 dark:to-pink-700 shadow-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <aside
      className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30 hidden sm:flex flex-col backdrop-blur-xl shadow-2xl shadow-violet-500/10`}
      style={{ width: drawerWidth }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {drawerContent}
    </aside>
  );
};
