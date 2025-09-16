import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {

  return (
    <div className="min-h-[300px] p-6 flex flex-col items-center justify-center gap-3 text-center animate-fade-in">
      {icon && <div className="text-5xl text-gray-400">{icon}</div>}
      <div className="text-lg font-semibold tracking-tight">{title}</div>
      {description && <div className="text-sm text-gray-500 max-w-[420px]">{description}</div>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-2 h-10 px-4 rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
