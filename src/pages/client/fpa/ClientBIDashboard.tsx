
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Loader2, ExternalLink, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useClientBIEmbeds } from '@/hooks/useClientBIEmbeds';

const ClientBIDashboard: React.FC = () => {
  useEffect(() => {
    document.title = 'BI do Cliente | Ascalate';
  }, []);

  const { user } = useAuth();
  const { data: clients = [], isLoading: loadingClients } = useFPAClients();
  const currentClient = useMemo(() => clients.find(c => c.client_profile?.id === user?.id), [clients, user?.id]);
  const { data: embeds = [], isLoading: loadingEmbeds } = useClientBIEmbeds(currentClient?.id);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (embeds.length && !selectedId) setSelectedId(embeds[0].id);
  }, [embeds, selectedId]);

  if (loadingClients || loadingEmbeds) {
    return (
      <div className="flex items-center justify-center min-h-72">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando painel de BI...</p>
        </div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-700">Não identificamos seu cliente FP&A. Tente sair e entrar novamente.</p>
        </CardContent>
      </Card>
    );
  }

  if (!embeds.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            BI do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center">
          <p className="text-gray-700">Seu painel de BI ainda não foi configurado.</p>
          <p className="text-gray-500 text-sm mt-2">Peça ao seu consultor para habilitar o embed do seu BI.</p>
        </CardContent>
      </Card>
    );
  }

  const selected = embeds.find(e => e.id === selectedId) || embeds[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel de BI</h1>
        <p className="text-gray-600 mt-1">Visualize seus dashboards de Business Intelligence</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>{selected.title || 'Dashboard de BI'}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline" className="capitalize">{selected.provider}</Badge>
              {selected.external_dashboard_id && (
                <span>ID: {selected.external_dashboard_id}</span>
              )}
            </div>
          </div>
          {embeds.length > 1 && (
            <div className="w-full md:w-64">
              <Select value={selected.id} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {embeds.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.title || e.provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selected.embed_url ? (
            <AspectRatio ratio={16/9}>
              <iframe
                src={selected.embed_url}
                className="w-full h-full rounded-md border"
                loading="lazy"
                allowFullScreen
                title={selected.title || 'Dashboard de BI'}
              />
            </AspectRatio>
          ) : selected.iframe_html ? (
            <div className="rounded-md border overflow-hidden" dangerouslySetInnerHTML={{ __html: selected.iframe_html }} />
          ) : (
            <div className="py-10 text-center text-gray-600">Nenhum conteúdo de embed disponível.</div>
          )}

          <div className="flex justify-end mt-4">
            {selected.embed_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(selected.embed_url!, '_blank') }>
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em nova aba
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBIDashboard;
