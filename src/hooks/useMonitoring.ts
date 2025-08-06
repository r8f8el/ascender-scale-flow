
import { useEffect } from 'react';
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
    // Track page load performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          this.performance.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        }, 0);
      });

      // Track Core Web Vitals
      this.trackCoreWebVitals();
    }
  }

  private trackCoreWebVitals() {
    // Simplified CWV tracking - em produção usar web-vitals library
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
          this.logEvent({
            type: 'api_call',
            page: window.location.pathname,
            timestamp: Date.now(),
            metadata: { metric: 'LCP', value: lastEntry.startTime }
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  logEvent(event: Omit<UserEvent, 'sessionId'>): void {
    const fullEvent: UserEvent = {
      ...event,
      sessionId: this.sessionId
    };
    
    this.events.push(fullEvent);
    console.log('Event logged:', fullEvent);

    // Em produção, enviar para serviço de analytics
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(fullEvent);
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

    // Track average API response time
    this.performance.apiResponseTime = duration;
  }

  private sendToAnalytics(event: UserEvent): void {
    // Em produção, enviar para Google Analytics, Mixpanel, etc.
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
    console.log('Would send to analytics:', event);
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

  useEffect(() => {
    // Log page navigation
    monitoring.logEvent({
      type: 'navigation',
      page: location.pathname,
      timestamp: Date.now()
    });
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
