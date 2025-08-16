
import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";

// Import contexts with error handling
import AuthProvider from "@/contexts/AuthContext";
import AdminAuthProvider from "@/contexts/AdminAuthContext";

// Import theme components
import { ThemeProvider } from "@/components/theme/ThemeProvider";

// Import pages  
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import AdminLogin from "@/pages/AdminLogin";
import ClientArea from "@/pages/ClientArea";
import AdminArea from "@/pages/AdminArea";
import AbrirChamado from "@/pages/AbrirChamado";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Simple error boundary component
const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('App Error:', error);
    setHasError(true);
    return null;
  }
};

function App() {
  console.log('App: Starting render');

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
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
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
