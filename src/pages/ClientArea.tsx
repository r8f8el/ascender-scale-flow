
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { Chat } from '@/components/Chat';
import { ClientHeader } from '../components/client/ClientHeader';
import { ClientNavigation } from '../components/client/ClientNavigation';
import { useResponsive } from '../hooks/useResponsive';

const ClientArea = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useResponsive();

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClientHeader 
        clientName={client?.name}
        isMobile={isMobile}
        onLogout={handleLogout}
      />
      
      <div className="flex flex-1 container mx-auto">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r p-6">
          <ClientNavigation />
          
          <div className="mt-auto pt-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors w-full"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Chat Component */}
      <Chat />
    </div>
  );
};

export default ClientArea;
