
import React from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FallbackProps } from 'react-error-boundary';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleReportError = () => {
    const errorReport = {
      errorId,
      error: error?.toString(),
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Copiar para clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert('Detalhes do erro copiados para a área de transferência');
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Algo deu errado
          </h1>
          
          <div className="flex items-center justify-center mb-4">
            <Badge variant="outline" className="text-xs">
              ID: {errorId}
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-6">
            Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg text-xs">
              <summary className="font-medium cursor-pointer mb-2 flex items-center">
                <Bug className="w-4 h-4 mr-2" />
                Detalhes do erro (Desenvolvimento)
              </summary>
              <div className="bg-white p-3 rounded border">
                <pre className="whitespace-pre-wrap text-red-600 mb-2">
                  <strong>Error:</strong> {error.toString()}
                </pre>
                {error.stack && (
                  <pre className="whitespace-pre-wrap text-gray-600 text-xs">
                    <strong>Stack:</strong> {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
          
          <div className="space-y-3">
            <Button onClick={resetErrorBoundary} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReportError}
                className="flex-1"
              >
                <Bug className="h-4 w-4 mr-2" />
                Copiar Erro
              </Button>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Se o problema persistir, entre em contato com o suporte técnico</p>
            <p>mencionando o ID do erro: <code>{errorId}</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
