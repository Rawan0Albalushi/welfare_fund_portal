import React from 'react';
// Simple menu icon fallback
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';

interface HeaderProps {
  onMenuClick: () => void;
  drawerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, setLanguage, isRTL } = useLanguage();
  const { user, logout } = useAuth();

  logger.debug('Header render', {
    hasUser: !!user,
    userName: user?.name
  });
  
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      logger.error('Logout failed, forcing client-side logout redirect', e);
      // Ensure client-side cleanup on failure as well
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } finally {
      setProfileOpen(false);
      // Redirect to login after logout
      window.location.href = '/login';
    }
  };

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    setLanguage(newLanguage);
    setLangOpen(false);
  };

  // Theme toggle removed from header

  // إغلاق القوائم عند الضغط على Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLangOpen(false);
        setProfileOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200/50 dark:border-gray-800/50">
      {/* Modern Glass Morphism Background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
      
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/10 via-purple-200/10 to-transparent dark:via-blue-800/5 dark:via-purple-800/5 animate-pulse opacity-50"></div>
      
      {/* Elegant top accent line with shimmer effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 via-purple-400/40 to-transparent dark:via-blue-500/20 dark:via-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'shimmer 3s ease-in-out infinite' }}></div>
      </div>
      
      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }
      `}</style>
      
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 via-purple-300/30 to-transparent dark:via-blue-600/15 dark:via-purple-600/15"></div>

      <div className="relative h-16 sm:h-20 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left Section: Menu & Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Menu Button - Modern Minimal */}
          <button
            aria-label="Open sidebar"
            onClick={onMenuClick}
            className="group sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:shadow-blue-500/10"
          >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo/Title - Elegant */}
          <div className="flex items-center gap-3">
            <img
              src="/images/welfarefund.jpg"
              alt="Welfare Fund logo"
              className="h-12 w-auto sm:h-16 rounded-xl object-contain bg-white shadow-lg shadow-blue-500/30"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-xl lg:text-2xl tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-gray-100 dark:via-blue-100 dark:to-gray-100 bg-clip-text text-transparent hover:from-blue-800 hover:via-purple-800 hover:to-pink-800 dark:hover:from-blue-200 dark:hover:via-purple-200 dark:hover:to-pink-200 transition-all duration-300">
                {t('navigation.dashboard')}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher - Modern Elegant */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="group relative px-3 sm:px-4 h-10 sm:h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 dark:hover:from-blue-950/30 dark:hover:via-purple-950/30 dark:hover:to-pink-950/30 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md hover:shadow-blue-500/10 overflow-hidden"
              title={t('settings.language')}
            >
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-200/0 via-purple-200/0 to-pink-200/0 group-hover:from-blue-200/20 group-hover:via-purple-200/20 group-hover:to-pink-200/20 transition-all duration-300 blur-sm"></div>
              <svg className="relative w-4 h-4 sm:w-5 sm:h-5 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="relative hidden sm:inline text-sm font-semibold z-10">{language === 'ar' ? 'العربية' : 'English'}</span>
              <svg className={`relative w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 z-10 ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)}></div>
                
                {/* Elegant Dropdown */}
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white dark:bg-gray-800 backdrop-blur-xl shadow-2xl shadow-blue-500/10 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                  {/* Header */}
                  <div className={`px-4 py-3 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b border-gray-200 dark:border-gray-700`}>
                    <p className={`text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {t('settings.language')}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="p-2">
                    <button 
                      onClick={() => handleLanguageChange('en')} 
                      className={`group w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                        language === 'en' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border hover:border-blue-200 dark:hover:border-blue-800 text-gray-700 dark:text-gray-300'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all flex-shrink-0 ${
                        language === 'en'
                          ? 'bg-white/20'
                          : 'bg-gray-200 dark:bg-gray-700 group-hover:scale-110'
                      }`}>
                        <span className="text-xl">🇬🇧</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${language === 'en' ? 'text-white' : ''}`}>English</p>
                        <p className={`text-xs truncate ${language === 'en' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>United Kingdom</p>
                      </div>
                      {language === 'en' && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>

                    <button 
                      onClick={() => handleLanguageChange('ar')} 
                      className={`group w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 mt-2 ${
                        language === 'ar' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border hover:border-blue-200 dark:hover:border-blue-800 text-gray-700 dark:text-gray-300'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all flex-shrink-0 ${
                        language === 'ar'
                          ? 'bg-white/20'
                          : 'bg-gray-200 dark:bg-gray-700 group-hover:scale-110'
                      }`}>
                        <span className="text-xl">🇸🇦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${language === 'ar' ? 'text-white' : ''}`}>العربية</p>
                        <p className={`text-xs truncate ${language === 'ar' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>المملكة العربية</p>
                      </div>
                      {language === 'ar' && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
              </div>
              </>
            )}
          </div>

          {/* Theme switcher removed */}

          {/* User Menu - Elegant */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="group/user relative inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20 dark:border-white/10 overflow-hidden"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover/user:opacity-40 blur-md transition-opacity duration-300"></div>
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/user:translate-x-full transition-transform duration-700"></div>
              <span className="relative text-sm sm:text-base font-bold drop-shadow-sm z-10">{(user?.name?.charAt(0) || '?').toUpperCase()}</span>
            </button>
            {profileOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                
                {/* Elegant User Dropdown */}
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-72 bg-white dark:bg-gray-800 backdrop-blur-xl shadow-2xl shadow-purple-500/10 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                  {/* User Card Header */}
                  <div className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700">
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* User Avatar */}
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
                          <span className="text-lg font-bold text-white">{(user?.name?.charAt(0) || '?').toUpperCase()}</span>
                        </div>
                        {/* Status Indicator */}
                        <div className={`absolute -bottom-0.5 ${isRTL ? '-left-0.5' : '-right-0.5'} w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full`}></div>
                      </div>
                      
                      {/* User Info */}
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-white/90 truncate mt-0.5">{user?.email}</p>
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span className="text-xs font-semibold text-white">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2 space-y-1">
                    {/* Settings */}
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/settings');
                      }}
                      className={`group w-full px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border hover:border-blue-200 dark:hover:border-blue-800 flex items-center gap-3 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:scale-110 transition-all flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{t('navigation.settings')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Manage your account</p>
                      </div>
                      <svg className={`w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

                    {/* Logout */}
                    <button 
                      onClick={handleLogout} 
                      className={`group w-full px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:via-pink-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:via-pink-900/20 dark:hover:to-rose-900/20 hover:border hover:border-red-200 dark:hover:border-red-800 flex items-center gap-3 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:scale-110 transition-all flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-red-600 dark:text-red-400 truncate">{t('auth.logout')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">End your session</p>
                      </div>
                      <svg className={`w-4 h-4 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">Welfare Fund Admin Portal</p>
                  </div>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
