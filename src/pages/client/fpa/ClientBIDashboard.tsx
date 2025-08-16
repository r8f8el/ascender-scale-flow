
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Copy, ExternalLink, Monitor } from 'lucide-react';
import { useClientBIEmbeds } from '@/hooks/useClientBIEmbeds';
import { useToast } from '@/components/ui/use-toast';

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

const ClientBIDashboard: React.FC = () => {
  const { toast } = useToast();
  const { data: embeds = [], isLoading } = useClientBIEmbeds();
  const [iframeError, setIframeError] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = 'Painel de BI | Ascalate';
  }, []);

  const activeEmbed = useMemo(() => {
    return embeds.find(embed => embed.is_active) || null;
  }, [embeds]);

  const embedUrl = useMemo(() => {
    if (!activeEmbed) return null;
    
    const url = activeEmbed.embed_url || extractIframeSrc(activeEmbed.iframe_html);
    if (!url) return null;
    if (!isAllowedBIHost(url)) {
      setIframeError('Host não permitido para embedding de BI');
      return null;
    }
    
    return sanitizeUrl(url);
  }, [activeEmbed]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: 'URL copiada para área de transferência' });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel de BI</h1>
          <p className="text-gray-600 mt-1">Análises e relatórios financeiros</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            {activeEmbed?.title || 'Dashboard de BI'}
          </CardTitle>
          {activeEmbed?.description && (
            <p className="text-gray-600 text-sm">{activeEmbed.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {!activeEmbed ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Painel de BI ainda não foi configurado</p>
                  <p>Peça ao seu consultor para configurar o dashboard de BI para sua empresa.</p>
                </div>
              </AlertDescription>
            </Alert>
          ) : !embedUrl ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">URL inválida ou host não permitido</p>
                  <p className="text-sm">
                    O embed configurado não possui uma URL válida ou o host não está na lista de provedores permitidos.
                  </p>
                  <div className="mt-3">
                    <p className="text-sm font-medium">Hosts permitidos:</p>
                    <ul className="text-sm ml-5 space-y-1">
                      <li>• app.powerbi.com (Power BI)</li>
                      <li>• lookerstudio.google.com (Looker Studio)</li>
                      <li>• tableau.com (Tableau)</li>
                      <li>• metabase.com (Metabase)</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ) : iframeError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Erro ao carregar o dashboard</p>
                  <p className="text-sm">{iframeError}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(embedUrl)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar URL
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openInNewTab(embedUrl)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir em nova aba
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(embedUrl)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar URL
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openInNewTab(embedUrl)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir em nova aba
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Provedor: {activeEmbed.provider || 'Não especificado'}
                </div>
              </div>

              <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={embedUrl}
                  className="w-full h-[600px] border-0"
                  title={activeEmbed.title || 'Dashboard de BI'}
                  allowFullScreen
                  loading="lazy"
                  onError={() => setIframeError('Falha ao carregar o conteúdo. Verifique se a URL está correta.')}
                  onLoad={() => setIframeError(null)}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>💡 <strong>Dica:</strong> Se o dashboard não carregar, tente abrir em nova aba.</p>
                <p>🔒 <strong>Segurança:</strong> Este conteúdo é carregado diretamente do provedor de BI.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBIDashboard;
