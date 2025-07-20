import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import AdminAuthProvider from "./contexts/AdminAuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import AbrirChamado from "./pages/AbrirChamado";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import ClientLogin from "./pages/ClientLogin";
import AcceptInvitation from "./pages/AcceptInvitation";
import ParticipantData from "./pages/ParticipantData";
import NewsletterSignup from "./pages/NewsletterSignup";
import NotFound from "./pages/NotFound";
import AdminUnauthorized from "./pages/AdminUnauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Client Area Pages
import ClientArea from "./pages/client/ClientArea";
import ClientContact from "./pages/client/ClientContact";
import ClientDocumentsNew from "./pages/client/ClientDocumentsNew";
import ClientRequests from "./pages/client/ClientRequests";
import ClientSchedule from "./pages/client/ClientSchedule";
import ClientTeam from "./pages/client/ClientTeam";
import ClientTickets from "./pages/client/ClientTickets";
import ClientTicketDetail from "./pages/client/ClientTicketDetail";

// Client FP&A Pages
import ClientFPADashboard from "./pages/client/fpa/ClientFPADashboard";
import ClientFPAData from "./pages/client/fpa/ClientFPAData";
import ClientFPAReports from "./pages/client/fpa/ClientFPAReports";
import ClientFPAScenarios from "./pages/client/fpa/ClientFPAScenarios";
import ClientFPACommunication from "./pages/client/fpa/ClientFPACommunication";

// Admin Area Pages  
import AdminArea from "./pages/admin/AdminArea";
import AdminDashboard from "./pages/AdminDashboard";
import ArquivosAdminNew from "./pages/admin/ArquivosAdminNew";
import ClientesAdmin from "./pages/admin/ClientesAdmin";
import ConfiguracoesAdmin from "./pages/admin/ConfiguracoesAdmin";
import CollaboratorsAdmin from "./pages/admin/CollaboratorsAdmin";
import CronogramasAdmin from "./pages/admin/CronogramasAdmin";
import LogsAdmin from "./pages/admin/LogsAdmin";
import ActivityLogsAdmin from "./pages/admin/ActivityLogsAdmin";
import MensagensAdmin from "./pages/admin/MensagensAdmin";
import MyTickets from "./pages/admin/MyTickets";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import SolicitacoesAdmin from "./pages/admin/SolicitacoesAdmin";
import TasksAdmin from "./pages/admin/TasksAdmin";
import TicketsAdmin from "./pages/admin/TicketsAdmin";
import OneDriveIntegration from "./pages/admin/OneDriveIntegration";

// Admin FP&A Pages
import AdminFPAClientManagement from "./pages/admin/fpa/AdminFPAClientManagement";
import AdminFPADataIntegration from "./pages/admin/fpa/AdminFPADataIntegration";
import AdminFPAReportBuilder from "./pages/admin/fpa/AdminFPAReportBuilder";
import AdminFPAVarianceAnalysis from "./pages/admin/fpa/AdminFPAVarianceAnalysis";
import AdminFPAModeling from "./pages/admin/fpa/AdminFPAModeling";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry for auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AuthProvider>
            <AdminAuthProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/abrir-chamado" element={<AbrirChamado />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/cliente/login" element={<ClientLogin />} />
                  <Route path="/aceitar-convite" element={<AcceptInvitation />} />
                  <Route path="/dados-participante" element={<ParticipantData />} />
                  <Route path="/newsletter" element={<NewsletterSignup />} />
                  <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />

                  {/* Client Protected Routes */}
                  <Route path="/cliente/*" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <Routes>
                          <Route index element={<ClientArea />} />
                          <Route path="contato" element={<ClientContact />} />
                          <Route path="documentos" element={<ClientDocumentsNew />} />
                          <Route path="solicitacoes" element={<ClientRequests />} />
                          <Route path="cronograma" element={<ClientSchedule />} />
                          <Route path="equipe" element={<ClientTeam />} />
                          <Route path="tickets" element={<ClientTickets />} />
                          <Route path="tickets/:ticketId" element={<ClientTicketDetail />} />

                          {/* Client FP&A Routes */}
                          <Route path="fpa/dashboard" element={<ClientFPADashboard />} />
                          <Route path="fpa/dados" element={<ClientFPAData />} />
                          <Route path="fpa/relatorios" element={<ClientFPAReports />} />
                          <Route path="fpa/cenarios" element={<ClientFPAScenarios />} />
                          <Route path="fpa/comunicacao" element={<ClientFPACommunication />} />
                        </Routes>
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />

                  {/* Admin Protected Routes */}
                  <Route path="/admin/*" element={
                    <ErrorBoundary>
                      <AdminProtectedRoute>
                        <Routes>
                          <Route index element={<AdminArea />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="arquivos" element={<ArquivosAdminNew />} />
                          <Route path="clientes" element={<ClientesAdmin />} />
                          <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
                          <Route path="colaboradores" element={<CollaboratorsAdmin />} />
                          <Route path="cronogramas" element={<CronogramasAdmin />} />
                          <Route path="logs" element={<LogsAdmin />} />
                          <Route path="activity-logs" element={<ActivityLogsAdmin />} />
                          <Route path="mensagens" element={<MensagensAdmin />} />
                          <Route path="meus-tickets" element={<MyTickets />} />
                          <Route path="projetos" element={<ProjectsAdmin />} />
                          <Route path="solicitacoes" element={<SolicitacoesAdmin />} />
                          <Route path="tarefas" element={<TasksAdmin />} />
                          <Route path="tickets" element={<TicketsAdmin />} />
                          <Route path="onedrive" element={<OneDriveIntegration />} />
                          
                          {/* Admin FP&A Routes */}
                          <Route path="fpa/clientes" element={<AdminFPAClientManagement />} />
                          <Route path="fpa/integracao-dados" element={<AdminFPADataIntegration />} />
                          <Route path="fpa/relatorios" element={<AdminFPAReportBuilder />} />
                          <Route path="fpa/analise-variancia" element={<AdminFPAVarianceAnalysis />} />
                          <Route path="fpa/modelagem" element={<AdminFPAModeling />} />
                        </Routes>
                      </AdminProtectedRoute>
                    </ErrorBoundary>
                  } />

                  {/* Fallback Routes */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </BrowserRouter>
            </AdminAuthProvider>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
