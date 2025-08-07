import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import AdminDashboard from './AdminDashboard';
import AdminCollaborators from './AdminCollaborators';
import AdminClients from './AdminClients';
import AdminProjects from './AdminProjects';
import AdminTasks from './AdminTasks';
import AdminTickets from './AdminTickets';
import AdminMyTickets from './AdminMyTickets';
import AdminDocuments from './AdminDocuments';
import ArquivosAdminNew from './ArquivosAdminNew';
import AdminWorkflows from './AdminWorkflows';
import AdminLogs from './AdminLogs';
import AdminSettings from './AdminSettings';
import AdminTesting from './AdminTesting';
import ClientDocumentsAdmin from '../client/ClientDocumentsAdmin';
import ClientFPAData from '../client/fpa/ClientFPAData';
import AdminFPAClientes from './fpa/AdminFPAClientes';
import AdminFPAIntegracao from './fpa/AdminFPAIntegracao';
import AdminFPARelatorios from './fpa/AdminFPARelatorios';
import AdminFPAVariancia from './fpa/AdminFPAVariancia';
import AdminFPAModelagem from './fpa/AdminFPAModelagem';

const AdminArea = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="md:pl-64">
        <AdminHeader />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/colaboradores" element={<AdminCollaborators />} />
            <Route path="/clientes" element={<AdminClients />} />
            <Route path="/projetos" element={<AdminProjects />} />
            <Route path="/tarefas" element={<AdminTasks />} />
            <Route path="/chamados" element={<AdminTickets />} />
            <Route path="/meus-chamados" element={<AdminMyTickets />} />
            <Route path="/arquivos" element={<ArquivosAdminNew />} />
            <Route path="/documentos" element={<AdminDocuments />} />
            <Route path="/workflows" element={<AdminWorkflows />} />
            <Route path="/logs" element={<AdminLogs />} />
            <Route path="/configuracoes" element={<AdminSettings />} />
            <Route path="/testing" element={<AdminTesting />} />
            <Route path="/client-documents" element={<ClientDocumentsAdmin />} />
            
            {/* FP&A Routes */}
            <Route path="/fpa" element={<ClientFPAData />} />
            <Route path="/fpa/clientes" element={<AdminFPAClientes />} />
            <Route path="/fpa/integracao" element={<AdminFPAIntegracao />} />
            <Route path="/fpa/relatorios" element={<AdminFPARelatorios />} />
            <Route path="/fpa/variancia" element={<AdminFPAVariancia />} />
            <Route path="/fpa/modelagem" element={<AdminFPAModelagem />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminArea;
