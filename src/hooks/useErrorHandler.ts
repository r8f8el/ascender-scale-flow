
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  context: string;
  retryCount: number;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    context: '',
    retryCount: 0
  });

  const handleError = useCallback((error: Error, context: string = 'Unknown') => {
    console.error(`Error in ${context}:`, error);
    
    setErrorState(prev => ({
      hasError: true,
      error,
      context,
      retryCount: prev.retryCount + 1
    }));

    // Show user-friendly toast
    const userMessage = getUserFriendlyMessage(error, context);
    toast.error(userMessage, {
      description: "Tente novamente em alguns instantes",
      duration: 5000,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      context: '',
      retryCount: 0
    });
  }, []);

  const retry = useCallback((retryFn: () => void | Promise<void>) => {
    clearError();
    if (typeof retryFn === 'function') {
      retryFn();
    }
  }, [clearError]);

  return {
    errorState,
    handleError,
    clearError,
    retry
  };
};

const getUserFriendlyMessage = (error: Error, context: string): string => {
  const contextMessages: Record<string, string> = {
    'Dashboard Data': 'Erro ao carregar dados do dashboard',
    'Projects': 'Erro ao carregar projetos',
    'Files': 'Erro ao carregar arquivos',
    'Reports': 'Erro ao carregar relatórios',
    'Stats': 'Erro ao carregar estatísticas',
    'Tickets': 'Erro ao carregar tickets'
  };

  return contextMessages[context] || 'Ocorreu um erro inesperado';
};
