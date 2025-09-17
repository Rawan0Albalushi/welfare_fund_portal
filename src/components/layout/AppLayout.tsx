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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onMenuClick={handleDrawerToggle} drawerOpen={mobileOpen} />

      {/* Mobile Sidebar */}
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />

      {/* Desktop Sidebar */}
      <div className="hidden sm:block">
        <PermanentSidebar drawerWidth={DRAWER_WIDTH} />
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 ${isRTL ? 'sm:mr-[260px]' : 'sm:ml-[260px]'} animate-fade-in`}
      >
        {children}
      </main>

      {/* Global Snackbar (Tailwind-based) */}
      {snackbarOpen && (
        <div className="fixed bottom-4 right-4 z-[9999]">
          <div
            className={`min-w-[280px] max-w-sm px-4 py-3 rounded-lg shadow-card border text-sm ${
              snackbarSeverity === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : snackbarSeverity === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : snackbarSeverity === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>{snackbarMessage}</div>
              <button
                className="opacity-70 hover:opacity-100"
                onClick={() => setSnackbarOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
