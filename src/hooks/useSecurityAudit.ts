import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export interface SecurityAuditLog {
  id: string;
  user_id: string | null;
  event_type: string;
  event_description: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

export const useSecurityAuditLogs = () => {
  const { isAdminAuthenticated } = useAdminAuth();

  return useQuery({
    queryKey: ['security-audit-logs'],
    queryFn: async () => {
      // For now, return empty array until the table is properly created and types are updated
      // This prevents the build error while keeping the hook structure
      return [] as SecurityAuditLog[];
      
      // TODO: Uncomment this once the security_audit_logs table is in the database types
      /*
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as SecurityAuditLog[];
      */
    },
    enabled: isAdminAuthenticated,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
};

export const useSecurityStats = () => {
  const { isAdminAuthenticated } = useAdminAuth();

  return useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      // For now, return mock data until the database function exists
      const stats = {
        total_events_24h: 0,
        auth_failures_24h: 0,
        suspicious_activities_24h: 0,
        rate_limit_hits_24h: 0
      };

      return stats;
      
      // TODO: Uncomment this once the database function exists
      /*
      const { data, error } = await supabase
        .rpc('get_security_stats');

      if (error) {
        // Fallback to manual calculation if RPC doesn't exist
        const { data: logs } = await supabase
          .from('security_audit_logs')
          .select('event_type, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const stats = {
          total_events_24h: logs?.length || 0,
          auth_failures_24h: logs?.filter(log => log.event_type === 'AUTH_FAILURE').length || 0,
          suspicious_activities_24h: logs?.filter(log => log.event_type === 'SUSPICIOUS_ACTIVITY').length || 0,
          rate_limit_hits_24h: logs?.filter(log => log.event_type === 'RATE_LIMIT_EXCEEDED').length || 0
        };

        return stats;
      }

      return data;
      */
    },
    enabled: isAdminAuthenticated,
    refetchInterval: 60000 // Refresh every minute
  });
};
