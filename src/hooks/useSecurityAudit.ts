
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const useSecurityAudit = () => {
  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      console.log('🔒 Registrando evento de segurança:', event);

      const { error } = await supabase
        .rpc('log_security_event', {
          p_action: event.action,
          p_resource_type: event.resourceType,
          p_resource_id: event.resourceId || null,
          p_details: event.details ? JSON.stringify(event.details) : null
        });

      if (error) {
        console.error('❌ Erro ao registrar evento de segurança:', error);
      } else {
        console.log('✅ Evento de segurança registrado');
      }
    } catch (error) {
      console.error('❌ Exception ao registrar evento:', error);
    }
  };

  const logAuthAttempt = async (email: string, success: boolean, reason?: string) => {
    await logSecurityEvent({
      action: success ? 'login_success' : 'login_failed',
      resourceType: 'authentication',
      details: {
        email,
        reason,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    });
  };

  const logSensitiveOperation = async (operation: string, resourceId?: string, details?: Record<string, any>) => {
    await logSecurityEvent({
      action: operation,
      resourceType: 'sensitive_operation',
      resourceId,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    logSecurityEvent,
    logAuthAttempt,
    logSensitiveOperation
  };
};
