import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from './AdminDashboard';

// Existing components that were removed
import ClientManagementFixed from '@/components/admin/ClientManagementFixed';
import AdminDocumentManager from './AdminDocumentManager';
import AdminTickets from './AdminTickets';
import AdminProjects from './AdminProjects';
import AdminLogs from './AdminLogs';
import AdminApprovalFlows from './AdminApprovalFlows';
import AdminSettings from './AdminSettings';
import AdminCollaboratorManagement from './AdminCollaboratorManagement';
import AdminProjectSchedules from './AdminProjectSchedules';

// FP&A components that were removed
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
            <Route path="/documents" element={<AdminDocumentManager />} />
            <Route path="/tickets" element={<AdminTickets />} />
            <Route path="/projects" element={<AdminProjects />} />
            <Route path="/logs" element={<AdminLogs />} />
            <Route path="/approval-flows" element={<AdminApprovalFlows />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/collaborators" element={<AdminCollaboratorManagement />} />
            <Route path="/schedules" element={<AdminProjectSchedules />} />
            
            {/* FP&A Routes - Restored */}
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
