
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chat } from '@/components/Chat';
import { ClientHeader } from '../components/client/ClientHeader';
import { ClientNavigation } from '../components/client/ClientNavigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ClientDocumentSync from '@/components/client/ClientDocumentSync';

// Client pages
import ClientDocuments from './client/ClientDocuments';
import ClientDocumentsAdvanced from './client/ClientDocumentsAdvanced';
import ClientDocumentsNew from './client/ClientDocumentsNew';
import ClientRequests from './client/ClientRequests';
import ClientSchedule from './client/ClientSchedule';
import ClientContact from './client/ClientContact';
import ClientTickets from './client/ClientTickets';
import ClientTicketDetail from './client/ClientTicketDetail';
import ClientTeam from './client/ClientTeam';

// Approval pages
import ClientApprovals from './client/ClientApprovals';

// Project management
import ClientKanban from './client/ClientKanban';
import ClientGantt from './client/ClientGantt';

// FP&A components
import ClientFPADashboard from './client/fpa/ClientFPADashboard';
import ClientFPADashboardReal from './client/fpa/ClientFPADashboardReal';
import ClientFPAData from './client/fpa/ClientFPAData';
import ClientFPAReports from './client/fpa/ClientFPAReports';
import ClientFPAScenarios from './client/fpa/ClientFPAScenarios';
import ClientFPACommunication from './client/fpa/ClientFPACommunication';
import ClientBIDashboard from './client/fpa/ClientBIDashboard';

const ClientArea = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <ClientNavigation />
        
        <SidebarInset className="flex-1">
          <ClientHeader 
            clientName={client?.name}
            onLogout={handleLogout}
          />
          
          {/* Componente de sincronização em tempo real */}
          <ClientDocumentSync />
          
          <main className="flex-1 p-6 overflow-auto">
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
              
              {/* Approval Routes */}
              <Route path="/aprovacoes/*" element={<ClientApprovals />} />
              
              {/* Project Management */}
              <Route path="/kanban" element={<ClientKanban />} />
              <Route path="/gantt" element={<ClientGantt />} />
              
              {/* FP&A Routes */}
              <Route path="/fpa" element={<ClientFPADashboard />} />
              <Route path="/fpa/dashboard" element={<ClientFPADashboardReal />} />
              <Route path="/fpa/dados" element={<ClientFPAData />} />
              <Route path="/fpa/relatorios" element={<ClientFPAReports />} />
              <Route path="/fpa/cenarios" element={<ClientFPAScenarios />} />
              <Route path="/fpa/comunicacao" element={<ClientFPACommunication />} />
              <Route path="/fpa/bi" element={<ClientBIDashboard />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
      
      {/* Chat Component */}
      <Chat />
    </SidebarProvider>
  );
};

export default ClientArea;
