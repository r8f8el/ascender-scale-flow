
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompanyDashboardData {
  company_name: string;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    start_date: string;
    end_date: string;
  }>;
  documents: Array<{
    id: string;
    filename: string;
    category: string;
    uploaded_at: string;
  }>;
  team_members: Array<{
    id: string;
    name: string;
    email: string;
    is_primary_contact: boolean;
    hierarchy_level?: string;
  }>;
  pending_invitations: Array<{
    id: string;
    name: string;
    email: string;
    invited_at: string;
  }>;
}

export const useCompanyDashboard = () => {
  return useQuery({
    queryKey: ['company-dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🏢 Buscando dados do dashboard da empresa para usuário:', user.id);

      const { data, error } = await supabase.rpc('get_company_dashboard_data', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
        throw error;
      }

      if (data?.error) {
        console.warn('⚠️ Usuário não pertence a nenhuma empresa:', data.error);
        return null;
      }

      console.log('✅ Dados do dashboard obtidos:', data);
      return data as CompanyDashboardData;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};
