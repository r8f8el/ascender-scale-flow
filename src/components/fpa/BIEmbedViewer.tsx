
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Copy, ExternalLink, Monitor, Maximize2, RefreshCw } from 'lucide-react';
import { ClientBIEmbed } from '@/hooks/useClientBIEmbeds';
import { useToast } from '@/components/ui/use-toast';

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

  if (!embed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Selecione um Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum dashboard selecionado
            </h3>
            <p className="text-gray-600">
              Selecione um dashboard da lista ao lado para visualizar
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          {embed.title || 'Dashboard de BI'}
        </CardTitle>
        {embed.description && (
          <p className="text-gray-600 text-sm">{embed.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {!isValidUrl ? (
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
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={refreshIframe}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
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
              <div className="text-sm text-gray-500">
                Provedor: {embed.provider || 'Não especificado'}
              </div>
            </div>

            <div className="relative border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                key={refreshKey}
                src={sanitizedUrl}
                className="w-full h-[700px] border-0"
                title={embed.title || 'Dashboard de BI'}
                allowFullScreen
                loading="lazy"
                onError={() => setIframeError('Falha ao carregar o conteúdo. Verifique se a URL está correta.')}
                onLoad={() => setIframeError(null)}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 <strong>Dica:</strong> Se o dashboard não carregar, tente clicar em "Atualizar" ou "Abrir em nova aba".</p>
              <p>🔒 <strong>Segurança:</strong> Este conteúdo é carregado diretamente do provedor de BI configurado.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BIEmbedViewer;
