
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientLogin from "./pages/ClientLogin";
import ClientArea from "./pages/ClientArea";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientRequests from "./pages/client/ClientRequests";
import ClientSchedule from "./pages/client/ClientSchedule";
import ClientContact from "./pages/client/ClientContact";
import ParticipantData from "./pages/ParticipantData";
import AuthProvider from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AbrirChamado from './pages/AbrirChamado';
import ClientTickets from './pages/client/ClientTickets';
import ClientTicketDetail from './pages/client/ClientTicketDetail';
import ClientTeam from './pages/client/ClientTeam';
import AcceptInvitation from './pages/AcceptInvitation';

// Admin imports
import AdminAuthProvider from "./contexts/AdminAuthContext";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminArea from "./pages/AdminArea";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUnauthorized from "./pages/AdminUnauthorized";
import ClientesAdmin from "./pages/admin/ClientesAdmin";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import CollaboratorsAdmin from "./pages/admin/CollaboratorsAdmin";
import TasksAdmin from "./pages/admin/TasksAdmin";
import ArquivosAdmin from "./pages/admin/ArquivosAdmin";
import CronogramasAdmin from "./pages/admin/CronogramasAdmin";
import TicketsAdmin from "./pages/admin/TicketsAdmin";
import MensagensAdmin from "./pages/admin/MensagensAdmin";
import LogsAdmin from "./pages/admin/LogsAdmin";
import ActivityLogsAdmin from "./pages/admin/ActivityLogsAdmin";
import ConfiguracoesAdmin from "./pages/admin/ConfiguracoesAdmin";
import OneDriveIntegration from "./pages/admin/OneDriveIntegration";
import MyTickets from "./pages/admin/MyTickets";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <AdminAuthProvider>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/participante-dados" element={<ParticipantData />} />
                  <Route path="/convite/:invitationId" element={<AcceptInvitation />} />
                  
                  {/* Client routes */}
                  <Route path="/cliente/login" element={<ClientLogin />} />
                  <Route path="/cliente" element={<ProtectedRoute><ClientArea /></ProtectedRoute>}>
                    <Route index element={<ProtectedRoute><ClientDocuments /></ProtectedRoute>} />
                    <Route path="equipe" element={<ProtectedRoute><ClientTeam /></ProtectedRoute>} />
                    <Route path="solicitacoes" element={<ProtectedRoute><ClientRequests /></ProtectedRoute>} />
                    <Route path="cronograma" element={<ProtectedRoute><ClientSchedule /></ProtectedRoute>} />
                    <Route path="contato" element={<ProtectedRoute><ClientContact /></ProtectedRoute>} />
                    <Route path="chamados" element={<ClientTickets />} />
                    <Route path="chamados/:id" element={<ClientTicketDetail />} />
                  </Route>
                  
                  {/* Página pública de abertura de chamado */}
                  <Route path="/abrir-chamado" element={<AbrirChamado />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
                  <Route path="/admin" element={<AdminProtectedRoute><AdminArea /></AdminProtectedRoute>}>
                    <Route index element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                    <Route path="clientes" element={<AdminProtectedRoute><ClientesAdmin /></AdminProtectedRoute>} />
                    <Route path="projetos" element={<AdminProtectedRoute><ProjectsAdmin /></AdminProtectedRoute>} />
                    <Route path="colaboradores" element={<AdminProtectedRoute><CollaboratorsAdmin /></AdminProtectedRoute>} />
                    <Route path="tarefas" element={<AdminProtectedRoute><TasksAdmin /></AdminProtectedRoute>} />
                    <Route path="chamados" element={<AdminProtectedRoute><TicketsAdmin /></AdminProtectedRoute>} />
                    <Route path="arquivos" element={<AdminProtectedRoute><ArquivosAdmin /></AdminProtectedRoute>} />
                    <Route path="cronogramas" element={<AdminProtectedRoute><CronogramasAdmin /></AdminProtectedRoute>} />
                    <Route path="mensagens" element={<AdminProtectedRoute><MensagensAdmin /></AdminProtectedRoute>} />
                    <Route path="logs" element={<AdminProtectedRoute><LogsAdmin /></AdminProtectedRoute>} />
                    <Route path="activity-logs" element={<AdminProtectedRoute><ActivityLogsAdmin /></AdminProtectedRoute>} />
                    <Route path="configuracoes" element={<AdminProtectedRoute><ConfiguracoesAdmin /></AdminProtectedRoute>} />
                    <Route path="onedrive" element={<AdminProtectedRoute><OneDriveIntegration /></AdminProtectedRoute>} />
                    <Route path="meus-chamados" element={<AdminProtectedRoute><MyTickets /></AdminProtectedRoute>} />
                  </Route>
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <Sonner />
              </div>
            </AdminAuthProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
