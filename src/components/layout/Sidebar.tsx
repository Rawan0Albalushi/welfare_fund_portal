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
      id: 'banners',
      label: t('navigation.banners'),
      icon: <span>🖼️</span>,
      path: '/banners',
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
    <div className="h-full flex flex-col relative overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Modern Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
      
      {/* Subtle Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 via-purple-400/30 to-transparent dark:via-blue-500/10 dark:via-purple-500/10"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col pt-4">
        
        {/* Logo Section - Modern */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3">
            <img src="/images/welfarefund.jpg" alt="Welfare Fund logo" className="h-12 w-auto rounded-xl object-contain bg-white shadow-lg shadow-blue-500/30" />
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100">Welfare Fund</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</p>
            </div>
          </div>
        </div>
        
        {/* Search Box - Elegant */}
        <div className="px-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search') || 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2.5 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'} [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden`}
            />
            <svg className={`absolute top-2.5 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400 pointer-events-none`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-2.5 ${isRTL ? 'left-3' : 'right-3'} w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation - Modern & Organized */}
        <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
          {filteredNavigationItems.length > 0 ? filteredNavigationItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`relative group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-purple-500/30' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 dark:hover:from-blue-950/30 dark:hover:via-purple-950/30 dark:hover:to-pink-950/30 hover:border hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                {/* Active indicator */}
                {selected && (
                  <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm`}></div>
                )}
                
                {/* Icon */}
                <span className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 flex-shrink-0 ${
                  selected 
                    ? 'bg-white/25 shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/40 dark:group-hover:to-purple-900/40 group-hover:scale-110'
                }`}>
                  <span className="text-base">{item.icon}</span>
                </span>

                {/* Label */}
                <span className={`relative truncate flex-1 ${isRTL ? 'text-right' : 'text-left'} ${selected ? 'font-semibold' : ''}`}>{item.label}</span>

                {/* Arrow indicator */}
                {selected && (
                  <svg className={`w-4 h-4 text-white flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
            </div>
          )}
        </nav>

        {/* Footer - Minimal */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">© 2024 Welfare Fund</p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30 sm:hidden transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}`}
      style={{ width: drawerWidth }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute top-0 bottom-0 w-full shadow-2xl">
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
      id: 'banners',
      label: t('navigation.banners'),
      icon: <span>🖼️</span>,
      path: '/banners',
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
    <div className="h-full flex flex-col relative overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Modern Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
      
      {/* Subtle Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 via-purple-400/30 to-transparent dark:via-blue-500/10 dark:via-purple-500/10"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col pt-4">
        
        {/* Logo Section - Modern */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3">
            <img src="/images/welfarefund.jpg" alt="Welfare Fund logo" className="h-12 w-auto rounded-xl object-contain bg-white shadow-lg shadow-blue-500/30" />
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100">Welfare Fund</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</p>
            </div>
          </div>
        </div>
        
        {/* Search Box - Elegant */}
        <div className="px-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search') || 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2.5 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'} [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden`}
            />
            <svg className={`absolute top-2.5 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400 pointer-events-none`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-2.5 ${isRTL ? 'left-3' : 'right-3'} w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation - Modern & Organized */}
        <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
          {filteredNavigationItems.length > 0 ? filteredNavigationItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`relative group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-purple-500/30' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 dark:hover:from-blue-950/30 dark:hover:via-purple-950/30 dark:hover:to-pink-950/30 hover:border hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                {/* Active indicator */}
                {selected && (
                  <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm`}></div>
                )}
                
                {/* Icon */}
                <span className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 flex-shrink-0 ${
                  selected 
                    ? 'bg-white/25 shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/40 dark:group-hover:to-purple-900/40 group-hover:scale-110'
                }`}>
                  <span className="text-base">{item.icon}</span>
                </span>

                {/* Label */}
                <span className={`relative truncate flex-1 ${isRTL ? 'text-right' : 'text-left'} ${selected ? 'font-semibold' : ''}`}>{item.label}</span>

                {/* Arrow indicator */}
                {selected && (
                  <svg className={`w-4 h-4 text-white flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
            </div>
          )}
        </nav>

        {/* Footer - Minimal */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">© 2024 Welfare Fund</p>
        </div>
      </div>
    </div>
  );

  return (
    <aside
      className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30 hidden sm:flex flex-col shadow-lg`}
      style={{ width: drawerWidth }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {drawerContent}
    </aside>
  );
};
