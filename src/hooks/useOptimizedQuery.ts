
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  cacheTTL?: number; // Cache time in minutes
}

export const useOptimizedQuery = <T>({
  queryKey,
  queryFn,
  cacheTTL = 5, // Default 5 minutes cache
  ...options
}: OptimizedQueryOptions<T>) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: cacheTTL * 60 * 1000, // Convert minutes to milliseconds
    gcTime: (cacheTTL + 5) * 60 * 1000, // Keep in cache a bit longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options
  });
};

// Hook específico para dados que mudam raramente (como níveis hierárquicos)
export const useStaticDataQuery = <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>
) => {
  return useOptimizedQuery({
    queryKey,
    queryFn,
    cacheTTL: 30, // 30 minutes cache for static data
    staleTime: Infinity, // Never consider stale until manually invalidated
  });
};
