
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import ClientArea from './pages/client/ClientArea';
import ClientTeam from './pages/client/ClientTeam';
import ClientDocuments from './pages/client/ClientDocuments';
import ClientDocumentsNew from './pages/client/ClientDocumentsNew';
import ClientRequests from './pages/client/ClientRequests';
import ClientSchedule from './pages/client/ClientSchedule';
import ClientContact from './pages/client/ClientContact';
import AdminArea from './pages/admin/AdminArea';
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
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import NewsletterSignup from './pages/NewsletterSignup';
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
          <Route path="/cliente/*" element={<ClientArea />} />

          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminArea />} />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
