
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSecurityAudit = () => {
  const [isLogging, setIsLogging] = useState(false);

  const logSecurityEvent = async (
    action: string,
    resourceType: string,
    details?: any
  ): Promise<void> => {
    try {
      setIsLogging(true);
      
      const { error } = await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: details?.resource_id || null,
        p_details: details
      });

      if (error) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      console.error('Exception in logSecurityEvent:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return {
    logSecurityEvent,
    isLogging
  };
};
