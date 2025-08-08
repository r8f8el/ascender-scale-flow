
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClientBIEmbed = {
  id: string;
  fpa_client_id: string | null;
  provider: string;
  title: string | null;
  description: string | null;
  embed_url: string | null;
  iframe_html: string | null;
  filters: any | null;
  is_active: boolean;
  external_dashboard_id: string | null;
  access_mode: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const useClientBIEmbeds = (clientId?: string) => {
  return useQuery({
    queryKey: ['client-bi-embeds', clientId],
    queryFn: async () => {
      if (!clientId) return [] as ClientBIEmbed[];
      const { data, error } = await (supabase as any)
        .from('client_bi_embeds')
        .select('*')
        .eq('fpa_client_id', clientId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data as ClientBIEmbed[]) || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpsertClientBIEmbed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ClientBIEmbed> & { fpa_client_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      if ((payload as any).id) {
        const { data, error } = await (supabase as any)
          .from('client_bi_embeds')
          .update({
            provider: payload.provider,
            title: payload.title,
            description: payload.description,
            embed_url: payload.embed_url,
            iframe_html: payload.iframe_html,
            filters: payload.filters,
            is_active: payload.is_active,
            external_dashboard_id: payload.external_dashboard_id,
            access_mode: payload.access_mode,
          })
          .eq('id', (payload as any).id)
          .select()
          .single();
        if (error) throw error;
        return data as ClientBIEmbed;
      }

      const { data, error } = await (supabase as any)
        .from('client_bi_embeds')
        .insert({
          fpa_client_id: payload.fpa_client_id,
          provider: payload.provider || 'other',
          title: payload.title,
          description: payload.description,
          embed_url: payload.embed_url,
          iframe_html: payload.iframe_html,
          filters: payload.filters,
          is_active: payload.is_active ?? true,
          external_dashboard_id: payload.external_dashboard_id,
          access_mode: payload.access_mode || 'secure',
          created_by: user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ClientBIEmbed;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-bi-embeds', variables.fpa_client_id] });
    },
  });
};
