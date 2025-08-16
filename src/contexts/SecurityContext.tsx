
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useAdminAuth } from './AdminAuthContext';
import { logSecurityEvent } from '@/utils/security';

interface SecurityContextType {
  logActivity: (activity: string, details?: any) => Promise<void>;
  monitorSuspiciousActivity: (activity: string, risk: 'low' | 'medium' | 'high') => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { admin } = useAdminAuth();
  const currentUser = user || admin;

  // Monitor page access
  useEffect(() => {
    if (currentUser) {
      const logPageAccess = () => {
        logSecurityEvent('PAGE_ACCESS', `User accessed ${window.location.pathname}`, {
          userId: currentUser.id,
          userEmail: currentUser.email,
          path: window.location.pathname,
          referrer: document.referrer
        });
      };

      logPageAccess();
      
      // Log on route change
      const handleRouteChange = () => logPageAccess();
      window.addEventListener('popstate', handleRouteChange);
      
      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  }, [currentUser]);

  // Monitor failed authentication attempts
  useEffect(() => {
    const monitorAuthFailures = () => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        
        if (args[0]?.toString().includes('/auth/') && !response.ok) {
          await logSecurityEvent('AUTH_FAILURE', 'Authentication attempt failed', {
            url: args[0],
            status: response.status,
            statusText: response.statusText
          });
        }
        
        return response;
      };

      return () => {
        window.fetch = originalFetch;
      };
    };

    return monitorAuthFailures();
  }, []);

  const logActivity = async (activity: string, details: any = {}) => {
    await logSecurityEvent('USER_ACTIVITY', activity, {
      ...details,
      userId: currentUser?.id,
      userEmail: currentUser?.email
    });
  };

  const monitorSuspiciousActivity = async (activity: string, risk: 'low' | 'medium' | 'high') => {
    await logSecurityEvent('SUSPICIOUS_ACTIVITY', activity, {
      riskLevel: risk,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      timestamp: new Date().toISOString()
    });

    if (risk === 'high') {
      console.warn('High-risk security event detected:', activity);
    }
  };

  const value: SecurityContextType = {
    logActivity,
    monitorSuspiciousActivity
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
