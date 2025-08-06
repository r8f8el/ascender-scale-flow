
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ClientesAdminFixed from '@/pages/admin/ClientesAdminFixed';
import ClientDocumentsAdmin from '@/pages/admin/ClientDocumentsAdmin';
import AdminFPAClientManagement from '@/pages/admin/fpa/AdminFPAClientManagement';
import ProjectsAdmin from '@/pages/admin/ProjectsAdmin';
import CollaboratorsAdmin from '@/pages/admin/CollaboratorsAdmin';
import TasksAdmin from '@/pages/admin/TasksAdmin';
import TicketsAdmin from '@/pages/admin/TicketsAdmin';
import MyTickets from '@/pages/admin/MyTickets';
import ArquivosAdmin from '@/pages/admin/ArquivosAdmin';
import CronogramasAdmin from '@/pages/admin/CronogramasAdmin';
import MensagensAdmin from '@/pages/admin/MensagensAdmin';
import LogsAdmin from '@/pages/admin/LogsAdmin';
import ActivityLogsAdmin from '@/pages/admin/ActivityLogsAdmin';
import OneDriveIntegration from '@/pages/admin/OneDriveIntegration';
import ConfiguracoesAdmin from '@/pages/admin/ConfiguracoesAdmin';

const AdminArea = () => {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="clientes" element={<ClientesAdminFixed />} />
            <Route path="projetos" element={<ProjectsAdmin />} />
            <Route path="colaboradores" element={<CollaboratorsAdmin />} />
            <Route path="tarefas" element={<TasksAdmin />} />
            <Route path="chamados" element={<TicketsAdmin />} />
            <Route path="meus-chamados" element={<MyTickets />} />
            <Route path="arquivos" element={<ArquivosAdmin />} />
            <Route path="cronogramas" element={<CronogramasAdmin />} />
            <Route path="mensagens" element={<MensagensAdmin />} />
            <Route path="logs" element={<LogsAdmin />} />
            <Route path="activity-logs" element={<ActivityLogsAdmin />} />
            <Route path="onedrive" element={<OneDriveIntegration />} />
            <Route path="documentos" element={<ClientDocumentsAdmin />} />
            <Route path="fpa/gestao-clientes" element={<AdminFPAClientManagement />} />
            <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminArea;
