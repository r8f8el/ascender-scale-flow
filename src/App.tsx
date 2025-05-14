
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientLogin from "./pages/ClientLogin";
import ClientArea from "./pages/ClientArea";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientRequests from "./pages/client/ClientRequests";
import ClientSchedule from "./pages/client/ClientSchedule";
import ClientContact from "./pages/client/ClientContact";
import AuthProvider from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin imports
import AdminAuthProvider from "./contexts/AdminAuthContext";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminArea from "./pages/AdminArea";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUnauthorized from "./pages/AdminUnauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              
              {/* Client routes */}
              <Route path="/cliente/login" element={<ClientLogin />} />
              <Route path="/cliente" element={<ProtectedRoute><ClientArea /></ProtectedRoute>}>
                <Route index element={<ProtectedRoute><ClientDocuments /></ProtectedRoute>} />
                <Route path="documentos" element={<ProtectedRoute><ClientDocuments /></ProtectedRoute>} />
                <Route path="solicitacoes" element={<ProtectedRoute><ClientRequests /></ProtectedRoute>} />
                <Route path="cronograma" element={<ProtectedRoute><ClientSchedule /></ProtectedRoute>} />
                <Route path="contato" element={<ProtectedRoute><ClientContact /></ProtectedRoute>} />
              </Route>
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
              <Route path="/admin" element={<AdminProtectedRoute><AdminArea /></AdminProtectedRoute>}>
                <Route index element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="clientes" element={<AdminProtectedRoute><NotFound /></AdminProtectedRoute>} />
                <Route path="arquivos" element={<AdminProtectedRoute><NotFound /></AdminProtectedRoute>} />
                <Route path="cronogramas" element={<AdminProtectedRoute><NotFound /></AdminProtectedRoute>} />
                <Route path="solicitacoes" element={<AdminProtectedRoute><NotFound /></AdminProtectedRoute>} />
                <Route path="mensagens" element={<AdminProtectedRoute><NotFound /></AdminProtectedRoute>} />
                <Route path="logs" element={<AdminProtectedRoute><NotFound /></AdminProtectedRoute>} />
                <Route path="configuracoes" element={<AdminProtectedRoute><NotFound /></AdminProtectedRoute>} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
