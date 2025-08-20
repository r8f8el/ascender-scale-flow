
import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { PageLoader } from './components/ui/page-loader';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Lazy load components for better performance
const Index = lazy(() => import('./pages/Index'));
const LoginPage = lazy(() => import('./pages/ClientLogin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminArea = lazy(() => import('./pages/admin/AdminArea'));
const ClientArea = lazy(() => import('./pages/client/ClientArea'));
const SecureTeamInviteSignup = lazy(() => import('./pages/SecureTeamInviteSignup'));

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader text="Inicializando aplicação..." />;
  }

  return (
    <Router>
      <AdminAuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public home page */}
            <Route path="/home" element={<Index />} />

            {/* Client Login routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/cliente" replace /> : <LoginPage />
              } 
            />
            
            <Route 
              path="/cliente/login" 
              element={
                isAuthenticated ? <Navigate to="/cliente" replace /> : <LoginPage />
              } 
            />

            {/* Admin Login routes */}
            <Route 
              path="/admin/login" 
              element={<AdminLogin />} 
            />

            {/* Protected Client Area Routes */}
            <Route 
              path="/cliente/*" 
              element={
                <ProtectedRoute>
                  <ClientArea />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Area Routes */}
            <Route 
              path="/admin/*" 
              element={
                <AdminProtectedRoute>
                  <AdminArea />
                </AdminProtectedRoute>
              } 
            />

            {/* Secure Team Invitation Signup */}
            <Route path="/convite-seguro" element={<SecureTeamInviteSignup />} />

            {/* Root redirect to home page */}
            <Route 
              path="/" 
              element={<Navigate to="/home" replace />} 
            />
            
            {/* Catch all - redirect to home page */}
            <Route 
              path="*" 
              element={<Navigate to="/home" replace />} 
            />
          </Routes>
        </Suspense>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
