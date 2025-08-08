
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Loader2, ExternalLink, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useClientBIEmbeds } from '@/hooks/useClientBIEmbeds';

const ClientBIDashboard: React.FC = () => {
  useEffect(() => {
    document.title = 'BI do Cliente | Ascalate';
  }, []);

  const { user } = useAuth();
  const [currentClientId, setCurrentClientId] = useState<string | undefined>(undefined);
  const [resolvingClient, setResolvingClient] = useState(true);
  const { data: embeds = [], isLoading: loadingEmbeds } = useClientBIEmbeds(currentClientId);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const resolveClient = async () => {
      if (!user?.id) return;
      setResolvingClient(true);
      try {
        // 1) Direct match: primary contact
        const { data: direct } = await supabase
          .from('fpa_clients')
          .select('id')
          .eq('client_profile_id', user.id)
          .maybeSingle();
        if (direct?.id) {
          setCurrentClientId(direct.id);
          return;
        }
        // 2) Company team membership
        const { data: teams } = await supabase
          .from('company_teams')
          .select('company_id')
          .eq('member_id', user.id)
          .eq('status', 'active');
        const companyIds = (teams || []).map((t: any) => t.company_id).filter(Boolean);
        if (companyIds.length) {
          const { data: client } = await supabase
            .from('fpa_clients')
            .select('id')
            .in('client_profile_id', companyIds)
            .maybeSingle();
          if (client?.id) {
            setCurrentClientId(client.id);
            return;
          }
        }
        setCurrentClientId(undefined);
      } finally {
        setResolvingClient(false);
      }
    };
    resolveClient();
  }, [user?.id]);

  useEffect(() => {
    if (embeds.length && !selectedId) setSelectedId(embeds[0].id);
  }, [embeds, selectedId]);

  if (resolvingClient || loadingEmbeds) {
    return (
      <div className="flex items-center justify-center min-h-72">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando painel de BI...</p>
        </div>
      </div>
    );
  }

  if (!currentClientId) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-700">Não encontramos um cliente FP&A associado à sua conta. Verifique com o administrador.</p>
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

  const extractIframeSrc = (html?: string | null): string | null => {
    if (!html) return null;
    const match = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  };

  const isAllowedBIHost = (urlStr: string): boolean => {
    try {
      const url = new URL(urlStr, window.location.origin);
      const host = url.hostname.toLowerCase();
      if (url.protocol !== 'https:') return false;
      return (
        host === 'app.powerbi.com' ||
        host === 'lookerstudio.google.com' ||
        host === 'public.tableau.com'
      );
    } catch {
      return false;
    }
  };

  const sanitizeUrl = (urlStr?: string | null): string | null => {
    if (!urlStr) return null;
    const cleaned = urlStr.trim().replace(/^"|"$/g, '').replace(/%22$/g, '');
    if (!isAllowedBIHost(cleaned)) return null;
    try {
      const u = new URL(cleaned);
      if (u.hostname.toLowerCase() === 'app.powerbi.com') {
        if (!u.searchParams.has('rs:embed')) {
          u.searchParams.set('rs:embed', 'true');
        }
        return u.toString();
      }
      return cleaned;
    } catch {
      return null;
    }
  };

  const primaryUrl = sanitizeUrl(selected.embed_url);
  const fallbackFromHtml = sanitizeUrl(extractIframeSrc(selected.iframe_html));
  const safeEmbedUrl = primaryUrl || fallbackFromHtml;

  const openInNewTabSafely = (url: string) => {
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
  };

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
          {safeEmbedUrl ? (
            <AspectRatio ratio={16/9}>
              <iframe
                src={safeEmbedUrl}
                className="w-full h-full rounded-md border"
                loading="lazy"
                allowFullScreen
                allow="fullscreen; clipboard-write"
                title={selected.title || 'Dashboard de BI'}
              />
            </AspectRatio>
          ) : (
            <div className="py-10 text-center text-gray-600">Nenhum conteúdo de embed disponível.</div>
          )}

          <div className="flex justify-end mt-4">
            {safeEmbedUrl && (
              <Button variant="outline" size="sm" onClick={() => openInNewTabSafely(safeEmbedUrl!)}>
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
