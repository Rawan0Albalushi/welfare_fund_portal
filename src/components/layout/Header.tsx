import React from 'react';
// Simple menu icon fallback
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
  drawerOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { mode, setMode, actualMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  console.log('🎯 [Header] Render at:', new Date().toISOString(), {
    hasUser: !!user,
    userName: user?.name
  });
  
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    setLanguage(newLanguage);
    setLangOpen(false);
  };

  const handleThemeChange = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-indigoSoft-200/60 dark:border-gray-800">
      <div className="h-16 sm:h-20 flex items-center gap-3 px-4 sm:px-6">
        <button
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-indigoSoft-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-indigoSoft-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="inline-block w-4 h-4">☰</span>
        </button>

        <div className="flex-1 font-semibold text-lg sm:text-xl tracking-tight">
          {t('navigation.dashboard')}
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="px-3 h-10 rounded-xl border border-indigoSoft-200 dark:border-gray-700 hover:bg-indigoSoft-100 dark:hover:bg-gray-800 transition-colors"
              title={t('settings.language')}
            >
              {language === 'ar' ? 'العربية' : 'English'}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-card rounded-xl border border-indigoSoft-200 dark:border-gray-700 overflow-hidden">
                <button onClick={() => handleLanguageChange('en')} className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${language === 'en' ? 'font-semibold' : ''}`}>English</button>
                <button onClick={() => handleLanguageChange('ar')} className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${language === 'ar' ? 'font-semibold' : ''}`}>العربية</button>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={handleThemeChange}
            className="px-3 h-10 rounded-xl border border-indigoSoft-200 dark:border-gray-700 hover:bg-indigoSoft-100 dark:hover:bg-gray-800 transition-colors"
            title={actualMode === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {actualMode === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-800 shadow-sm hover:bg-primary-200 transition-colors"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              {(user?.name?.charAt(0) || '?').toUpperCase()}
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-card rounded-xl border border-indigoSoft-200 dark:border-gray-700 overflow-hidden">
                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{user?.name}</div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">{t('auth.logout')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
