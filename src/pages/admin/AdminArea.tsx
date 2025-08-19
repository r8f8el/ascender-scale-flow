
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import ErrorBoundary from '@/components/ErrorBoundary';

// Admin pages
import AdminDashboard from './AdminDashboard';
import CollaboratorsAdmin from './CollaboratorsAdmin';
import ClientesAdmin from './ClientesAdmin';
import ProjectsAdmin from './ProjectsAdmin';
import TasksAdmin from './TasksAdmin';
import TicketsAdmin from './TicketsAdmin';
import MyTickets from './MyTickets';
import AdminDocuments from './AdminDocuments';
import ArquivosAdmin from './ArquivosAdmin';
import AdminApprovals from './AdminApprovals';
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
import AdminFPABIEmbeds from './fpa/AdminFPABIEmbeds';
import KanbanAdmin from './KanbanAdmin';
import GanttAdmin from './GanttAdmin';

const AdminArea = () => {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen w-full flex bg-gray-50">
          <AdminSidebar />
          
          <SidebarInset className="flex-1">
            <AdminHeader />
            
            <main className="flex-1 p-6 overflow-auto">
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
                <Route path="/aprovacoes" element={<AdminApprovals />} />
                <Route path="/logs" element={<LogsAdmin />} />
                <Route path="/configuracoes" element={<ConfiguracoesAdmin />} />
                <Route path="/testing" element={<TestingDashboard />} />
                <Route path="/client-documents" element={<ClientDocumentsAdmin />} />
                <Route path="/kanban" element={<KanbanAdmin />} />
                <Route path="/gantt" element={<GanttAdmin />} />
                
                {/* FP&A Routes */}
                <Route path="/fpa" element={<AdminFPADashboard />} />
                <Route path="/fpa/clientes" element={<AdminFPAClientManagement />} />
                <Route path="/fpa/integracao" element={<AdminFPADataIntegrationReal />} />
                <Route path="/fpa/relatorios" element={<AdminFPAReportBuilder />} />
                <Route path="/fpa/variancia" element={<AdminFPAVarianceAnalysis />} />
                <Route path="/fpa/modelagem" element={<AdminFPAModeling />} />
                <Route path="/fpa/bi" element={<AdminFPABIEmbeds />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default AdminArea;
