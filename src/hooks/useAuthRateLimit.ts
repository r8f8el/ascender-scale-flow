
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitState {
  isBlocked: boolean;
  attemptsRemaining: number;
  resetTime: Date | null;
}

export const useAuthRateLimit = () => {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isBlocked: false,
    attemptsRemaining: 5,
    resetTime: null
  });

  const checkRateLimit = useCallback(async (identifier: string, attemptType: string = 'login') => {
    try {
      console.log('🔒 Verificando rate limit para:', identifier);

      const { data: isAllowed, error } = await supabase
        .rpc('check_auth_rate_limit', {
          p_identifier: identifier,
          p_attempt_type: attemptType,
          p_max_attempts: 5,
          p_window_minutes: 15,
          p_block_minutes: 30
        });

      if (error) {
        console.error('❌ Erro ao verificar rate limit:', error);
        return true; // Allow on error to not block legitimate users
      }

      console.log('🔒 Rate limit result:', isAllowed);

      if (!isAllowed) {
        setRateLimitState({
          isBlocked: true,
          attemptsRemaining: 0,
          resetTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception em rate limit:', error);
      return true; // Allow on exception
    }
  }, []);

  const resetRateLimit = useCallback(() => {
    setRateLimitState({
      isBlocked: false,
      attemptsRemaining: 5,
      resetTime: null
    });
  }, []);

  return {
    rateLimitState,
    checkRateLimit,
    resetRateLimit
  };
};
