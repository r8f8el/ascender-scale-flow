import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AppErrorBoundary from './components/AppErrorBoundary';

// Client Routes
import ClientLogin from './pages/cliente/Login';
import ClientDashboard from './pages/cliente/Dashboard';
import ClientTickets from './pages/cliente/Tickets';
import ClientNewTicket from './pages/cliente/NewTicket';
import ClientProtectedRoute from './components/ProtectedRoute';
import ClientDocumentUpload from './pages/cliente/DocumentUpload';
import ClientDocumentList from './pages/cliente/DocumentList';
import ClientDocumentView from './pages/cliente/DocumentView';
import ClientDocumentEdit from './pages/cliente/DocumentEdit';
import ClientDocumentSync from './components/client/ClientDocumentSync';
import ClientApprovals from './pages/cliente/Approvals';
import ClientApprovalHistory from './pages/cliente/ApprovalHistory';
import ClientTeam from './pages/cliente/Team';
import ClientInvite from './pages/cliente/Invite';
import ClientAcceptInvite from './pages/cliente/AcceptInvite';

// Admin Routes
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import AdminTicketDetails from './pages/admin/TicketDetails';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminUnauthorized from './pages/admin/Unauthorized';
import AdminCollaborators from './pages/admin/Collaborators';
import AdminGantt from './pages/admin/Gantt';
import AdminSecurity from './pages/admin/Security';

// Auth Contexts
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

// Public Routes
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import NewsletterSignup from './pages/NewsletterSignup';
import RequestFiles from './pages/RequestFiles';
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
                  <AppErrorBoundary>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/newsletter" element={<NewsletterSignup />} />
                      <Route path="/arquivos" element={<RequestFiles />} />

                      {/* Client Routes */}
                      <Route path="/cliente/login" element={<ClientLogin />} />
                      <Route path="/convite/:invitationId" element={<ClientAcceptInvite />} />
                      <Route path="/cliente" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
                      <Route path="/cliente/dashboard" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
                      <Route path="/cliente/tickets" element={<ClientProtectedRoute><ClientTickets /></ClientProtectedRoute>} />
                      <Route path="/cliente/novo-ticket" element={<ClientProtectedRoute><ClientNewTicket /></ClientProtectedRoute>} />
                      <Route path="/cliente/documentos" element={<ClientProtectedRoute><ClientDocumentList /></ClientProtectedRoute>} />
                      <Route path="/cliente/documentos/novo" element={<ClientProtectedRoute><ClientDocumentUpload /></ClientProtectedRoute>} />
                      <Route path="/cliente/documentos/:id" element={<ClientProtectedRoute><ClientDocumentView /></ClientProtectedRoute>} />
                      <Route path="/cliente/documentos/:id/edit" element={<ClientProtectedRoute><ClientDocumentEdit /></ClientProtectedRoute>} />
                      <Route path="/cliente/aprovacoes" element={<ClientProtectedRoute><ClientApprovals /></ClientProtectedRoute>} />
                      <Route path="/cliente/aprovacoes/historico" element={<ClientProtectedRoute><ClientApprovalHistory /></ClientProtectedRoute>} />
                      <Route path="/cliente/equipe" element={<ClientProtectedRoute><ClientTeam /></ClientProtectedRoute>} />
                      <Route path="/cliente/convidar" element={<ClientProtectedRoute><ClientInvite /></ClientProtectedRoute>} />

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
                  </AppErrorBoundary>
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
