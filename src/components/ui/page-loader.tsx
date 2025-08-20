
import React from 'react';
import { LoadingSpinner } from './loading-spinner';

interface PageLoaderProps {
  text?: string;
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = 'Carregando página...', 
  className = '' 
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="text-lg text-gray-600">{text}</div>
      </div>
    </div>
  );
};
