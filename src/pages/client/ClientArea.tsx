import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientNavigation } from '@/components/client/ClientNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ClientDocumentSync from '@/components/client/ClientDocumentSync';
import { Chat } from '@/components/Chat';
import ErrorBoundary from '@/components/ErrorBoundary';
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
import ClientBIDashboard from './fpa/ClientBIDashboard';

const ClientArea = () => {
  const { client, logout, loading, user } = useAuth();
  const navigate = useNavigate();

  console.log('🔍 ClientArea: loading:', loading, 'user:', user?.id, 'client:', client?.name);

  // Check if user is admin and redirect
  useEffect(() => {
    const checkAdminRedirect = async () => {
      if (!loading && user) {
        try {
          const { data: adminData } = await supabase.auth.getUser();
          if (adminData?.user) {
            const { data: isAdmin } = await supabase
              .from('admin_profiles')
              .select('id')
              .eq('id', adminData.user.id)
              .maybeSingle();
            
            if (isAdmin) {
              console.log('🔄 Admin user detected in client area, redirecting...');
              window.location.href = '/admin';
              return;
            }
          }
        } catch (error) {
          console.error('❌ Error checking admin status:', error);
        }
      }
    };

    checkAdminRedirect();
  }, [loading, user]);

  const handleLogout = () => {
    console.log('👋 ClientArea: Fazendo logout');
    logout();
    navigate('/login');
  };

  // Show loading while checking authentication
  if (loading) {
    return <PageLoader text="Carregando área do cliente..." />;
  }

  // Show warning if no client profile but user is authenticated
  if (!client && user) {
    console.log('⚠️ ClientArea: Cliente não encontrado, mas usuário autenticado');
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen w-full flex">
          <ClientNavigation />
          
          <SidebarInset className="flex-1">
            <ClientHeader 
              clientName={client?.name || user?.email || 'Usuário'}
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
    </ErrorBoundary>
  );
};

export default ClientArea;
