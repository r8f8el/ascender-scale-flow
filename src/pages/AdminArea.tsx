
import { Routes, Route } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { useResponsive } from '../hooks/useResponsive';

// Admin pages
import AdminDashboard from './admin/AdminDashboard';
import ClientesAdmin from './admin/ClientesAdmin';
import CollaboratorsAdmin from './admin/CollaboratorsAdmin';
import ProjectsAdmin from './admin/ProjectsAdmin';
import TasksAdmin from './admin/TasksAdmin';
import TicketsAdmin from './admin/TicketsAdmin';
import MyTickets from './admin/MyTickets';
import ArquivosAdmin from './admin/ArquivosAdmin';
import ClientDocumentsAdmin from './admin/ClientDocumentsAdmin';
import ConfiguracoesAdmin from './admin/ConfiguracoesAdmin';
import LogsAdmin from './admin/LogsAdmin';
import AdminApprovalFlows from './admin/AdminApprovalFlows';
import TestingDashboard from './admin/TestingDashboard';

// FP&A Admin pages
import AdminFPAClientManagement from './admin/fpa/AdminFPAClientManagement';
import AdminFPADataIntegrationReal from './admin/fpa/AdminFPADataIntegrationReal';
import AdminFPAReportBuilder from './admin/fpa/AdminFPAReportBuilder';
import AdminFPAVarianceAnalysis from './admin/fpa/AdminFPAVarianceAnalysis';
import KanbanAdmin from './admin/KanbanAdmin';
import GanttAdmin from './admin/GanttAdmin';
import AdminFPAModeling from './admin/fpa/AdminFPAModeling';
import AdminFPADashboard from './admin/fpa/AdminFPADashboard';

const AdminArea = () => {
  const isMobile = useResponsive();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clientes" element={<ClientesAdmin />} />
            <Route path="colaboradores" element={<CollaboratorsAdmin />} />
            <Route path="projetos" element={<ProjectsAdmin />} />
            <Route path="tarefas" element={<TasksAdmin />} />
            <Route path="chamados" element={<TicketsAdmin />} />
            <Route path="meus-chamados" element={<MyTickets />} />
            <Route path="arquivos" element={<ClientDocumentsAdmin />} />
            <Route path="documentos" element={<ClientDocumentsAdmin />} />
            <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
            <Route path="logs" element={<LogsAdmin />} />
            <Route path="workflows" element={<AdminApprovalFlows />} />
            <Route path="testing" element={<TestingDashboard />} />
            
            {/* FP&A Admin Routes */}
            <Route path="fpa" element={<AdminFPADashboard />} />
            <Route path="fpa/dashboard" element={<AdminFPADashboard />} />
            <Route path="fpa/clientes" element={<AdminFPAClientManagement />} />
            <Route path="fpa/integracao" element={<AdminFPADataIntegrationReal />} />
            <Route path="fpa/relatorios" element={<AdminFPAReportBuilder />} />
            <Route path="fpa/variancia" element={<AdminFPAVarianceAnalysis />} />
            <Route path="fpa/modelagem" element={<AdminFPAModeling />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminArea;
