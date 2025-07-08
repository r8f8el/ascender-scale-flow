
import { useState, useEffect } from 'react';
import { Outlet, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, File, MessageSquare, Calendar, Mail, LogOut, User } from 'lucide-react';

const ClientArea = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
            <span className="text-xl font-semibold hidden sm:inline">Área do Cliente</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>{client?.name}</span>
              </div>
            </div>
            
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-8 mt-8">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="font-medium">{client?.name}</span>
                    </div>
                    
                    <nav className="flex flex-col gap-4">
                      <MobileNavLink to="/cliente" icon={<File size={20} />}>
                        Área do Cliente
                      </MobileNavLink>
                      <MobileNavLink to="/cliente/solicitacoes" icon={<MessageSquare size={20} />}>
                        Solicitações
                      </MobileNavLink>
                      <MobileNavLink to="/cliente/cronograma" icon={<Calendar size={20} />}>
                        Cronograma
                      </MobileNavLink>
                      <MobileNavLink to="/cliente/contato" icon={<Mail size={20} />}>
                        Contato
                      </MobileNavLink>
                    </nav>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors mt-4"
                    >
                      <LogOut size={20} />
                      <span>Sair</span>
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 container mx-auto">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 bg-white border-r p-6">
          <div className="space-y-1">
            <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider mb-4">
              Menu
            </h3>
            <NavLink to="/cliente" icon={<File size={20} />}>
              Área do Cliente
            </NavLink>
            <NavLink to="/cliente/chamados" icon={<MessageSquare size={20} />}>
              Chamados
            </NavLink>
            <NavLink to="/cliente/solicitacoes" icon={<MessageSquare size={20} />}>
              Solicitações
            </NavLink>
            <NavLink to="/cliente/cronograma" icon={<Calendar size={20} />}>
              Cronograma
            </NavLink>
            <NavLink to="/cliente/contato" icon={<Mail size={20} />}>
              Contato
            </NavLink>
          </div>
          
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
    </div>
  );
};

const NavLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`
    }
  >
    {icon}
    <span>{children}</span>
  </RouterNavLink>
);

const MobileNavLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-2 px-2 py-3 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`
    }
  >
    {icon}
    <span>{children}</span>
  </RouterNavLink>
);

export default ClientArea;
