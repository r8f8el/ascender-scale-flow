import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  user_name: string;
  user_email: string;
  action: string;
  details: string | null;
  ip_address: string;
  type: string;
  level: string;
  created_at: string;
}

export const useActivityLogger = () => {
  const { client, user } = useAuth();

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '127.0.0.1';
    } catch (error) {
      console.warn('Could not get client IP:', error);
      return '127.0.0.1';
    }
  };

  const logActivity = async (
    action: string,
    details?: string,
    type: string = 'client_action',
    level: string = 'info'
  ) => {
    try {
      const ip_address = await getClientIP();
      const user_name = client?.name || user?.email || 'Usuário não identificado';
      const user_email = client?.email || user?.email || '';

      const { error } = await supabase.rpc('log_system_action', {
        p_user_name: user_name,
        p_type: type,
        p_ip_address: ip_address,
        p_action: action,
        p_details: details || null,
        p_level: level
      });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
    }
  };

  // Log automático quando o usuário acessa uma página
  const logPageAccess = (pageName: string) => {
    logActivity(
      'page_access',
      `Usuário acessou a página: ${pageName}`,
      'navigation'
    );
  };

  // Log para ações específicas
  const logUserAction = (action: string, details?: string) => {
    logActivity(action, details, 'user_interaction');
  };

  // Log para operações CRUD
  const logDataOperation = (operation: string, entity: string, details?: string) => {
    logActivity(
      `${operation}_${entity}`,
      details,
      'data_operation'
    );
  };

  return {
    logActivity,
    logPageAccess,
    logUserAction,
    logDataOperation
  };
};