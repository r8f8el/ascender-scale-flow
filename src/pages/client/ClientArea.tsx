
import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientNavigation } from '@/components/client/ClientNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ClientDocumentSync from '@/components/client/ClientDocumentSync';
import { Chat } from '@/components/Chat';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/ui/page-loader';

// Client pages
import ClientDocuments from './ClientDocuments';
import ClientDocumentsAdvanced from './ClientDocumentsAdvanced';
import ClientDocumentsNew from './ClientDocumentsNew';
import ClientRequests from './ClientRequests';
import ClientSchedule from './ClientSchedule';
import ClientContact from './ClientContact';
import ClientTickets from './ClientTickets';
import ClientTicketDetail from './ClientTicketDetail';
import ClientTeam from './ClientTeam';

// Approval pages
import ClientApprovals from './ClientApprovals';

// Project management
import ClientKanban from './ClientKanban';
import ClientGantt from './ClientGantt';

// FP&A components
import ClientFPADashboard from './fpa/ClientFPADashboard';
import ClientFPADashboardReal from './fpa/ClientFPADashboardReal';
import ClientFPAData from './fpa/ClientFPAData';
import ClientFPAReports from './fpa/ClientFPAReports';
import ClientFPAScenarios from './fpa/ClientFPAScenarios';
import ClientFPACommunication from './fpa/ClientFPACommunication';
import ClientCommunication from './ClientCommunication';
import ClientCommunicationSimple from './ClientCommunicationSimple';
import ClientBIDashboard from './fpa/ClientBIDashboard';

const ClientArea = () => {
  const { client, user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [profileReady, setProfileReady] = useState(false);

  console.log('🔍 ClientArea: client:', client?.name, 'user:', user?.id, 'loading:', loading);

  // Retry fetching profile if not found yet
  useEffect(() => {
    if (client) {
      setProfileReady(true);
      return;
    }
    
    if (loading || !user) return;

    // Profile not found - retry a few times (trigger may still be creating it)
    if (retryCount < 5) {
      const timer = setTimeout(async () => {
        console.log(`🔄 Retry ${retryCount + 1}: fetching profile for user ${user.id}`);
        try {
          const { data } = await supabase.rpc('get_client_profile_bypass', { p_user_id: user.id });
          if (data && Array.isArray(data) && data.length > 0) {
            console.log('✅ Profile found on retry');
            setProfileReady(true);
            // Force page reload to re-initialize auth context with profile
            window.location.reload();
            return;
          }
        } catch (e) {
          console.error('Retry error:', e);
        }
        setRetryCount(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [client, user, loading, retryCount]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <PageLoader text="Verificando autenticação..." />;
  }

  if (!client && retryCount < 5) {
    return <PageLoader text="Carregando perfil..." />;
  }

  if (!client && retryCount >= 5) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold">Perfil não encontrado</h2>
          <p className="text-muted-foreground">Não foi possível carregar seu perfil. Tente fazer login novamente.</p>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <ClientNavigation />
          
          <SidebarInset className="flex-1">
            <ClientHeader 
              clientName={client?.name || 'Usuário'}
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
                <Route path="/fpa/bi" element={<ClientBIDashboard />} />
                
                {/* Communication - direct with Ascalate */}
                <Route path="/comunicacao" element={<ClientCommunication />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
        
        {/* Chat Component */}
        <Chat />
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default ClientArea;
