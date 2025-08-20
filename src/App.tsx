
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/ClientLogin';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ClientArea from './pages/client/ClientArea';
import ClientDocumentsNew from './pages/client/ClientDocumentsNew';
import ClientGantt from './pages/client/ClientGantt';
import ClientKanban from './pages/client/ClientKanban';
import ClientTickets from './pages/client/ClientTickets';
import ClientTicketDetail from './pages/client/ClientTicketDetail';
import MinhasSolicitacoes from './pages/client/MinhasSolicitacoes';
import ClientApprovalRequestDetail from './pages/client/ClientApprovalRequestDetail';
import DashboardAprovacoes from './pages/client/DashboardAprovacoes';
import ClientTeam from './pages/client/ClientTeam';
import ClientContact from './pages/client/ClientContact';
import ClientSchedule from './pages/client/ClientSchedule';
import ClientFPADashboardReal from './pages/client/fpa/ClientFPADashboardReal';
import ClientFPAScenarios from './pages/client/fpa/ClientFPAScenarios';
import ClientFPAReports from './pages/client/fpa/ClientFPAReports';
import ClientFPACommunication from './pages/client/fpa/ClientFPACommunication';
import ClientFPAData from './pages/client/fpa/ClientFPAData';
import ClientBIDashboard from './pages/client/fpa/ClientBIDashboard';
import SecureTeamInviteSignup from './pages/SecureTeamInviteSignup';
import TestInvitePage from './pages/client/TestInvitePage';

function App() {
  const { loading, isAuthenticated } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return <div>Carregando...</div>;
    }

    return isAuthenticated ? (
      children
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Client Area Routes */}
        <Route path="/cliente" element={<ProtectedRoute><ClientArea /></ProtectedRoute>}>
          <Route index element={<Navigate to="/cliente/dashboard" replace />} />
          <Route path="dashboard" element={<ClientArea />} />
          <Route path="documentos" element={<ClientDocumentsNew />} />
          <Route path="cronograma" element={<ClientGantt />} />
          <Route path="kanban" element={<ClientKanban />} />
          <Route path="chamados" element={<ClientTickets />} />
          <Route path="chamados/:id" element={<ClientTicketDetail />} />
          <Route path="solicitacoes" element={<MinhasSolicitacoes />} />
          <Route path="solicitacoes/:id" element={<ClientApprovalRequestDetail />} />
          <Route path="aprovacoes" element={<DashboardAprovacoes />} />
          <Route path="equipe" element={<ClientTeam />} />
          <Route path="teste-convite" element={<TestInvitePage />} />
          <Route path="contato" element={<ClientContact />} />
          <Route path="agenda" element={<ClientSchedule />} />
          <Route path="fpa/*" element={<ClientFPADashboardReal />} />
          <Route path="fpa-scenarios" element={<ClientFPAScenarios />} />
          <Route path="fpa-reports" element={<ClientFPAReports />} />
          <Route path="fpa-communication" element={<ClientFPACommunication />} />
          <Route path="fpa-data" element={<ClientFPAData />} />
          <Route path="bi-dashboard" element={<ClientBIDashboard />} />
        </Route>

        {/* Secure Team Invitation Signup */}
        <Route path="/convite-seguro" element={<SecureTeamInviteSignup />} />

        {/* Redirect to login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
