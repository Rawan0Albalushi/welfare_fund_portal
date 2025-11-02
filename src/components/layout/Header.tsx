import React from 'react';
// Simple menu icon fallback
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
  drawerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode, setMode, actualMode } = useTheme();
  const { language, setLanguage, isRTL } = useLanguage();
  const { user, logout } = useAuth();

  console.log('🎯 [Header] Render at:', new Date().toISOString(), {
    hasUser: !!user,
    userName: user?.name
  });
  
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('❌ [Header] Logout failed, forcing client-side logout redirect.', e);
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

  const handleThemeChange = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

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
    <header className="fixed inset-x-0 top-0 z-40 shadow-2xl">
      {/* خلفية متناسقة مع الـ Sidebar */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 dark:from-violet-950 dark:via-fuchsia-950 dark:to-rose-950"></div>
      
      {/* طبقة تدرج ثانية للعمق والحيوية */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/40 via-purple-500/30 to-pink-500/40 dark:from-cyan-900/30 dark:via-purple-900/30 dark:to-pink-900/30"></div>
      
      {/* Overlay للتأثير الزجاجي */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/10 backdrop-blur-sm"></div>
      
      {/* خطوط ضوئية متحركة */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-300 via-fuchsia-300 to-transparent"></div>
      </div>

      <div className="relative h-16 sm:h-20 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {/* Menu Button - متناسق مع التصميم */}
        <button
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="group sm:hidden inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/25 dark:bg-white/15 backdrop-blur-md border-2 border-white/50 dark:border-white/30 text-white hover:bg-white/40 dark:hover:bg-white/25 hover:border-white/70 transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-fuchsia-500/30"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-180 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo/Title - متناسق مع التصميم */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3">
          <div className="flex sm:hidden items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/30 to-white/20 dark:from-white/20 dark:to-white/10 backdrop-blur-md border-2 border-white/40 shadow-xl shadow-cyan-500/20">
            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </div>
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-white/30 to-white/20 dark:from-white/20 dark:to-white/10 backdrop-blur-md border-2 border-white/40 shadow-xl shadow-cyan-500/20">
            <svg className="w-7 h-7 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </div>
          <h1 className="font-extrabold text-lg sm:text-2xl tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            {t('navigation.dashboard')}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher - متناسق مع التصميم */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="group px-2 sm:px-4 h-11 sm:h-12 rounded-2xl bg-white/25 dark:bg-white/15 backdrop-blur-md border-2 border-white/50 dark:border-white/30 hover:bg-white/40 dark:hover:bg-white/25 hover:border-white/70 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 text-white font-semibold flex items-center gap-1.5 sm:gap-2"
              title={t('settings.language')}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="hidden sm:inline drop-shadow-lg text-sm">{language === 'ar' ? 'العربية' : 'English'}</span>
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 drop-shadow-lg ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)}></div>
                
                {/* القائمة المنسدلة */}
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-48 sm:w-52 md:w-56 bg-gradient-to-br from-white via-white to-violet-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-violet-950/30 backdrop-blur-2xl shadow-2xl shadow-violet-500/30 rounded-3xl border-2 border-violet-200/50 dark:border-violet-800/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300`}>
                  {/* عنوان القائمة */}
                  <div className={`px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-violet-100/80 to-fuchsia-100/80 dark:from-violet-900/40 dark:to-fuchsia-900/40 border-b-2 border-violet-200/50 dark:border-violet-800/50`}>
                    <p className={`text-xs font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wider flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {t('settings.language')}
                    </p>
                  </div>

                  {/* الخيارات */}
                  <div className="p-1.5 sm:p-2">
                    <button 
                      onClick={() => handleLanguageChange('en')} 
                      className={`group w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 ${
                        language === 'en' 
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/40 scale-105' 
                          : 'hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/20 dark:hover:to-fuchsia-900/20 text-gray-700 dark:text-gray-300 hover:scale-102'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all flex-shrink-0 ${
                        language === 'en'
                          ? 'bg-white/20 border-2 border-white/40'
                          : 'bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-gray-700 dark:to-gray-600 group-hover:scale-110'
                      }`}>
                        <span className="text-xl sm:text-2xl">🇬🇧</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-xs sm:text-sm truncate ${language === 'en' ? 'drop-shadow-lg' : ''}`}>English</p>
                        <p className={`text-xs truncate ${language === 'en' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>United Kingdom</p>
                      </div>
                      {language === 'en' && (
                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/25 backdrop-blur-sm flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>

                    <button 
                      onClick={() => handleLanguageChange('ar')} 
                      className={`group w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 ${
                        language === 'ar' 
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/40 scale-105' 
                          : 'hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/20 dark:hover:to-fuchsia-900/20 text-gray-700 dark:text-gray-300 hover:scale-102'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all flex-shrink-0 ${
                        language === 'ar'
                          ? 'bg-white/20 border-2 border-white/40'
                          : 'bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-gray-700 dark:to-gray-600 group-hover:scale-110'
                      }`}>
                        <span className="text-xl sm:text-2xl">🇸🇦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-xs sm:text-sm truncate ${language === 'ar' ? 'drop-shadow-lg' : ''}`}>العربية</p>
                        <p className={`text-xs truncate ${language === 'ar' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>المملكة العربية</p>
                      </div>
                      {language === 'ar' && (
                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/25 backdrop-blur-sm flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
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

          {/* Theme Switcher - محسّن */}
          <button
            onClick={handleThemeChange}
            className="group relative inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/25 dark:bg-white/15 backdrop-blur-md border-2 border-white/50 dark:border-white/30 hover:bg-white/40 dark:hover:bg-white/25 hover:border-white/70 transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/40 overflow-hidden"
            title={actualMode === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg">
              {actualMode === 'dark' ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-in spin-in-180 duration-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-in spin-in-180 duration-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/0 via-yellow-300/0 to-amber-400/20 group-hover:from-amber-300/30 group-hover:via-yellow-300/20 group-hover:to-amber-400/40 transition-all duration-300"></div>
          </button>

          {/* User Menu - محسّن */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="group relative inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 dark:from-white/30 dark:to-white/10 backdrop-blur-md border-2 border-white/60 dark:border-white/40 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-110 active:scale-95 hover:border-white/80 overflow-hidden"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 via-fuchsia-300/30 to-violet-300/30 dark:from-pink-500/20 dark:via-fuchsia-500/20 dark:to-violet-500/20 rounded-2xl"></div>
              <span className="relative text-lg sm:text-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] font-black">{(user?.name?.charAt(0) || '?').toUpperCase()}</span>
            </button>
            {profileOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                
                {/* القائمة المنسدلة */}
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-60 sm:w-64 md:w-72 bg-gradient-to-br from-white via-white to-fuchsia-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-fuchsia-950/30 backdrop-blur-2xl shadow-2xl shadow-fuchsia-500/30 rounded-3xl border-2 border-fuchsia-200/50 dark:border-fuchsia-800/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300`}>
                  {/* بطاقة المستخدم */}
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 dark:from-violet-700 dark:via-fuchsia-700 dark:to-pink-700">
                    <div className={`flex items-center gap-2.5 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* أيقونة المستخدم */}
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-xl">
                          <span className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">{(user?.name?.charAt(0) || '?').toUpperCase()}</span>
                        </div>
                        {/* نقطة الحالة */}
                        <div className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} w-4 h-4 sm:w-5 sm:h-5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full shadow-lg`}></div>
                      </div>
                      
                      {/* معلومات المستخدم */}
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm sm:text-base font-black text-white drop-shadow-lg truncate">{user?.name}</p>
                        <p className="text-xs text-white/90 font-medium truncate mt-0.5">{user?.email}</p>
                        <div className={`mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-lg bg-white/20 backdrop-blur-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-white">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* الخيارات */}
                  <div className="p-1.5 sm:p-2 space-y-1">
                    {/* الملف الشخصي */}
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/settings');
                      }}
                      className={`group w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/20 dark:hover:to-fuchsia-900/20 flex items-center gap-2 sm:gap-3 hover:scale-102 active:scale-95 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 group-hover:scale-110 transition-all shadow-md flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 truncate">{t('navigation.settings')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Manage your account</p>
                      </div>
                      <svg className={`w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* سجل التدقيق */}
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/audit-logs');
                      }}
                      className={`group w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/20 dark:hover:to-yellow-900/20 flex items-center gap-2 sm:gap-3 hover:scale-102 active:scale-95 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 group-hover:scale-110 transition-all shadow-md flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 truncate">Audit Logs</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">View activity history</p>
                      </div>
                      <svg className={`w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* فاصل */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-1.5 sm:my-2"></div>

                    {/* زر تسجيل الخروج */}
                    <button 
                      onClick={handleLogout} 
                      className={`group w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 flex items-center gap-2 sm:gap-3 hover:scale-102 active:scale-95 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 group-hover:scale-110 transition-all shadow-md flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-red-600 dark:text-red-400 truncate">{t('auth.logout')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">End your session</p>
                      </div>
                      <svg className={`w-4 h-4 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 border-t border-violet-200/50 dark:border-violet-800/50">
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
