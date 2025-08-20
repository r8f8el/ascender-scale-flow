import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryProvider } from '@/contexts/QueryContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import Index from '@/pages';
import ClientLogin from '@/pages/auth/ClientLogin';
import AdminLogin from '@/pages/auth/AdminLogin';
import AdminRegister from '@/pages/auth/AdminRegister';
import AbrirChamado from '@/pages/AbrirChamado';
import NewsletterSignup from '@/pages/NewsletterSignup';
import ScrollToTop from '@/components/ScrollToTop';
import ClientDashboard from '@/pages/cliente/ClientDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminClients from '@/pages/admin/AdminClients';
import AdminCollaborators from '@/pages/admin/CollaboratorsAdmin';
import ClientProfile from '@/pages/cliente/ClientProfile';
import AdminProfile from '@/pages/admin/AdminProfile';
import ClientProjects from '@/pages/cliente/ClientProjects';
import ClientTeam from '@/pages/client/ClientTeam';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminTasks from '@/pages/admin/AdminTasks';
import ClientTasks from '@/pages/cliente/ClientTasks';
import AdminHierarchyLevels from '@/pages/admin/AdminHierarchyLevels';
import AdminCompanies from '@/pages/admin/AdminCompanies';
import AdminInvoices from '@/pages/admin/AdminInvoices';
import ClientInvoices from '@/pages/cliente/ClientInvoices';
import AdminCallers from '@/pages/admin/AdminCallers';
import ClientCallers from '@/pages/cliente/ClientCallers';
import AdminApprovals from '@/pages/admin/AdminApprovals';
import ClientApprovals from '@/pages/cliente/ClientApprovals';
import AdminGantt from '@/pages/admin/AdminGantt';
import ClientGantt from '@/pages/cliente/ClientGantt';
import SecureTeamInviteSignup from '@/pages/SecureTeamInviteSignup';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <BrowserRouter>
              <ScrollToTop />
              <AdminAuthProvider>
                <Routes>
                  {/* Rotas públicas */}
                  <Route path="/" element={<Index />} />
                  <Route path="/cliente/login" element={<ClientLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/abrir-chamado" element={<AbrirChamado />} />
                  <Route path="/newsletter" element={<NewsletterSignup />} />
                  <Route path="/convite-equipe" element={<SecureTeamInviteSignup />} />

                  {/* Rotas do cliente */}
                  <Route path="/cliente" element={<ClientDashboard />} />
                  <Route path="/cliente/perfil" element={<ClientProfile />} />
                  <Route path="/cliente/projetos" element={<ClientProjects />} />
                  <Route path="/cliente/equipe" element={<ClientTeam />} />
                  <Route path="/cliente/tarefas" element={<ClientTasks />} />
                  <Route path="/cliente/faturas" element={<ClientInvoices />} />
                  <Route path="/cliente/chamados" element={<ClientCallers />} />
                  <Route path="/cliente/aprovacoes" element={<ClientApprovals />} />
                  <Route path="/cliente/gantt/:projectId" element={<ClientGantt />} />

                  {/* Rotas do admin */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/perfil" element={<AdminProfile />} />
                  <Route path="/admin/clientes" element={<AdminClients />} />
                  <Route path="/admin/colaboradores" element={<AdminCollaborators />} />
                  <Route path="/admin/projetos" element={<AdminProjects />} />
                  <Route path="/admin/tarefas" element={<AdminTasks />} />
                  <Route path="/admin/niveis-hierarquicos" element={<AdminHierarchyLevels />} />
                  <Route path="/admin/empresas" element={<AdminCompanies />} />
                  <Route path="/admin/faturas" element={<AdminInvoices />} />
                  <Route path="/admin/chamados" element={<AdminCallers />} />
                  <Route path="/admin/aprovacoes" element={<AdminApprovals />} />
                  <Route path="/admin/gantt" element={<AdminGantt />} />
                </Routes>
              </AdminAuthProvider>
            </BrowserRouter>
          </div>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
