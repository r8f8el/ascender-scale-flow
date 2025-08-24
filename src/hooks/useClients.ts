
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      console.log('🔍 Buscando clientes...');
      
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, email, company')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        throw error;
      }

      console.log('✅ Clientes encontrados:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
