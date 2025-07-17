
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import ClientArea from './pages/client/ClientArea';
import ClientLogin from './pages/client/ClientLogin';
import ClientTeam from './pages/client/ClientTeam';
import ClientDocuments from './pages/client/ClientDocuments';
import ClientDocumentsNew from './pages/client/ClientDocumentsNew';
import ClientRequests from './pages/client/ClientRequests';
import ClientSchedule from './pages/client/ClientSchedule';
import ClientContact from './pages/client/ClientContact';
import AdminArea from './pages/admin/AdminArea';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientesAdmin from './pages/admin/ClientesAdmin';
import SolicitacoesAdmin from './pages/admin/SolicitacoesAdmin';
import ArquivosAdmin from './pages/admin/ArquivosAdmin';
import ArquivosAdminNew from './pages/admin/ArquivosAdminNew';
import CronogramasAdmin from './pages/admin/CronogramasAdmin';
import CollaboratorsAdmin from './pages/admin/CollaboratorsAdmin';
import ConfiguracoesAdmin from './pages/admin/ConfiguracoesAdmin';
import MensagensAdmin from './pages/admin/MensagensAdmin';
import LogsAdmin from './pages/admin/LogsAdmin';
import ActivityLogsAdmin from './pages/admin/ActivityLogsAdmin';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import NewsletterSignup from './pages/NewsletterSignup';
import AdminRegister from './pages/admin/AdminRegister';
import AdminUnauthorized from './pages/admin/AdminUnauthorized';
import AbrirChamado from './pages/AbrirChamado';
import ParticipantData from './pages/ParticipantData';
import AcceptInvitation from './pages/AcceptInvitation';
import TicketsAdmin from './pages/admin/TicketsAdmin';
import ClientTickets from './pages/client/ClientTickets';
import ClientTicketDetail from './pages/client/ClientTicketDetail';
import MyTickets from './pages/admin/MyTickets';
import ProjectsAdmin from './pages/admin/ProjectsAdmin';
import TasksAdmin from './pages/admin/TasksAdmin';
import OneDriveIntegration from './pages/admin/OneDriveIntegration';
import TicketsAdminNew from './pages/admin/TicketsAdminNew';
import TicketsAdminEdit from './pages/admin/TicketsAdminEdit';
import { useAuth } from '@/contexts/AuthContext';

import ClientApprovals from '@/pages/client/ClientApprovals';
import ApprovalsAdmin from '@/pages/admin/ApprovalsAdmin';

function App() {
  const { isAuthenticated, client, logout } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/newsletter-signup" element={<NewsletterSignup />} />
          <Route path="/abrir-chamado" element={<AbrirChamado />} />
          <Route path="/participant-data" element={<ParticipantData />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          
          {/* Client routes */}
          <Route path="/cliente/login" element={<ClientLogin />} />
          <Route path="/cliente" element={
            <ProtectedRoute>
              <ClientArea />
            </ProtectedRoute>
          }>
            <Route index element={<ClientArea />} />
            <Route path="equipe" element={<ClientTeam />} />
            <Route path="documentos" element={<ClientDocuments />} />
            <Route path="documentos-novo" element={<ClientDocumentsNew />} />
            <Route path="solicitacoes" element={<ClientRequests />} />
            <Route path="cronograma" element={<ClientSchedule />} />
            <Route path="contato" element={<ClientContact />} />
            <Route path="chamados" element={<ClientTickets />} />
            <Route path="chamados/:ticketId" element={<ClientTicketDetail />} />
            <Route path="aprovacoes" element={<ClientApprovals />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminArea />
            </AdminProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="area" element={<AdminArea />} />
            <Route path="clientes" element={<ClientesAdmin />} />
            <Route path="solicitacoes" element={<SolicitacoesAdmin />} />
            <Route path="arquivos" element={<ArquivosAdmin />} />
            <Route path="arquivos-novo" element={<ArquivosAdminNew />} />
            <Route path="cronogramas" element={<CronogramasAdmin />} />
            <Route path="colaboradores" element={<CollaboratorsAdmin />} />
            <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
            <Route path="mensagens" element={<MensagensAdmin />} />
            <Route path="logs" element={<LogsAdmin />} />
            <Route path="activity-logs" element={<ActivityLogsAdmin />} />
            <Route path="chamados" element={<TicketsAdmin />} />
            <Route path="chamados-novo" element={<TicketsAdminNew />} />
            <Route path="chamados/:ticketId/editar" element={<TicketsAdminEdit />} />
            <Route path="meus-chamados" element={<MyTickets />} />
            <Route path="projetos" element={<ProjectsAdmin />} />
            <Route path="tarefas" element={<TasksAdmin />} />
            <Route path="onedrive" element={<OneDriveIntegration />} />
            <Route path="aprovacoes" element={<ApprovalsAdmin />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
