
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

const BIEmbedViewer: React.FC<BIEmbedViewerProps> = ({ embed }) => {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: 'URL copiada para área de transferência' });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const refreshIframe = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Extrair URL do iframe HTML se disponível
  const extractIframeSrc = (iframeHtml: string | null): string | null => {
    if (!iframeHtml) return null;
    const match = iframeHtml.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  };

  const embedUrl = embed.embed_url || extractIframeSrc(embed.iframe_html);

  if (!embedUrl) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            <span className="truncate">{embed.title || 'Dashboard de BI'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              URL do embed não configurada. Entre em contato com o administrador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
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
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(embedUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => openInNewTab(embedUrl)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {embed.description && (
          <p className="text-sm text-gray-600 mt-2">{embed.description}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative bg-white">
          <iframe
            key={refreshKey}
            src={embedUrl}
            className="w-full h-[700px] border-0"
            title={embed.title || 'Dashboard de BI'}
            allowFullScreen
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BIEmbedViewer;
