
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { Chat } from '@/components/Chat';
import { ClientHeader } from '../components/client/ClientHeader';
import { ClientNavigation } from '../components/client/ClientNavigation';
import { useResponsive } from '../hooks/useResponsive';
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

// FP&A components
import ClientFPADashboard from './client/fpa/ClientFPADashboard';
import ClientFPADashboardReal from './client/fpa/ClientFPADashboardReal';
import ClientFPAData from './client/fpa/ClientFPAData';
import ClientFPAReports from './client/fpa/ClientFPAReports';
import ClientFPAScenarios from './client/fpa/ClientFPAScenarios';
import ClientFPACommunication from './client/fpa/ClientFPACommunication';

const ClientArea = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useResponsive();

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClientHeader 
        clientName={client?.name}
        isMobile={isMobile}
        onLogout={handleLogout}
      />
      
      {/* Componente de sincronização em tempo real */}
      <ClientDocumentSync />
      
      <div className="flex flex-1 container mx-auto">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r p-6">
          <ClientNavigation />
          
          <div className="mt-auto pt-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors w-full"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <Routes>
              <Route path="/" element={<ClientDocuments />} />
              <Route path="/dashboard" element={<ClientDocuments />} />
              <Route path="/documents" element={<ClientDocuments />} />
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
            </Routes>
          </div>
        </main>
      </div>
      
      {/* Chat Component */}
      <Chat />
    </div>
  );
};

export default ClientArea;
