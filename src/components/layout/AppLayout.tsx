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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
    </div>
  );
};
