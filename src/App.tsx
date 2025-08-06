
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import AuthProvider from "@/contexts/AuthContext";
import AdminAuthProvider from "@/contexts/AdminAuthContext";
import { useMonitoring } from "@/hooks/useMonitoring";

// Pages
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import AdminLogin from "@/pages/AdminLogin";
import ClientArea from "@/pages/ClientArea";
import ClientFPADashboard from "@/pages/client/fpa/ClientFPADashboard";
import AdminArea from "@/pages/admin/AdminArea";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";

// Component to track navigation
const NavigationTracker = () => {
  const { logClick } = useMonitoring();
  
  useEffect(() => {
    // Log navigation event using logClick since trackEvent doesn't exist
    logClick('navigation', { path: window.location.pathname });
  }, [logClick]);
  
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <NavigationTracker />
      <AuthProvider>
        <AdminAuthProvider>
          <div className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<ClientLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Client Protected Routes */}
              <Route path="/client/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="dashboard" element={<ClientArea />} />
                    <Route path="fpa/*" element={<ClientFPADashboard />} />
                    <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              } />
              
              {/* Admin Protected Routes - with wildcard to handle subroutes */}
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
  );
}

export default App;
