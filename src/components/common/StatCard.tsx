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
  // Keep `color` for API compatibility but do not use it
  trend,
}) => {

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 h-full">
      <div className="flex items-center justify-between">
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
