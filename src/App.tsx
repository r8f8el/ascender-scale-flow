
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

// Client Routes - using existing pages from correct paths
import ClientLogin from './pages/client/ClientArea';
import ClientDashboard from './pages/client/ClientArea';
import ClientTickets from './pages/client/ClientTickets';
import ClientNewTicket from './pages/AbrirChamado';
import ClientProtectedRoute from './components/ProtectedRoute';
import ClientDocuments from './pages/client/ClientDocuments';
import ClientApprovals from './pages/client/ClientApprovals';
import ClientApprovalHistory from './pages/client/DashboardAprovacoes';
import ClientTeam from './pages/client/ClientTeam';

// Admin Routes - using existing pages from correct paths
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/TicketsAdmin';
import AdminTicketDetails from './pages/admin/MyTickets';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminUnauthorized from './pages/AdminUnauthorized';
import AdminCollaborators from './pages/admin/CollaboratorsAdmin';
import AdminGantt from './pages/admin/GanttAdmin';
import AdminSecurity from './pages/admin/Security';

// Auth Contexts - fix import to use default exports
import AuthProvider from './contexts/AuthContext';
import AdminAuthProvider from './contexts/AdminAuthContext';

// Public Routes - use existing pages
import LandingPage from './pages/Index';
import PricingPage from './pages/Index'; // Use same landing page for now
import NewsletterSignup from './pages/NewsletterSignup';
import RequestFiles from './pages/ParticipantData'; // Use existing page
import NotFound from './pages/NotFound';
import { SecurityProvider } from '@/contexts/SecurityContext';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AdminAuthProvider>
            <AuthProvider>
              <SecurityProvider>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/newsletter" element={<NewsletterSignup />} />
                    <Route path="/arquivos" element={<RequestFiles />} />

                    {/* Client Routes */}
                    <Route path="/cliente/login" element={<ClientLogin />} />
                    <Route path="/cliente" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
                    <Route path="/cliente/dashboard" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
                    <Route path="/cliente/tickets" element={<ClientProtectedRoute><ClientTickets /></ClientProtectedRoute>} />
                    <Route path="/cliente/novo-ticket" element={<ClientProtectedRoute><ClientNewTicket /></ClientProtectedRoute>} />
                    <Route path="/cliente/documentos" element={<ClientProtectedRoute><ClientDocuments /></ClientProtectedRoute>} />
                    <Route path="/cliente/aprovacoes" element={<ClientProtectedRoute><ClientApprovals /></ClientProtectedRoute>} />
                    <Route path="/cliente/aprovacoes/historico" element={<ClientProtectedRoute><ClientApprovalHistory /></ClientProtectedRoute>} />
                    <Route path="/cliente/equipe" element={<ClientProtectedRoute><ClientTeam /></ClientProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                    <Route path="/admin/tickets" element={<AdminProtectedRoute><AdminTickets /></AdminProtectedRoute>} />
                    <Route path="/admin/tickets/:id" element={<AdminProtectedRoute><AdminTicketDetails /></AdminProtectedRoute>} />
                    <Route path="/admin/colaboradores" element={<AdminProtectedRoute requiredRole="super_admin"><AdminCollaborators /></AdminProtectedRoute>} />
                    <Route path="/admin/gantt" element={<AdminProtectedRoute requiredRole="admin"><AdminGantt /></AdminProtectedRoute>} />
                    <Route path="/admin/security" element={<AdminProtectedRoute requiredRole="super_admin"><AdminSecurity /></AdminProtectedRoute>} />
                    <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />

                    {/* Not Found Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </SecurityProvider>
            </AuthProvider>
          </AdminAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
