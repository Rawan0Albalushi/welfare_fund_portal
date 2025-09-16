import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { setMode, actualMode } = useTheme();
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as 'en' | 'ar');
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.checked ? 'dark' : 'light');
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">{t('settings.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Settings */}
        <section className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-card">
          <h2 className="text-lg font-semibold mb-3">{t('settings.language')}</h2>
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-300">{t('settings.language')}</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
            <p className="text-xs text-gray-500">Choose your preferred language for the interface</p>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-card">
          <h2 className="text-lg font-semibold mb-3">{t('settings.theme')}</h2>
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={actualMode === 'dark'}
              onChange={handleThemeChange}
              className="relative w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors appearance-none cursor-pointer checked:bg-primary-600"
            />
            <span className="text-sm">{actualMode === 'dark' ? t('settings.dark_theme') : t('settings.light_theme')}</span>
          </label>
          <p className="text-xs text-gray-500 mt-2">Toggle between light and dark theme</p>
        </section>
      </div>

      {/* System Information */}
      <section className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-card mt-4">
        <h2 className="text-lg font-semibold mb-3">System Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Current Language:</div>
            <div>{language === 'en' ? 'English' : 'العربية'}</div>
          </div>
          <div>
            <div className="text-gray-500">Current Theme:</div>
            <div>{actualMode === 'dark' ? 'Dark' : 'Light'}</div>
          </div>
          <div>
            <div className="text-gray-500">Direction:</div>
            <div>{language === 'ar' ? 'RTL (Right to Left)' : 'LTR (Left to Right)'}</div>
          </div>
          <div>
            <div className="text-gray-500">Version:</div>
            <div>v1.0.0</div>
          </div>
        </div>
      </section>
    </div>
  );
};
