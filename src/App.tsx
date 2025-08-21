
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import Index from '@/pages/Index';
import ClientLogin from '@/pages/ClientLogin';
import AdminLogin from '@/pages/AdminLogin';
import AdminRegister from '@/pages/AdminRegister';
import AbrirChamado from '@/pages/AbrirChamado';
import NewsletterSignup from '@/pages/NewsletterSignup';
import { ScrollToTop } from '@/components/ScrollToTop';
import ClientArea from '@/pages/client/ClientArea';
import AdminArea from '@/pages/AdminArea';
import SecureTeamInviteSignup from '@/pages/SecureTeamInviteSignup';
import ErrorFallback from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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

                  {/* Rotas do cliente - usando ClientArea como wrapper */}
                  <Route path="/cliente/*" element={<ClientArea />} />

                  {/* Rotas do admin - usando AdminArea como wrapper */}
                  <Route path="/admin/*" element={<AdminArea />} />
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
