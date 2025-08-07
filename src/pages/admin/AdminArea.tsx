
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDashboard from './AdminDashboard';
import CollaboratorsAdmin from './CollaboratorsAdmin';
import ClientesAdmin from './ClientesAdmin';
import ProjectsAdmin from './ProjectsAdmin';
import TasksAdmin from './TasksAdmin';
import TicketsAdmin from './TicketsAdmin';
import MyTickets from './MyTickets';
import AdminDocuments from './AdminDocuments';
import ArquivosAdmin from './ArquivosAdmin';
import AdminApprovalFlows from './AdminApprovalFlows';
import ConfiguracoesAdmin from './ConfiguracoesAdmin';
import LogsAdmin from './LogsAdmin';
import TestingDashboard from './TestingDashboard';
import ClientDocumentsAdmin from './ClientDocumentsAdmin';

// FP&A Admin pages
import AdminFPAClientManagement from './fpa/AdminFPAClientManagement';
import AdminFPADataIntegrationReal from './fpa/AdminFPADataIntegrationReal';
import AdminFPAReportBuilder from './fpa/AdminFPAReportBuilder';
import AdminFPAVarianceAnalysis from './fpa/AdminFPAVarianceAnalysis';
import AdminFPAModeling from './fpa/AdminFPAModeling';
import AdminFPADashboard from './fpa/AdminFPADashboard';

const AdminArea = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="md:pl-64">
        <AdminHeader />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/colaboradores" element={<CollaboratorsAdmin />} />
            <Route path="/clientes" element={<ClientesAdmin />} />
            <Route path="/projetos" element={<ProjectsAdmin />} />
            <Route path="/tarefas" element={<TasksAdmin />} />
            <Route path="/chamados" element={<TicketsAdmin />} />
            <Route path="/meus-chamados" element={<MyTickets />} />
            <Route path="/arquivos" element={<ArquivosAdmin />} />
            <Route path="/documentos" element={<AdminDocuments />} />
            <Route path="/workflows" element={<AdminApprovalFlows />} />
            <Route path="/logs" element={<LogsAdmin />} />
            <Route path="/configuracoes" element={<ConfiguracoesAdmin />} />
            <Route path="/testing" element={<TestingDashboard />} />
            <Route path="/client-documents" element={<ClientDocumentsAdmin />} />
            
            {/* FP&A Routes */}
            <Route path="/fpa" element={<AdminFPADashboard />} />
            <Route path="/fpa/clientes" element={<AdminFPAClientManagement />} />
            <Route path="/fpa/integracao" element={<AdminFPADataIntegrationReal />} />
            <Route path="/fpa/relatorios" element={<AdminFPAReportBuilder />} />
            <Route path="/fpa/variancia" element={<AdminFPAVarianceAnalysis />} />
            <Route path="/fpa/modelagem" element={<AdminFPAModeling />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminArea;
