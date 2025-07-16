import { useState, useCallback, useRef } from 'react';

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of cached items
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

const defaultConfig: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
};

export function useDataCache<T>(config: CacheConfig = {}) {
  const { ttl, maxSize } = { ...defaultConfig, ...config };
  const cache = useRef(new Map<string, CacheEntry<T>>());
  const [isLoading, setIsLoading] = useState(false);

  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of cache.current.entries()) {
      if (now - entry.timestamp > ttl!) {
        cache.current.delete(key);
      }
    }
  }, [ttl]);

  const get = useCallback((key: string): T | null => {
    cleanupExpired();
    const entry = cache.current.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > ttl!) {
      cache.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, [ttl, cleanupExpired]);

  const set = useCallback((key: string, data: T) => {
    // Clean up if cache is too large
    if (cache.current.size >= maxSize!) {
      const oldestKey = cache.current.keys().next().value;
      if (oldestKey) {
        cache.current.delete(oldestKey);
      }
    }

    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }, [maxSize]);

  const fetchWithCache = useCallback(async (
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> => {
    // Check cache first
    if (!forceRefresh) {
      const cached = get(key);
      if (cached !== null) {
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const data = await fetcher();
      set(key, data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [get, set]);

  const invalidate = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  const invalidatePattern = useCallback((pattern: string) => {
    const regex = new RegExp(pattern);
    for (const key of cache.current.keys()) {
      if (regex.test(key)) {
        cache.current.delete(key);
      }
    }
  }, []);

  return {
    get,
    set,
    fetchWithCache,
    invalidate,
    invalidatePattern,
    isLoading,
    size: cache.current.size
  };
}