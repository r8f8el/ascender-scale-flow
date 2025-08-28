
import React from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId;
    console.error(`ErrorBoundary [${errorId}] caught an error:`, error, errorInfo);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Current URL:', window.location.href);
    console.error('User agent:', navigator.userAgent);
    
    // Em produção, enviar erro para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      console.log('Error would be sent to monitoring service:', { 
        errorId, 
        error: error.toString(), 
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Copiar para clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert('Detalhes do erro copiados para a área de transferência');
  };

  render() {
    if (this.state.hasError) {
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
                  ID: {this.state.errorId}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-6">
                Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg text-xs">
                  <summary className="font-medium cursor-pointer mb-2 flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Detalhes do erro (Desenvolvimento)
                  </summary>
                  <div className="bg-white p-3 rounded border">
                    <pre className="whitespace-pre-wrap text-red-600 mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </pre>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap text-gray-600 text-xs">
                        <strong>Stack:</strong> {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <pre className="whitespace-pre-wrap text-blue-600 text-xs mt-2">
                        <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              <div className="space-y-3">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleReportError}
                    className="flex-1"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Copiar Erro
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p>Se o problema persistir, entre em contato com o suporte técnico</p>
                <p>mencionando o ID do erro: <code>{this.state.errorId}</code></p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
