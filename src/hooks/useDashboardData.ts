
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from './useErrorHandler';

export interface DashboardProject {
  id: string;
  name: string;
  status: string;
  progress: number;
  updated_at: string;
}

export interface DashboardFile {
  id: string;
  name: string;
  uploaded_at: string;
  size: number;
  type: string;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
}

export interface DashboardTicket {
  id: string;
  ticket_number: string;
  title: string;
  created_at: string;
}

export interface DashboardData {
  projects: DashboardProject[];
  recent_files: DashboardFile[];
  stats: DashboardStats;
  recent_tickets: DashboardTicket[];
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      try {
        // Usar a função RPC otimizada
        const { data, error } = await supabase.rpc('get_client_dashboard_data', {
          client_id: user.id
        });

        if (error) {
          console.error('Dashboard RPC error:', error);
          throw new Error(error.message || 'Erro ao buscar dados do dashboard');
        }

        if (!data) {
          throw new Error('Nenhum dado retornado do servidor');
        }

        // Cast the data to the expected type since RPC returns Json
        const dashboardData = data as any;

        return {
          projects: dashboardData.projects || [],
          recent_files: dashboardData.recent_files || [],
          stats: dashboardData.stats || { total_projects: 0, active_projects: 0, completed_projects: 0 },
          recent_tickets: dashboardData.recent_tickets || []
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Erro desconhecido');
        handleError(err, 'Dashboard Data');
        throw err;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching
  };
};
