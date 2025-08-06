
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  apiResponseTime: number;
  errorCount: number;
}

interface UserEvent {
  type: 'click' | 'navigation' | 'error' | 'api_call';
  element?: string;
  page: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private static instance: MonitoringService;
  private sessionId: string;
  private events: UserEvent[] = [];
  private performance: Partial<PerformanceMetrics> = {};
  private loggedPages = new Set<string>();
  
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.initPerformanceTracking();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initPerformanceTracking() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          this.performance.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        }, 0);
      });
    }
  }

  logEvent(event: Omit<UserEvent, 'sessionId'>): void {
    const fullEvent: UserEvent = {
      ...event,
      sessionId: this.sessionId
    };
    
    this.events.push(fullEvent);
    
    // Only log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Event logged:', fullEvent);
    }
  }

  logNavigation(pathname: string): void {
    // Avoid duplicate navigation logs for the same page
    const pageKey = pathname;
    if (this.loggedPages.has(pageKey)) {
      return;
    }
    
    this.loggedPages.add(pageKey);
    
    this.logEvent({
      type: 'navigation',
      page: pathname,
      timestamp: Date.now()
    });

    // Clean up old logged pages to prevent memory leaks
    if (this.loggedPages.size > 50) {
      const firstPage = this.loggedPages.values().next().value;
      this.loggedPages.delete(firstPage);
    }
  }

  logError(error: Error, context?: Record<string, any>): void {
    this.logEvent({
      type: 'error',
      page: window.location.pathname,
      timestamp: Date.now(),
      metadata: {
        message: error.message,
        stack: error.stack,
        context
      }
    });

    this.performance.errorCount = (this.performance.errorCount || 0) + 1;
  }

  logAPICall(url: string, method: string, duration: number, status?: number): void {
    this.logEvent({
      type: 'api_call',
      page: window.location.pathname,
      timestamp: Date.now(),
      metadata: { url, method, duration, status }
    });

    this.performance.apiResponseTime = duration;
  }

  getPerformanceMetrics(): Partial<PerformanceMetrics> {
    return { ...this.performance };
  }

  getSessionEvents(): UserEvent[] {
    return [...this.events];
  }
}

export const useMonitoring = () => {
  const location = useLocation();
  const monitoring = MonitoringService.getInstance();
  const lastPathname = useRef<string>('');

  useEffect(() => {
    // Only log if the pathname actually changed
    if (location.pathname !== lastPathname.current) {
      monitoring.logNavigation(location.pathname);
      lastPathname.current = location.pathname;
    }
  }, [location.pathname, monitoring]);

  const logClick = (element: string, metadata?: Record<string, any>) => {
    monitoring.logEvent({
      type: 'click',
      element,
      page: location.pathname,
      timestamp: Date.now(),
      metadata
    });
  };

  const logError = (error: Error, context?: Record<string, any>) => {
    monitoring.logError(error, context);
  };

  const logAPICall = (url: string, method: string, duration: number, status?: number) => {
    monitoring.logAPICall(url, method, duration, status);
  };

  const getMetrics = () => monitoring.getPerformanceMetrics();
  const getEvents = () => monitoring.getSessionEvents();

  return {
    logClick,
    logError,
    logAPICall,
    getMetrics,
    getEvents
  };
};
