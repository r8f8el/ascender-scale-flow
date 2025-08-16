
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityAuditOptions {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const useSecurityAudit = () => {
  const [isLogging, setIsLogging] = useState(false);

  const logSecurityEvent = useCallback(async ({
    action,
    resourceType,
    resourceId,
    details
  }: SecurityAuditOptions) => {
    setIsLogging(true);
    
    try {
      const { error } = await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null,
        p_details: details ? JSON.stringify(details) : null
      });

      if (error) {
        console.error('Security audit logging failed:', error);
        // Don't show user errors for audit logging to prevent information leakage
      }
    } catch (error) {
      console.error('Security audit error:', error);
    } finally {
      setIsLogging(false);
    }
  }, []);

  return {
    logSecurityEvent,
    isLogging
  };
};
