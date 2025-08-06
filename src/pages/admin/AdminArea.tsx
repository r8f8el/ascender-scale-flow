
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ClientesAdminFixed from '@/pages/admin/ClientesAdminFixed';
import ClientDocumentsAdmin from '@/pages/admin/ClientDocumentsAdmin';
import AdminFPAClientManagement from '@/pages/admin/fpa/AdminFPAClientManagement';

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
            <Route path="documentos" element={<ClientDocumentsAdmin />} />
            <Route path="fpa/gestao-clientes" element={<AdminFPAClientManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminArea;
