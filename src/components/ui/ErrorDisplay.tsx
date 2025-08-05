
import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error?: Error | null;
  context?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  context = 'operação',
  onRetry,
  onDismiss,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800">
            Erro ao carregar {context}
          </h3>
          
          {error && (
            <div className="mt-1">
              <p className="text-xs text-red-700">
                {error.message || 'Ocorreu um erro inesperado'}
              </p>
            </div>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar Novamente
              </Button>
            )}
            
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-red-700 hover:bg-red-100"
              >
                <X className="w-3 h-3 mr-1" />
                Dispensar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
