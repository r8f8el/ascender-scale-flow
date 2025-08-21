
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ClientProvider } from "./contexts/ClientContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import ClientLogin from "./pages/ClientLogin";
import AdminArea from "./pages/AdminArea";
import AdminDashboard from "./pages/AdminDashboard";
import AbrirChamado from "./pages/AbrirChamado";
import NotFound from "./pages/NotFound";
import ParticipantData from "./pages/ParticipantData";
import NewsletterSignup from "./pages/NewsletterSignup";
import ConviteEquipeCadastro from "./pages/ConviteEquipeCadastro";
import TeamInviteSignup from "./pages/TeamInviteSignup";
import SecureTeamInviteSignup from "./pages/SecureTeamInviteSignup";
import AcceptInvitation from "./pages/AcceptInvitation";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <AuthProvider>
              <AdminAuthProvider>
                <ClientProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/cliente/login" element={<ClientLogin />} />
                    <Route path="/abrir-chamado" element={<AbrirChamado />} />
                    <Route path="/participant-data" element={<ParticipantData />} />
                    <Route path="/newsletter-signup" element={<NewsletterSignup />} />
                    <Route path="/convite-equipe/cadastro" element={<ConviteEquipeCadastro />} />
                    <Route path="/convite-equipe/signup" element={<TeamInviteSignup />} />
                    <Route path="/convite-seguro" element={<SecureTeamInviteSignup />} />
                    <Route path="/accept-invitation" element={<AcceptInvitation />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/*" element={
                      <AdminProtectedRoute>
                        <AdminArea />
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Client Routes */}
                    <Route path="/cliente/*" element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ClientProvider>
              </AdminAuthProvider>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
