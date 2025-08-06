
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from './contexts/AuthContext';
import AdminAuthProvider from './contexts/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { useMonitoring } from './hooks/useMonitoring';
import Index from "./pages/Index";
import AbrirChamado from "./pages/AbrirChamado";
import ParticipantData from "./pages/ParticipantData";
import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AcceptInvitation from "./pages/AcceptInvitation";
import ClientAreaMain from "./pages/client/ClientArea";
import AdminArea from "./pages/admin/AdminArea";
import AdminUnauthorized from "./pages/AdminUnauthorized";
import NotFound from "./pages/NotFound";
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const { logError } = useMonitoring();
  
  // Global error handler
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(new Error(event.reason), { type: 'unhandledRejection' });
    };

    const handleError = (event: ErrorEvent) => {
      logError(event.error, { type: 'globalError' });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [logError]);

  return <>{children}</>;
}

function AppContent() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MonitoringProvider>
            <ScrollToTop />
            <AuthProvider>
              <AdminAuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/abrir-chamado" element={<AbrirChamado />} />
                  <Route path="/participante" element={<ParticipantData />} />
                  <Route path="/cliente/login" element={<ClientLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
                  <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  
                  <Route 
                    path="/cliente/*" 
                    element={
                      <ProtectedRoute>
                        <ClientAreaMain />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin/*" 
                    element={
                      <AdminProtectedRoute>
                        <AdminArea />
                      </AdminProtectedRoute>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminAuthProvider>
            </AuthProvider>
          </MonitoringProvider>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </TooltipProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
