
import { Routes, Route } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useResponsive } from '@/hooks/useResponsive';

// Admin pages
import AdminDashboard from './AdminDashboard';
import ClientesAdmin from './ClientesAdmin';
import CollaboratorsAdmin from './CollaboratorsAdmin';
import ProjectsAdmin from './ProjectsAdmin';
import TasksAdmin from './TasksAdmin';
import TicketsAdmin from './TicketsAdmin';
import MyTickets from './MyTickets';
import ArquivosAdmin from './ArquivosAdmin';
import ClientDocumentsAdmin from './ClientDocumentsAdmin';
import ConfiguracoesAdmin from './ConfiguracoesAdmin';
import LogsAdmin from './LogsAdmin';
import AdminApprovalFlows from './AdminApprovalFlows';
import TestingDashboard from './TestingDashboard';

// FP&A Admin pages
import AdminFPAClientManagement from './fpa/AdminFPAClientManagement';
import AdminFPADataIntegrationReal from './fpa/AdminFPADataIntegrationReal';
import AdminFPAReportBuilder from './fpa/AdminFPAReportBuilder';
import AdminFPAVarianceAnalysis from './fpa/AdminFPAVarianceAnalysis';
import AdminFPAModeling from './fpa/AdminFPAModeling';
import AdminFPADashboard from './fpa/AdminFPADashboard';

const AdminArea = () => {
  const isMobile = useResponsive();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-4 md:p-8 overflow-auto ml-0 md:ml-64">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clientes" element={<ClientesAdmin />} />
            <Route path="colaboradores" element={<CollaboratorsAdmin />} />
            <Route path="projetos" element={<ProjectsAdmin />} />
            <Route path="tarefas" element={<TasksAdmin />} />
            <Route path="chamados" element={<TicketsAdmin />} />
            <Route path="meus-chamados" element={<MyTickets />} />
            <Route path="arquivos" element={<ArquivosAdmin />} />
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
