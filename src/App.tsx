
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/ClientLogin';
import ClientArea from './pages/client/ClientArea';
import ProtectedRoute from './components/ProtectedRoute';
import SecureTeamInviteSignup from './pages/SecureTeamInviteSignup';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
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
    </Router>
  );
}

export default App;
