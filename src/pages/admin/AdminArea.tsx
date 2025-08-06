
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from './AdminDashboard';

// Existing components that are available
import ClientManagementFixed from '@/components/admin/ClientManagementFixed';
import TicketsAdmin from './TicketsAdmin';
import ProjectsAdmin from './ProjectsAdmin';
import LogsAdmin from './LogsAdmin';
import ConfiguracoesAdmin from './ConfiguracoesAdmin';
import CollaboratorsAdmin from './CollaboratorsAdmin';
import CronogramasAdmin from './CronogramasAdmin';
import AdminDocuments from './AdminDocuments';
import AdminApprovalFlows from './AdminApprovalFlows';

// FP&A components
import AdminFPAClientManagement from './fpa/AdminFPAClientManagement';
import AdminFPADataIntegration from './fpa/AdminFPADataIntegration';
import AdminFPAReportBuilder from './fpa/AdminFPAReportBuilder';
import AdminFPAVarianceAnalysis from './fpa/AdminFPAVarianceAnalysis';

const AdminArea = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/clients" element={<ClientManagementFixed />} />
            <Route path="/documents" element={<AdminDocuments />} />
            <Route path="/tickets" element={<TicketsAdmin />} />
            <Route path="/projects" element={<ProjectsAdmin />} />
            <Route path="/logs" element={<LogsAdmin />} />
            <Route path="/approval-flows" element={<AdminApprovalFlows />} />
            <Route path="/settings" element={<ConfiguracoesAdmin />} />
            <Route path="/collaborators" element={<CollaboratorsAdmin />} />
            <Route path="/schedules" element={<CronogramasAdmin />} />
            
            {/* FP&A Routes */}
            <Route path="/fpa/clients" element={<AdminFPAClientManagement />} />
            <Route path="/fpa/data-integration" element={<AdminFPADataIntegration />} />
            <Route path="/fpa/reports" element={<AdminFPAReportBuilder />} />
            <Route path="/fpa/variance-analysis" element={<AdminFPAVarianceAnalysis />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminArea;
