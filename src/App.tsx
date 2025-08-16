
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "@/contexts/AuthContext";
import AdminAuthProvider from "@/contexts/AdminAuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useMonitoring } from "@/hooks/useMonitoring";

// Pages
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import AdminLogin from "@/pages/AdminLogin";
import ClientArea from "@/pages/ClientArea";
import AdminArea from "@/pages/AdminArea";
import AbrirChamado from "@/pages/AbrirChamado";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Component to track navigation
const NavigationTracker = () => {
  const { logClick } = useMonitoring();
  
  useEffect(() => {
    // Log navigation event using logClick since trackEvent doesn't exist
    logClick('navigation', { path: window.location.pathname });
  }, [logClick]);
  
  return null;
};

// Error boundary for theme-related errors
class ThemeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Theme error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }

    return this.props.children;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeErrorBoundary>
        <ThemeProvider>
          <BrowserRouter>
            <NavigationTracker />
            <AuthProvider>
              <AdminAuthProvider>
                <div className="min-h-screen">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/cliente/login" element={<ClientLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    
                    {/* Public ticket route */}
                    <Route path="/abrir-chamado" element={<AbrirChamado />} />
                    
                    {/* Client Protected Routes */}
                    <Route path="/cliente/*" element={
                      <ProtectedRoute>
                        <ClientArea />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin Protected Routes */}
                    <Route path="/admin/*" element={
                      <AdminProtectedRoute>
                        <AdminArea />
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <Toaster />
                <Sonner />
              </AdminAuthProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </ThemeErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
