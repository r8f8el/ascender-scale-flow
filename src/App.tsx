import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Index from "./pages/Index";
import ClientLogin from "./pages/ClientLogin";
import ClientArea from "./pages/ClientArea";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminArea from "./pages/AdminArea";
import AbrirChamado from "./pages/AbrirChamado";
import ParticipantData from "./pages/ParticipantData";
import NewsletterSignup from "./pages/NewsletterSignup";
import NotFound from "./pages/NotFound";
import SecureTeamInviteSignup from "./pages/SecureTeamInviteSignup";
import TeamInviteSignup from "./pages/TeamInviteSignup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/cliente/login" element={<ClientLogin />} />
                <Route path="/cliente/*" element={<ClientArea />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route path="/admin/*" element={<AdminArea />} />
                <Route path="/abrir-chamado" element={<AbrirChamado />} />
                <Route path="/participant-data" element={<ParticipantData />} />
                <Route path="/newsletter" element={<NewsletterSignup />} />
                <Route path="/convite-seguro" element={<SecureTeamInviteSignup />} />
				        <Route path="/convite/inscrever" element={<TeamInviteSignup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
