
export const MonitoringConfig = {
  // Performance thresholds
  performance: {
    pageLoadThreshold: 3000, // 3s
    apiResponseThreshold: 1000, // 1s
    renderThreshold: 500, // 500ms
    memoryUsageThreshold: 50 * 1024 * 1024, // 50MB
  },

  // Error tracking
  errorTracking: {
    enableInDevelopment: true,
    enableInProduction: true,
    maxErrorsPerSession: 50,
    sentryDsn: process.env.VITE_SENTRY_DSN,
  },

  // Analytics
  analytics: {
    enableUserTracking: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    eventBufferSize: 100,
    flushInterval: 10000, // 10s
  },

  // Features flags
  features: {
    enableRealTimeMonitoring: true,
    enablePerformanceMetrics: true,
    enableUserBehaviorTracking: true,
    enableAPIMonitoring: true,
  }
};

export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isDevelopment,
    isProduction,
    logLevel: isDevelopment ? 'debug' : 'error',
    enableConsoleLogging: isDevelopment,
  };
};
