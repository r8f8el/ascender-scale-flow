
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import AdminDashboard from './AdminDashboard';
import ClientsAdmin from './ClientsAdmin';
import TicketsAdmin from './TicketsAdmin';
import ArquivosAdmin from './ArquivosAdmin';
import SolicitacoesAdmin from './SolicitacoesAdmin';
import CronogramasAdmin from './CronogramasAdmin';
import LogsAdmin from './LogsAdmin';
import ConfiguracoesAdmin from './ConfiguracoesAdmin';
import ApprovalsAdmin from './ApprovalsAdmin';

export default function AdminArea() {
  const { isAuthenticated, admin, loading, adminLogout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    adminLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        admin={admin}
        onLogout={handleLogout}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex">
        <AdminNavigation 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/tickets" element={<TicketsAdmin />} />
              <Route path="/clientes" element={<ClientsAdmin />} />
              <Route path="/arquivos" element={<ArquivosAdmin />} />
              <Route path="/solicitacoes" element={<SolicitacoesAdmin />} />
              <Route path="/aprovacoes" element={<ApprovalsAdmin />} />
              <Route path="/cronogramas" element={<CronogramasAdmin />} />
              <Route path="/logs" element={<LogsAdmin />} />
              <Route path="/configuracoes" element={<ConfiguracoesAdmin />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
