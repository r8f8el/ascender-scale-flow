
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BIEmbedViewerProps {
  title?: string;
  description?: string;
  embedUrl?: string;
  iframeHtml?: string;
  provider?: string;
  category?: string;
}

export const BIEmbedViewer: React.FC<BIEmbedViewerProps> = ({
  title,
  description,
  embedUrl,
  iframeHtml,
  provider,
  category
}) => {
  const [isSecure, setIsSecure] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [securityWarning, setSecurityWarning] = useState('');

  useEffect(() => {
    // Security validation for embed content
    if (embedUrl) {
      try {
        const url = new URL(embedUrl);
        
        // Check if URL uses HTTPS
        if (url.protocol !== 'https:') {
          setSecurityWarning('Este embed não usa conexão segura (HTTPS)');
          setIsSecure(false);
          return;
        }
        
        // Check for trusted domains (add your trusted BI providers)
        const trustedDomains = [
          'powerbi.com',
          'app.powerbi.com',
          'msit.powerbi.com',
          'tableau.com',
          'public.tableau.com',
          'looker.com',
          'datastudio.google.com',
          'analytics.google.com'
        ];
        
        const isTrusted = trustedDomains.some(domain => 
          url.hostname.endsWith(domain)
        );
        
        if (!isTrusted) {
          setSecurityWarning('Domínio não está na lista de provedores confiáveis');
          setIsSecure(false);
          return;
        }
        
        setIsSecure(true);
      } catch (error) {
        setSecurityWarning('URL inválida fornecida');
        setIsSecure(false);
      }
    } else if (iframeHtml) {
      // Basic validation for iframe HTML
      const hasScript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(iframeHtml);
      const hasOnEvent = /on\w+\s*=/gi.test(iframeHtml);
      
      if (hasScript || hasOnEvent) {
        setSecurityWarning('Código HTML contém elementos potencialmente inseguros');
        setIsSecure(false);
        return;
      }
      
      setIsSecure(true);
    }
  }, [embedUrl, iframeHtml]);

  const handleShowEmbed = () => {
    setShowEmbed(true);
  };

  const renderEmbed = () => {
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          width="100%"
          height="600"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title={title || 'BI Dashboard'}
          className="rounded-lg border"
        />
      );
    }
    
    if (iframeHtml) {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: iframeHtml }}
          className="w-full h-[600px] rounded-lg border overflow-hidden"
        />
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title || 'Dashboard BI'}
              {isSecure ? (
                <Shield className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
            {description && (
              <CardDescription className="mt-2">
                {description}
              </CardDescription>
            )}
          </div>
          {embedUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(embedUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Original
            </Button>
          )}
        </div>
        
        {provider && (
          <div className="text-sm text-muted-foreground">
            Provedor: {provider} {category && `• Categoria: ${category}`}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {securityWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Aviso de Segurança:</strong> {securityWarning}
            </AlertDescription>
          </Alert>
        )}
        
        {!showEmbed && (
          <div className="text-center py-8">
            <Button 
              onClick={handleShowEmbed}
              disabled={!isSecure}
              variant={isSecure ? "default" : "destructive"}
            >
              {isSecure ? 'Carregar Dashboard' : 'Dashboard Bloqueado por Segurança'}
            </Button>
            {isSecure && (
              <p className="text-sm text-muted-foreground mt-2">
                Clique para carregar o conteúdo do dashboard
              </p>
            )}
          </div>
        )}
        
        {showEmbed && isSecure && renderEmbed()}
      </CardContent>
    </Card>
  );
};
