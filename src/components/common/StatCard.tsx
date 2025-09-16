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
    <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 p-4 sm:p-5 bg-white dark:bg-gray-900 shadow-card h-full transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {trend && (
            <div className={`text-xs mt-1 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        {icon && (
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
