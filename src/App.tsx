
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from './contexts/AuthContext';
import AdminAuthProvider from './contexts/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Pages
import Index from './pages/Index';
import ClientLogin from './pages/ClientLogin';
import AdminLogin from './pages/AdminLogin';
import AdminUnauthorized from './pages/AdminUnauthorized';
import ClientArea from './pages/ClientArea';
import AdminArea from './pages/AdminArea';
import ParticipantData from './pages/ParticipantData';
import NotFound from './pages/NotFound';

// Client Pages
import ClientDocuments from './pages/client/ClientDocuments';
import ClientRequests from './pages/client/ClientRequests';
import ClientSchedule from './pages/client/ClientSchedule';
import ClientContact from './pages/client/ClientContact';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ClientesAdmin from './pages/admin/ClientesAdmin';
import ArquivosAdmin from './pages/admin/ArquivosAdmin';
import CronogramasAdmin from './pages/admin/CronogramasAdmin';
import SolicitacoesAdmin from './pages/admin/SolicitacoesAdmin';
import MensagensAdmin from './pages/admin/MensagensAdmin';
import LogsAdmin from './pages/admin/LogsAdmin';
import ConfiguracoesAdmin from './pages/admin/ConfiguracoesAdmin';
import OneDriveIntegration from './pages/admin/OneDriveIntegration';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/dados-participante" element={<ParticipantData />} />
                
                {/* Client Authentication */}
                <Route path="/cliente/login" element={<ClientLogin />} />
                
                {/* Protected Client Routes */}
                <Route path="/cliente" element={
                  <ProtectedRoute>
                    <ClientArea />
                  </ProtectedRoute>
                }>
                  <Route index element={<ClientDocuments />} />
                  <Route path="documentos" element={<ClientDocuments />} />
                  <Route path="solicitacoes" element={<ClientRequests />} />
                  <Route path="cronograma" element={<ClientSchedule />} />
                  <Route path="contato" element={<ClientContact />} />
                </Route>
                
                {/* Admin Authentication */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <AdminProtectedRoute>
                    <AdminArea />
                  </AdminProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="clientes" element={<ClientesAdmin />} />
                  <Route path="arquivos" element={<ArquivosAdmin />} />
                  <Route path="cronogramas" element={<CronogramasAdmin />} />
                  <Route path="solicitacoes" element={<SolicitacoesAdmin />} />
                  <Route path="mensagens" element={<MensagensAdmin />} />
                  <Route path="logs" element={<LogsAdmin />} />
                  <Route path="onedrive" element={<OneDriveIntegration />} />
                  <Route path="configuracoes" element={
                    <AdminProtectedRoute requiredRole="super_admin">
                      <ConfiguracoesAdmin />
                    </AdminProtectedRoute>
                  } />
                </Route>
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
