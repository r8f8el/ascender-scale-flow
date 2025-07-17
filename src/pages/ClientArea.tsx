import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientNavigation } from '@/components/client/ClientNavigation';
import ClientDocuments from './client/ClientDocuments';
import ClientTickets from './client/ClientTickets';
import ClientTicketDetail from './client/ClientTicketDetail';
import ClientRequests from './client/ClientRequests';
import ClientSchedule from './client/ClientSchedule';
import ClientTeam from './client/ClientTeam';
import ClientContact from './client/ClientContact';
import ClientApprovals from './client/ClientApprovals';
import { useResponsive } from '@/hooks/useResponsive';

export default function ClientArea() {
  const { isAuthenticated, client, loading } = useAuth();
  const { isMobile } = useResponsive();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/cliente/login" replace />;
  }

  const handleLogout = () => {
    try {
      // Call the logout function from the AuthContext
      // This function should handle the actual logout logic
      // including clearing the session and user state
      // and redirecting to the login page if necessary
      // For example:
      // logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader 
        client={client}
        isMobile={isMobile}
        onLogout={handleLogout}
      />
      
      <div className="flex">
        <ClientNavigation 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/cliente/documentos" replace />} />
              <Route path="/documentos" element={<ClientDocuments />} />
              <Route path="/tickets" element={<ClientTickets />} />
              <Route path="/tickets/:id" element={<ClientTicketDetail />} />
              <Route path="/solicitacoes" element={<ClientRequests />} />
              <Route path="/cronograma" element={<ClientSchedule />} />
              <Route path="/equipe" element={<ClientTeam />} />
              <Route path="/contato" element={<ClientContact />} />
              <Route path="/aprovacoes" element={<ClientApprovals />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
