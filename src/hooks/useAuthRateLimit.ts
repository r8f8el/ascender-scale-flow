
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateLimitOptions {
  identifier: string;
  attemptType: 'login' | 'signup' | 'password_reset';
  maxAttempts?: number;
  windowMinutes?: number;
  blockMinutes?: number;
}

export const useAuthRateLimit = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkRateLimit = useCallback(async ({
    identifier,
    attemptType,
    maxAttempts = 5,
    windowMinutes = 15,
    blockMinutes = 30
  }: RateLimitOptions): Promise<boolean> => {
    setChecking(true);
    
    try {
      const { data, error } = await supabase.rpc('check_auth_rate_limit', {
        p_identifier: identifier.toLowerCase(),
        p_attempt_type: attemptType,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes,
        p_block_minutes: blockMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to prevent lockout
      }

      const allowed = data as boolean;
      
      if (!allowed) {
        setIsBlocked(true);
        toast.error(`Muitas tentativas de ${attemptType}. Tente novamente em ${blockMinutes} minutos.`);
        
        // Reset blocked status after block period
        setTimeout(() => {
          setIsBlocked(false);
        }, blockMinutes * 60 * 1000);
      }

      return allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    checkRateLimit,
    isBlocked,
    checking
  };
};
