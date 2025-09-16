import React from 'react';

interface LoaderProps {
  message?: string;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({ 
  message, 
  size = 40 
}) => {

  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center gap-2 text-sm text-gray-500">
      <div
        className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
        style={{ width: size, height: size }}
      />
      {message && <div className="text-gray-500 dark:text-gray-400">{message}</div>}
    </div>
  );
};
