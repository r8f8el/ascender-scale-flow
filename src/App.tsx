
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { ScrollToTop } from '@/components/ScrollToTop';
import AdminAuthProvider from '@/contexts/AdminAuthContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

// Pages
import Index from '@/pages/Index';
import ClientLogin from '@/pages/ClientLogin';
import ClientRegister from '@/pages/ClientRegister';
import EmailConfirmation from '@/pages/EmailConfirmation';
import AdminLogin from '@/pages/AdminLogin';
import AdminRegister from '@/pages/AdminRegister';
import AdminUnauthorized from '@/pages/AdminUnauthorized';
import ClientArea from '@/pages/client/ClientArea';
import AdminArea from '@/pages/AdminArea';
import NotFound from '@/pages/NotFound';
import AcceptInvitation from '@/pages/AcceptInvitation';
import TeamInviteSignup from '@/pages/TeamInviteSignup';
import SecureTeamInviteSignup from '@/pages/SecureTeamInviteSignup';
import AbrirChamado from '@/pages/AbrirChamado';
import NewsletterSignup from '@/pages/NewsletterSignup';
import ParticipantData from '@/pages/ParticipantData';
import ConviteEquipeCadastro from '@/pages/ConviteEquipeCadastro';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryProvider>
        <AdminAuthProvider>
          <Router>
            <div className="App">
              <ScrollToTop />
              <Routes>
                {/* Páginas públicas */}
                <Route path="/" element={<Index />} />
                <Route path="/abrir-chamado" element={<AbrirChamado />} />
                <Route path="/newsletter" element={<NewsletterSignup />} />
                <Route path="/participant-data" element={<ParticipantData />} />
                
                {/* Páginas de autenticação */}
                <Route path="/cliente/login" element={<ClientLogin />} />
                <Route path="/cliente/registro" element={<ClientRegister />} />
                <Route path="/confirmar-email" element={<EmailConfirmation />} />
                <Route path="/login" element={<ClientLogin />} />
                <Route path="/registro" element={<ClientRegister />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
                
                {/* Página de cadastro por convite */}
                <Route path="/convite-equipe" element={<ConviteEquipeCadastro />} />
                <Route path="/convite-equipe/cadastro" element={<ConviteEquipeCadastro />} />
                
                {/* Páginas de convites antigos (manter compatibilidade) */}
                <Route path="/aceitar-convite" element={<AcceptInvitation />} />
                <Route path="/team-invite-signup" element={<TeamInviteSignup />} />
                <Route path="/secure-team-invite" element={<SecureTeamInviteSignup />} />
                
                {/* Área do cliente */}
                <Route path="/cliente/*" element={<ClientArea />} />
                
                {/* Área do admin - protegida */}
                <Route 
                  path="/admin/*" 
                  element={
                    <AdminProtectedRoute>
                      <AdminArea />
                    </AdminProtectedRoute>
                  } 
                />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </AdminAuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
