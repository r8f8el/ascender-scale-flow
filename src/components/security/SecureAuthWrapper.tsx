
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthRateLimit } from '@/hooks/useAuthRateLimit';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  checkAuthRateLimit: (email: string, type: 'login' | 'signup' | 'password_reset') => Promise<boolean>;
  logSecurityEvent: (action: string, resourceType: string, details?: any) => Promise<void>;
  isRateLimited: boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecureAuthWrapper');
  }
  return context;
};

interface SecureAuthWrapperProps {
  children: React.ReactNode;
}

export const SecureAuthWrapper: React.FC<SecureAuthWrapperProps> = ({ children }) => {
  const { checkRateLimit, isBlocked } = useAuthRateLimit();
  const { logSecurityEvent } = useSecurityAudit();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Monitor authentication events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await logSecurityEvent('login_success', 'auth', {
            user_id: session.user.id,
            email: session.user.email,
            timestamp: new Date().toISOString()
          });
        } else if (event === 'SIGNED_OUT') {
          await logSecurityEvent('logout', 'auth', {
            timestamp: new Date().toISOString()
          });
        }
        setSessionChecked(true);
      }
    );

    return () => subscription.unsubscribe();
  }, [logSecurityEvent]);

  const checkAuthRateLimit = async (email: string, type: 'login' | 'signup' | 'password_reset') => {
    const allowed = await checkRateLimit({
      identifier: email,
      attemptType: type
    });

    if (!allowed) {
      await logSecurityEvent('rate_limit_exceeded', 'auth', {
        email,
        attempt_type: type,
        timestamp: new Date().toISOString()
      });
    }

    return allowed;
  };

  const contextValue: SecurityContextType = {
    checkAuthRateLimit,
    logSecurityEvent,
    isRateLimited: isBlocked
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};
