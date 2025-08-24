
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminArea from "./pages/AdminArea";
import ClientArea from "./pages/client/ClientArea";
import AbrirChamado from "./pages/AbrirChamado";
import ParticipantData from "./pages/ParticipantData";
import NewsletterSignup from "./pages/NewsletterSignup";
import NotFound from "./pages/NotFound";
import AcceptInvitation from "./pages/AcceptInvitation";
import TeamInviteSignup from "./pages/TeamInviteSignup";
import ConviteEquipeCadastro from "./pages/ConviteEquipeCadastro";
import SecureTeamInviteSignup from "./pages/SecureTeamInviteSignup";
import AdminUnauthorized from "./pages/AdminUnauthorized";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ClientProvider } from "./contexts/ClientContext";
import { UserProvider } from "./contexts/UserContext";
import AdminAuthProvider from "./contexts/AdminAuthContext";

// Protected Routes
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AdminAuthProvider>
              <UserProvider>
                <ClientProvider>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/cliente/login" element={<ClientLogin />} />
                    <Route path="/abrir-chamado" element={<AbrirChamado />} />
                    <Route path="/dados-participante" element={<ParticipantData />} />
                    <Route path="/newsletter" element={<NewsletterSignup />} />
                    <Route path="/aceitar-convite" element={<AcceptInvitation />} />
                    <Route path="/convite-cadastro" element={<TeamInviteSignup />} />
                    <Route path="/convite-equipe" element={<ConviteEquipeCadastro />} />
                    <Route path="/convite-seguro" element={<SecureTeamInviteSignup />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
                    <Route 
                      path="/admin/*" 
                      element={
                        <AdminProtectedRoute>
                          <AdminArea />
                        </AdminProtectedRoute>
                      } 
                    />
                    
                    {/* Client Routes */}
                    <Route 
                      path="/cliente/*" 
                      element={
                        <ProtectedRoute>
                          <ClientArea />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ClientProvider>
              </UserProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
