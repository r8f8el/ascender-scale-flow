
import { useState } from 'react';
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
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = async (options: RateLimitOptions): Promise<boolean> => {
    try {
      setIsChecking(true);
      
      const { data, error } = await supabase.rpc('check_auth_rate_limit', {
        p_identifier: options.identifier,
        p_attempt_type: options.attemptType,
        p_max_attempts: options.maxAttempts || 5,
        p_window_minutes: options.windowMinutes || 15,
        p_block_minutes: options.blockMinutes || 30
      });

      if (error) {
        console.error('Error checking rate limit:', error);
        return true; // Allow on error to prevent blocking legitimate users
      }

      const allowed = Boolean(data);
      setIsBlocked(!allowed);
      
      if (!allowed) {
        toast.error('Muitas tentativas de login. Tente novamente em alguns minutos.');
      }

      return allowed;
    } catch (error) {
      console.error('Exception in checkRateLimit:', error);
      return true; // Allow on error
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkRateLimit,
    isBlocked,
    isChecking
  };
};
