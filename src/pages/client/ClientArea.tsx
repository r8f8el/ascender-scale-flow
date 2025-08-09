
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ClientHeader } from '@/components/client/ClientHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import ClientDocuments from './ClientDocuments';
import ClientDocumentsAdvanced from './ClientDocumentsAdvanced';
import ClientDocumentsNew from './ClientDocumentsNew';
import ClientRequests from './ClientRequests';
import ClientSchedule from './ClientSchedule';
import ClientContact from './ClientContact';
import ClientTickets from './ClientTickets';
import ClientTicketDetail from './ClientTicketDetail';
import ClientTeam from './ClientTeam';
import ClientDocumentSync from '@/components/client/ClientDocumentSync';

// FP&A components
import ClientFPADashboard from './fpa/ClientFPADashboard';
import ClientFPADashboardReal from './fpa/ClientFPADashboardReal';
import ClientFPAData from './fpa/ClientFPAData';
import ClientFPAReports from './fpa/ClientFPAReports';
import ClientFPAScenarios from './fpa/ClientFPAScenarios';
import ClientKanban from './ClientKanban';
import ClientGantt from './ClientGantt';
import ClientFPACommunication from './fpa/ClientFPACommunication';
import ClientBIDashboard from './fpa/ClientBIDashboard';

const ClientArea = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useResponsive();

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  console.log('🔍 ClientArea: Renderizando com cliente:', client?.name);

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader 
        clientName={client?.name}
        isMobile={isMobile}
        onLogout={handleLogout}
      />
      
      {/* Componente de sincronização em tempo real */}
      <ClientDocumentSync />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ClientDocuments />} />
          <Route path="/dashboard" element={<ClientDocuments />} />
          <Route path="/documentos" element={<ClientDocuments />} />
          <Route path="/documents-advanced" element={<ClientDocumentsAdvanced />} />
          <Route path="/documents-new" element={<ClientDocumentsNew />} />
          <Route path="/requests" element={<ClientRequests />} />
          <Route path="/cronograma" element={<ClientSchedule />} />
          <Route path="/contato" element={<ClientContact />} />
          <Route path="/chamados" element={<ClientTickets />} />
          <Route path="/chamados/:id" element={<ClientTicketDetail />} />
          <Route path="/equipe" element={<ClientTeam />} />
          
          {/* FP&A Routes */}
          <Route path="/fpa" element={<ClientFPADashboard />} />
          <Route path="/fpa/dashboard" element={<ClientFPADashboardReal />} />
          <Route path="/fpa/dados" element={<ClientFPAData />} />
          <Route path="/fpa/relatorios" element={<ClientFPAReports />} />
          <Route path="/fpa/cenarios" element={<ClientFPAScenarios />} />
          <Route path="/fpa/comunicacao" element={<ClientFPACommunication />} />
          <Route path="/fpa/bi" element={<ClientBIDashboard />} />
          {/* Relative route to ensure nested matching */}
          <Route path="fpa/bi" element={<ClientBIDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default ClientArea;
