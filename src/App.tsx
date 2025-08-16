
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { SecureAuthWrapper } from "./components/security/SecureAuthWrapper";
import Index from "./pages/Index";
import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import ClientArea from "./pages/ClientArea";
import AdminArea from "./pages/AdminArea";
import AbrirChamado from "./pages/AbrirChamado";
import NewsletterSignup from "./pages/NewsletterSignup";
import ParticipantData from "./pages/ParticipantData";
import NotFound from "./pages/NotFound";
import AcceptInvitation from "./pages/AcceptInvitation";
import TeamInviteSignup from "./pages/TeamInviteSignup";
import SecureTeamInviteSignup from "./pages/SecureTeamInviteSignup";
import AdminUnauthorized from "./pages/AdminUnauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <SecureAuthWrapper>
            <AuthProvider>
              <AdminAuthProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/cliente/login" element={<ClientLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/abrir-chamado" element={<AbrirChamado />} />
                  <Route path="/newsletter" element={<NewsletterSignup />} />
                  <Route path="/dados-participante" element={<ParticipantData />} />
                  <Route path="/convite/:token" element={<AcceptInvitation />} />
                  <Route path="/convite-equipe/:invitationId" element={<TeamInviteSignup />} />
                  <Route path="/convite-seguro/:invitationId" element={<SecureTeamInviteSignup />} />
                  <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
                  
                  {/* Protected client routes */}
                  <Route path="/cliente/*" element={
                    <ProtectedRoute>
                      <ClientArea />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected admin routes */}
                  <Route path="/admin/*" element={
                    <AdminProtectedRoute>
                      <AdminArea />
                    </AdminProtectedRoute>
                  } />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminAuthProvider>
            </AuthProvider>
          </SecureAuthWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
