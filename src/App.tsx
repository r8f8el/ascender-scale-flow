
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cliente/login" element={<ClientLogin />} />
            <Route path="/cliente" element={<ProtectedRoute><ClientArea /></ProtectedRoute>}>
              <Route index element={<ProtectedRoute><ClientDocuments /></ProtectedRoute>} />
              <Route path="documentos" element={<ProtectedRoute><ClientDocuments /></ProtectedRoute>} />
              <Route path="solicitacoes" element={<ProtectedRoute><ClientRequests /></ProtectedRoute>} />
              <Route path="cronograma" element={<ProtectedRoute><ClientSchedule /></ProtectedRoute>} />
              <Route path="contato" element={<ProtectedRoute><ClientContact /></ProtectedRoute>} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
