
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import AuthProvider from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { useMonitoring } from "@/hooks/useMonitoring";

// Pages
import Index from "./pages/Index";
import ClientArea from "./pages/client/ClientArea";
import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminArea from "./pages/AdminArea";
import AbrirChamado from "./pages/AbrirChamado";
import ParticipantData from "./pages/ParticipantData";
import NewsletterSignup from "./pages/NewsletterSignup";
import AcceptInvitation from "./pages/AcceptInvitation";
import NotFound from "./pages/NotFound";
import AdminUnauthorized from "./pages/AdminUnauthorized";

// Protected Routes
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import "./App.css";

const queryClient = new QueryClient();

// Component to track navigation
const NavigationTracker = () => {
  const { trackEvent } = useMonitoring();
  
  useEffect(() => {
    trackEvent('navigation', window.location.pathname);
  }, [trackEvent]);
  
  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <NavigationTracker />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/client/login" element={<ClientLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route path="/abrir-chamado" element={<AbrirChamado />} />
                <Route path="/dados-participante" element={<ParticipantData />} />
                <Route path="/newsletter" element={<NewsletterSignup />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />
                <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />

                {/* Client Protected Routes */}
                <Route
                  path="/client/*"
                  element={
                    <ProtectedRoute>
                      <ClientArea />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminProtectedRoute>
                      <AdminArea />
                    </AdminProtectedRoute>
                  }
                />

                {/* Redirects */}
                <Route path="/admin" element={<Navigate to="/admin/" replace />} />
                <Route path="/client" element={<Navigate to="/client/" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
