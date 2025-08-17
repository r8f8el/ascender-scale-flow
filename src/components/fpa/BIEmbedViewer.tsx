
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Copy, ExternalLink, Monitor, Maximize2, RefreshCw } from 'lucide-react';
import { ClientBIEmbed } from '@/hooks/useClientBIEmbeds';
import { useToast } from '@/hooks/use-toast';

interface BIEmbedViewerProps {
  embed: ClientBIEmbed | null;
}

const extractIframeSrc = (iframeHtml: string | null): string | null => {
  if (!iframeHtml) return null;
  const match = iframeHtml.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : null;
};

const isAllowedBIHost = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    const allowedHosts = [
      'app.powerbi.com', 'app.powerbigov.us', 'msit.powerbi.com',
      'lookerstudio.google.com', 'datastudio.google.com',
      'tableau.com', 'online.tableau.com', 'public.tableau.com',
      'metabase.com', 'superset.apache.org'
    ];
    
    return allowedHosts.some(host => 
      hostname === host || hostname.endsWith('.' + host)
    );
  } catch {
    return false;
  }
};

const sanitizeUrl = (url: string): string => {
  try {
    return new URL(url).href;
  } catch {
    return '';
  }
};

const BIEmbedViewer: React.FC<BIEmbedViewerProps> = ({ embed }) => {
  const { toast } = useToast();
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!embed) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Selecione um Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <Monitor className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Nenhum dashboard selecionado
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Selecione um dashboard da lista ao lado para visualizar seus relatórios e análises
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const embedUrl = embed.embed_url || extractIframeSrc(embed.iframe_html);
  const sanitizedUrl = embedUrl ? sanitizeUrl(embedUrl) : null;
  const isValidUrl = sanitizedUrl && isAllowedBIHost(sanitizedUrl);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: 'URL copiada para área de transferência' });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const refreshIframe = () => {
    setRefreshKey(prev => prev + 1);
    setIframeError(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            <span className="truncate">{embed.title || 'Dashboard de BI'}</span>
            {embed.is_featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Destaque
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={refreshIframe}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {embed.description && (
          <p className="text-sm text-gray-600 mt-2">{embed.description}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {!isValidUrl ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">URL inválida ou host não permitido</p>
                  <p className="text-sm">
                    O embed configurado não possui uma URL válida ou o host não está na lista de provedores permitidos.
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Hosts permitidos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                      <div>• app.powerbi.com (Power BI)</div>
                      <div>• lookerstudio.google.com (Looker Studio)</div>
                      <div>• tableau.com (Tableau)</div>
                      <div>• metabase.com (Metabase)</div>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : iframeError ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-4">
                  <p className="font-medium">Erro ao carregar o dashboard</p>
                  <p className="text-sm">{iframeError}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={refreshIframe}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(sanitizedUrl!)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar URL
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openInNewTab(sanitizedUrl!)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir em nova aba
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Quick Actions Bar */}
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={refreshIframe}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Atualizar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(sanitizedUrl!)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openInNewTab(sanitizedUrl!)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Nova Aba
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-white rounded border">
                  {embed.provider || 'Não especificado'}
                </span>
              </div>
            </div>

            {/* Iframe Container */}
            <div className="relative bg-white">
              <iframe
                key={refreshKey}
                src={sanitizedUrl}
                className={`w-full border-0 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[700px]'}`}
                title={embed.title || 'Dashboard de BI'}
                allowFullScreen
                loading="lazy"
                onError={() => setIframeError('Falha ao carregar o conteúdo. Verifique se a URL está correta e se você tem permissão para acessá-la.')}
                onLoad={() => setIframeError(null)}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                style={{
                  background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              />
              
              {/* Loading overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Carregando dashboard...</span>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="px-4 py-3 bg-blue-50 border-t">
              <div className="text-xs text-blue-700 space-y-1">
                <div className="flex items-center gap-1">
                  <span>💡</span>
                  <strong>Dica:</strong> Se o dashboard não carregar, tente clicar em "Atualizar" ou "Abrir em nova aba".
                </div>
                <div className="flex items-center gap-1">
                  <span>🔒</span>
                  <strong>Segurança:</strong> Este conteúdo é carregado diretamente do provedor de BI configurado.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BIEmbedViewer;
