
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import ClientArea from "./pages/ClientArea";
import AdminArea from "./pages/AdminArea";
import ClientLogin from "./pages/ClientLogin";
import AbrirChamado from "./pages/AbrirChamado";
import NewsletterSignup from "./pages/NewsletterSignup";
import ParticipantData from "./pages/ParticipantData";
import AuthProvider from "./contexts/AuthContext";
import AdminAuthProvider from "./contexts/AdminAuthContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUnauthorized from "./pages/AdminUnauthorized";
import AdminRegister from "./pages/AdminRegister";
import AcceptInvitation from "./pages/AcceptInvitation";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HelmetProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <AdminAuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/abrir-chamado" element={<AbrirChamado />} />
                  <Route path="/cliente/*" element={<ClientArea />} />
                  <Route path="/cliente/login" element={<ClientLogin />} />
                  <Route path="/admin/*" element={<AdminArea />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
                  <Route path="/newsletter" element={<NewsletterSignup />} />
                  <Route path="/participant-data" element={<ParticipantData />} />
                  <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminAuthProvider>
            </AuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
