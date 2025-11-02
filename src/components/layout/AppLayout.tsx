import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar, PermanentSidebar } from './Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 260;

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isRTL } = useLanguage();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('error');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  React.useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent)?.detail || {};
        const message: string = detail.message || 'Something went wrong';
        const severity: 'success' | 'info' | 'warning' | 'error' = detail.severity || 'error';
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
        // Auto hide
        window.setTimeout(() => setSnackbarOpen(false), 4000);
      } catch {
        setSnackbarMessage('Something went wrong');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        window.setTimeout(() => setSnackbarOpen(false), 4000);
      }
    };
    window.addEventListener('app:snackbar' as any, handler as EventListener);
    return () => {
      window.removeEventListener('app:snackbar' as any, handler as EventListener);
    };
  }, []);

  return (
    <div className="flex min-h-screen min-h-dvh w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Header onMenuClick={handleDrawerToggle} drawerOpen={mobileOpen} />

      {/* Mobile Sidebar */}
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />

      {/* Desktop Sidebar */}
      <div className="hidden sm:block">
        <PermanentSidebar drawerWidth={DRAWER_WIDTH} />
      </div>

      {/* Main Content - Full Screen */}
      <main
        className={`flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-24 sm:pt-28 pb-6 sm:pb-8 md:pb-12 overflow-y-auto ${isRTL ? 'sm:mr-[260px]' : 'sm:ml-[260px]'} animate-fade-in`}
      >
        <div className="w-full max-w-full">
          {children}
        </div>
      </main>

      {/* Global Snackbar (Professional) */}
      {snackbarOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-slide-in-right">
          <div
            className={`min-w-[320px] max-w-md px-6 py-4 rounded-xl shadow-lg border backdrop-blur-sm ${
              snackbarSeverity === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 dark:bg-emerald-900/95 dark:border-emerald-800 dark:text-emerald-200'
                : snackbarSeverity === 'info'
                ? 'bg-blue-50/95 border-blue-200 text-blue-800 dark:bg-blue-900/95 dark:border-blue-800 dark:text-blue-200'
                : snackbarSeverity === 'warning'
                ? 'bg-amber-50/95 border-amber-200 text-amber-800 dark:bg-amber-900/95 dark:border-amber-800 dark:text-amber-200'
                : 'bg-rose-50/95 border-rose-200 text-rose-800 dark:bg-rose-900/95 dark:border-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  snackbarSeverity === 'success'
                    ? 'bg-emerald-500 text-white'
                    : snackbarSeverity === 'info'
                    ? 'bg-blue-500 text-white'
                    : snackbarSeverity === 'warning'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}>
                  {snackbarSeverity === 'success' ? '✓' : snackbarSeverity === 'info' ? 'i' : snackbarSeverity === 'warning' ? '!' : '✕'}
                </div>
                <div className="text-sm font-medium">{snackbarMessage}</div>
              </div>
              <button
                className="opacity-60 hover:opacity-100 transition-opacity p-1 -m-1"
                onClick={() => setSnackbarOpen(false)}
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
