import { useState, useEffect, useCallback, useRef } from 'react';
import { useDataCache } from './useDataCache';

interface QueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
}

const defaultOptions: QueryOptions = {
  enabled: true,
  refetchOnWindowFocus: false,
  refetchInterval: 0,
  staleTime: 30000, // 30 seconds
  cacheTime: 300000, // 5 minutes
  retry: 3,
  retryDelay: 1000
};

export function useOptimizedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
) {
  const config = { ...defaultOptions, ...options };
  const { fetchWithCache, invalidate, isLoading: cacheLoading } = useDataCache<T>({
    ttl: config.cacheTime,
    maxSize: 50
  });

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const retryCount = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const executeQuery = useCallback(async (isRefetch = false) => {
    if (!config.enabled) return;

    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const result = await fetchWithCache(
        key,
        queryFn,
        isRefetch // Force refresh on refetch
      );
      setData(result);
      retryCount.current = 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (retryCount.current < config.retry!) {
        retryCount.current++;
        setTimeout(() => executeQuery(isRefetch), config.retryDelay);
        return;
      }
      
      setError(error);
      console.error(`Query failed for key "${key}":`, error);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [key, queryFn, config, fetchWithCache]);

  const refetch = useCallback(() => {
    return executeQuery(true);
  }, [executeQuery]);

  const invalidateQuery = useCallback(() => {
    invalidate(key);
  }, [invalidate, key]);

  // Initial fetch
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  // Refetch interval
  useEffect(() => {
    if (config.refetchInterval && config.refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        executeQuery(true);
      }, config.refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [config.refetchInterval, executeQuery]);

  // Window focus refetch
  useEffect(() => {
    if (config.refetchOnWindowFocus) {
      const handleFocus = () => executeQuery(true);
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [config.refetchOnWindowFocus, executeQuery]);

  return {
    data,
    error,
    isLoading: isLoading || cacheLoading,
    isRefetching,
    refetch,
    invalidateQuery,
    isSuccess: !isLoading && !error && data !== null,
    isError: !!error
  };
}