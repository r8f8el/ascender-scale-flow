
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, BarChart3, AlertTriangle, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useClientBIEmbeds } from '@/hooks/useClientBIEmbeds';

const ClientBIDashboard: React.FC = () => {
  useEffect(() => {
    document.title = 'BI do Cliente | Ascalate';
    // SEO meta description and canonical
    const desc = 'Dashboards de BI do cliente (Power BI, Looker Studio, Tableau).';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  const { user } = useAuth();
  const [currentClientId, setCurrentClientId] = useState<string | undefined>(undefined);
  const [resolvingClient, setResolvingClient] = useState(true);
  const { data: embeds = [], isLoading: loadingEmbeds } = useClientBIEmbeds(currentClientId);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [frameStatus, setFrameStatus] = useState<'idle' | 'loading' | 'loaded' | 'timeout'>('idle');
  const allowedHostsDisplay = 'app.powerbi.com, app.powerbigov.us, lookerstudio.google.com, datastudio.google.com, *.tableau.com';
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
      const tableauAllowed = host === 'public.tableau.com' || host.endsWith('.tableau.com');
      const lookerAllowed = host === 'lookerstudio.google.com' || host === 'datastudio.google.com';
      const powerBIAllowed = host === 'app.powerbi.com' || host === 'app.powerbigov.us';
      return tableauAllowed || lookerAllowed || powerBIAllowed;
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
      const host = u.hostname.toLowerCase();
      // Power BI: force embed parameters
      if (host === 'app.powerbi.com' || host === 'app.powerbigov.us') {
        if (!u.searchParams.has('rs:embed')) u.searchParams.set('rs:embed', 'true');
        return u.toString();
      }
      // Looker Studio: ensure embedded=true
      if (host === 'lookerstudio.google.com' || host === 'datastudio.google.com') {
        if (!u.searchParams.has('embedded')) u.searchParams.set('embedded', 'true');
        return u.toString();
      }
      // Tableau: hide viz home and embed
      if (host === 'public.tableau.com' || host.endsWith('.tableau.com')) {
        const sp = u.searchParams;
        if (!sp.has(':showVizHome')) sp.set(':showVizHome', 'no');
        if (!sp.has(':embed')) sp.set(':embed', 'y');
        return u.toString();
      }
      return cleaned;
    } catch {
      return null;
    }
  };

  const rawPrimary = selected.embed_url || null;
  const rawFromHtml = extractIframeSrc(selected.iframe_html);
  const primaryUrl = sanitizeUrl(rawPrimary);
  const fallbackFromHtml = sanitizeUrl(rawFromHtml);
  const safeEmbedUrl = primaryUrl || fallbackFromHtml;
  const hasAnyRaw = Boolean(rawPrimary || rawFromHtml);
  const invalidHost = hasAnyRaw && !(isAllowedBIHost(rawPrimary || '') || isAllowedBIHost(rawFromHtml || ''));
  const diag = (() => {
    if (!safeEmbedUrl) return null;
    try {
      const u = new URL(safeEmbedUrl);
      const host = u.hostname.toLowerCase();
      return {
        host,
        isPowerBI: host === 'app.powerbi.com' || host === 'app.powerbigov.us',
        isLooker: host === 'lookerstudio.google.com' || host === 'datastudio.google.com',
        isTableau: host === 'public.tableau.com' || host.endsWith('.tableau.com'),
        pbiRsEmbed: u.searchParams.get('rs:embed') === 'true',
        lookerEmbedded: u.searchParams.get('embedded') === 'true',
        tableauEmbed: u.searchParams.get(':embed') === 'y',
        tableauShowViz: u.searchParams.get(':showVizHome') === 'no',
        url: u.toString(),
      };
    } catch {
      return null;
    }
  })();
  const debugMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
  const openInNewTabSafely = (url: string) => {
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
  };
  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };
  useEffect(() => {
    if (!safeEmbedUrl) {
      setFrameStatus('idle');
      return;
    }
    setFrameStatus('loading');
    const t = setTimeout(() => {
      setFrameStatus((prev) => (prev === 'loaded' ? 'loaded' : 'timeout'));
    }, 8000);
    return () => clearTimeout(t);
  }, [safeEmbedUrl]);

  useEffect(() => {
    if (!debugMode) return;
    console.log('[BI][DEBUG] user:', user?.id, 'clientId:', currentClientId, 'embeds:', embeds, 'selectedId:', selectedId, 'safeUrl:', safeEmbedUrl, 'status:', frameStatus);
  }, [debugMode, user?.id, currentClientId, embeds, selectedId, safeEmbedUrl, frameStatus]);

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
            <>
              {debugMode && (
                <Alert className="mb-3">
                  <AlertTitle>Debug do Embed</AlertTitle>
                  <AlertDescription>
                    Cliente: {currentClientId || '—'} · Embeds: {embeds.length} · Selecionado: {selected?.id || '—'} · Status: {frameStatus} · Host: {diag?.host || '—'}
                  </AlertDescription>
                </Alert>
              )}
              <AspectRatio ratio={16/9}>
                <iframe
                  src={safeEmbedUrl}
                  className="w-full h-full rounded-md border"
                  loading="lazy"
                  allowFullScreen
                  allow="fullscreen; clipboard-write"
                  onLoad={() => setFrameStatus('loaded')}
                  title={selected.title || 'Dashboard de BI'}
                />
              </AspectRatio>
              {frameStatus === 'timeout' && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Possível bloqueio de iframe pelo provedor</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Host: {diag?.host || 'desconhecido'}</li>
                      <li>URL final sanitizada: <span className="break-all">{diag?.url || safeEmbedUrl}</span></li>
                      {diag?.isPowerBI && (
                        <li>Power BI: parâmetro rs:embed {diag.pbiRsEmbed ? 'presente' : 'faltando'}; se usar “Embed para a organização”, o Power BI pode bloquear iframes externos. Prefira “Publicar na Web”.</li>
                      )}
                      {diag?.isLooker && (
                        <li>Looker Studio: parâmetro embedded {diag.lookerEmbedded ? 'presente' : 'faltando'}.</li>
                      )}
                      {diag?.isTableau && (
                        <li>Tableau: parâmetros :embed/:showVizHome {diag.tableauEmbed && diag.tableauShowViz ? 'ok' : 'ajuste necessário'}.</li>
                      )}
                    </ul>
                    <p className="mt-2 text-sm opacity-80">Dica: use “Copiar URL final” ou “Abrir em nova aba” para validar o acesso.</p>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="py-10 text-center">
              {hasAnyRaw ? (
                <>
                  <p className="text-gray-700">URL inválida ou host não permitido.</p>
                  <p className="text-gray-500 text-sm mt-2">Hosts permitidos: {allowedHostsDisplay}</p>
                </>
              ) : (
                <p className="text-gray-600">Nenhum conteúdo de embed disponível.</p>
              )}
            </div>
          )}

          <div className="flex justify-end mt-4 gap-2">
            {safeEmbedUrl && (
              <>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(safeEmbedUrl!)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar URL final
                </Button>
                <Button variant="outline" size="sm" onClick={() => openInNewTabSafely(safeEmbedUrl!)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir em nova aba
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBIDashboard;
