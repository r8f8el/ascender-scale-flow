
import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PageLoader } from './components/ui/page-loader';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components for better performance
const LoginPage = lazy(() => import('./pages/ClientLogin'));
const ClientArea = lazy(() => import('./pages/client/ClientArea'));
const SecureTeamInviteSignup = lazy(() => import('./pages/SecureTeamInviteSignup'));

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader text="Inicializando aplicação..." />;
  }

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Login route - redirect to dashboard if already authenticated */}
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

          {/* Protected Client Area Routes */}
          <Route 
            path="/cliente/*" 
            element={
              <ProtectedRoute>
                <ClientArea />
              </ProtectedRoute>
            } 
          />

          {/* Secure Team Invitation Signup */}
          <Route path="/convite-seguro" element={<SecureTeamInviteSignup />} />

          {/* Default redirects */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/cliente" replace /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch all - redirect to appropriate page */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? <Navigate to="/cliente" replace /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
