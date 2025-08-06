
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClientHeader } from '@/components/client/ClientHeader';
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
import ClientFPACommunication from './fpa/ClientFPACommunication';

const ClientArea = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      
      {/* Componente de sincronização em tempo real */}
      <ClientDocumentSync />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ClientDocuments />} />
          <Route path="/dashboard" element={<ClientDocuments />} />
          <Route path="/documents" element={<ClientDocuments />} />
          <Route path="/documents-advanced" element={<ClientDocumentsAdvanced />} />
          <Route path="/documents-new" element={<ClientDocumentsNew />} />
          <Route path="/requests" element={<ClientRequests />} />
          <Route path="/schedule" element={<ClientSchedule />} />
          <Route path="/contact" element={<ClientContact />} />
          <Route path="/tickets" element={<ClientTickets />} />
          <Route path="/tickets/:id" element={<ClientTicketDetail />} />
          <Route path="/team" element={<ClientTeam />} />
          
          {/* FP&A Routes */}
          <Route path="/fpa" element={<ClientFPADashboard />} />
          <Route path="/fpa/dashboard" element={<ClientFPADashboardReal />} />
          <Route path="/fpa/data" element={<ClientFPAData />} />
          <Route path="/fpa/reports" element={<ClientFPAReports />} />
          <Route path="/fpa/scenarios" element={<ClientFPAScenarios />} />
          <Route path="/fpa/communication" element={<ClientFPACommunication />} />
        </Routes>
      </main>
    </div>
  );
};

export default ClientArea;
