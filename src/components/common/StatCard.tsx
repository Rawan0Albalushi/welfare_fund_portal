import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
}) => {

  // Determine background color based on color prop
  const getBackgroundColor = () => {
    const colorMap = {
      primary: 'bg-gradient-to-br from-blue-100/80 via-blue-50/70 to-indigo-100/80 dark:from-blue-950/20 dark:via-blue-950/15 dark:to-indigo-950/20',
      secondary: 'bg-gradient-to-br from-purple-100/80 via-purple-50/70 to-pink-100/80 dark:from-purple-950/20 dark:via-purple-950/15 dark:to-pink-950/20',
      success: 'bg-gradient-to-br from-emerald-100/80 via-emerald-50/70 to-green-100/80 dark:from-emerald-950/20 dark:via-emerald-950/15 dark:to-green-950/20',
      error: 'bg-gradient-to-br from-rose-100/80 via-rose-50/70 to-red-100/80 dark:from-rose-950/20 dark:via-rose-950/15 dark:to-red-950/20',
      warning: 'bg-gradient-to-br from-amber-100/80 via-amber-50/70 to-orange-100/80 dark:from-amber-950/20 dark:via-amber-950/15 dark:to-orange-950/20',
      info: 'bg-gradient-to-br from-cyan-100/80 via-cyan-50/70 to-sky-100/80 dark:from-cyan-950/20 dark:via-cyan-950/15 dark:to-sky-950/20',
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className={`relative rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 h-full overflow-hidden ${getBackgroundColor()}`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 dark:to-black/5 pointer-events-none"></div>
      
      <div className="relative flex items-center justify-between z-10">
        <div className="flex-1">
          <div className="text-xs sm:text-caption text-slate-500 dark:text-slate-400 mb-1">{title}</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{value}</div>
          {trend && (
            <div className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {trend.isPositive ? '↗' : '↘'} {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        {icon && (
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
