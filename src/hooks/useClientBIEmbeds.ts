
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  display_order: number;
  category: string;
  is_featured: boolean;
};

export const useClientBIEmbeds = (clientId?: string) => {
  return useQuery({
    queryKey: ['client-bi-embeds', clientId],
    queryFn: async () => {
      if (!clientId) return [] as ClientBIEmbed[];
      
      console.log('🔍 Buscando embeds para cliente:', clientId);
      
      const { data, error } = await supabase
        .from('client_bi_embeds')
        .select('*')
        .eq('fpa_client_id', clientId)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar embeds:', error);
        throw error;
      }
      
      console.log('✅ Embeds encontrados:', data?.length || 0);
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
      console.log('💾 Tentando salvar embed:', payload);
      
      try {
        // Verificar se o usuário está autenticado
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Erro ao verificar sessão:', sessionError);
          throw new Error('Erro de autenticação. Faça login novamente.');
        }
        
        if (!session) {
          console.error('❌ Usuário não autenticado');
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ Erro ao obter usuário:', userError);
          throw new Error('Erro de autenticação. Faça login novamente.');
        }
        
        console.log('✅ Usuário autenticado:', user.id);

        if ((payload as any).id) {
          console.log('📝 Atualizando embed existente:', (payload as any).id);
          
          const { data, error } = await supabase
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
              display_order: payload.display_order,
              category: payload.category,
              is_featured: payload.is_featured,
            })
            .eq('id', (payload as any).id)
            .select()
            .single();
          
          if (error) {
            console.error('❌ Erro ao atualizar embed:', error);
            throw error;
          }
          
          console.log('✅ Embed atualizado com sucesso');
          return data as ClientBIEmbed;
        }

        console.log('➕ Criando novo embed');
        
        const { data, error } = await supabase
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
            display_order: payload.display_order || 0,
            category: payload.category || 'dashboard',
            is_featured: payload.is_featured || false,
            created_by: user.id,
          })
          .select()
          .single();
        
        if (error) {
          console.error('❌ Erro ao criar embed:', error);
          throw error;
        }
        
        console.log('✅ Embed criado com sucesso');
        return data as ClientBIEmbed;
        
      } catch (error: any) {
        console.error('❌ Erro na operação de embed:', error);
        
        // Não fazer logout automático, apenas mostrar erro
        if (error.message?.includes('JWT') || error.message?.includes('session') || error.message?.includes('auth')) {
          toast.error('Sessão expirada. Faça login novamente.');
        } else {
          toast.error(error.message || 'Erro ao salvar embed');
        }
        
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      console.log('🔄 Invalidando cache para cliente:', variables.fpa_client_id);
      queryClient.invalidateQueries({ queryKey: ['client-bi-embeds', variables.fpa_client_id] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na mutação:', error);
      // Não fazer nada adicional aqui para evitar loops
    }
  });
};

export const useDeleteClientBIEmbed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      console.log('🗑️ Tentando excluir embed:', id);
      
      try {
        // Verificar autenticação antes de deletar
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        const { error } = await supabase
          .from('client_bi_embeds')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('❌ Erro ao excluir embed:', error);
          throw error;
        }
        
        console.log('✅ Embed excluído com sucesso');
        return { id, clientId };
        
      } catch (error: any) {
        console.error('❌ Erro ao excluir embed:', error);
        
        if (error.message?.includes('JWT') || error.message?.includes('session')) {
          toast.error('Sessão expirada. Faça login novamente.');
        } else {
          toast.error(error.message || 'Erro ao excluir embed');
        }
        
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      console.log('🔄 Invalidando cache após exclusão para cliente:', variables.clientId);
      queryClient.invalidateQueries({ queryKey: ['client-bi-embeds', variables.clientId] });
    }
  });
};

export const useCurrentClientId = () => {
  return useQuery({
    queryKey: ['current-client-id'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data, error } = await supabase
          .from('fpa_clients')
          .select('id')
          .eq('client_profile_id', user.id)
          .single();
        
        if (error) return null;
        return data?.id || null;
        
      } catch (error) {
        console.error('❌ Erro ao obter client ID:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};
