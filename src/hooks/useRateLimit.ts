
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RateLimitOptions {
  maxAttempts?: number;
  windowMinutes?: number;
  action: string;
}

export const useRateLimit = () => {
  const [isLimited, setIsLimited] = useState(false);
  const { user } = useAuth();

  const checkRateLimit = async (options: RateLimitOptions): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_action_type: options.action,
        p_max_attempts: options.maxAttempts || 5,
        p_window_minutes: options.windowMinutes || 15
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow the action if we can't check rate limit
      }

      const allowed = data as boolean;
      
      if (!allowed) {
        setIsLimited(true);
        toast.error(`Muitas tentativas. Tente novamente em ${options.windowMinutes || 15} minutos.`);
        
        // Reset rate limit status after the window
        setTimeout(() => {
          setIsLimited(false);
        }, (options.windowMinutes || 15) * 60 * 1000);
      }

      return allowed;
    } catch (error: any) {
      console.error('Rate limit check failed:', error);
      return true; // Allow the action if rate limit check fails
    }
  };

  return {
    checkRateLimit,
    isLimited
  };
};
