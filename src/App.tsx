
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AuthProvider from '@/contexts/AuthContext';
import AdminAuthProvider from '@/contexts/AdminAuthContext';
import AdminArea from '@/pages/admin/AdminArea';
import ClientArea from '@/pages/client/ClientArea';
import { useMonitoring } from '@/hooks/useMonitoring';

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Monitoring Provider Component
const MonitoringProvider = ({ children }: { children: React.ReactNode }) => {
  useMonitoring();
  return <>{children}</>;
};

// App Content Component
const AppContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <MonitoringProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/client" replace />} />
          <Route path="/admin/*" element={<AdminArea />} />
          <Route path="/client/*" element={<ClientArea />} />
        </Routes>
      </MonitoringProvider>
      <Toaster position="top-right" richColors />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
