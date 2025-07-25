
import { useState, useEffect } from 'react';
import { Outlet, NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Chat } from '@/components/Chat';
import { 
  Menu, 
  Users, 
  FileUp, 
  Calendar, 
  MessageSquare,
  Settings,
  Bell, 
  LogOut, 
  User,
  Shield,
  Database,
  Cloud,
  Activity,
  LayoutDashboard,
  Briefcase,
  UserCheck,
  CheckSquare,
  Ticket,
  FileText,
  TrendingUp,
  BarChart3,
  Target,
  PieChart
} from 'lucide-react';

const AdminArea = () => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pageTitle, setPageTitle] = useState("Painel Administrativo");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Update page title based on current route
    const path = location.pathname;
    if (path === '/admin') setPageTitle('Dashboard');
    else if (path.includes('/admin/clientes')) setPageTitle('Gestão de Clientes');
    else if (path.includes('/admin/projetos')) setPageTitle('Gestão de Projetos');
    else if (path.includes('/admin/colaboradores')) setPageTitle('Gestão de Colaboradores');
    else if (path.includes('/admin/tarefas')) setPageTitle('Gestão de Tarefas');
    else if (path.includes('/admin/chamados')) setPageTitle('Gestão de Chamados');
    else if (path.includes('/admin/meus-chamados')) setPageTitle('Meus Chamados');
    else if (path.includes('/admin/arquivos')) setPageTitle('Gerenciamento de Arquivos');
    else if (path.includes('/admin/cronogramas')) setPageTitle('Cronogramas');
    else if (path.includes('/admin/mensagens')) setPageTitle('Mensagens Automáticas');
    else if (path.includes('/admin/logs')) setPageTitle('Logs de Acesso');
    else if (path.includes('/admin/activity-logs')) setPageTitle('Logs de Atividade');
    else if (path.includes('/admin/configuracoes')) setPageTitle('Configurações');
    else if (path.includes('/admin/onedrive')) setPageTitle('Integração OneDrive/SharePoint');
    else if (path.includes('/admin/fpa')) setPageTitle('FP&A - Consultoria Financeira');
    else setPageTitle('Painel Administrativo');
  }, [location]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold hidden sm:inline">Admin</span>
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-red-600" />
                <span className="text-xs text-red-600 font-medium">ACESSO RESTRITO</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 mr-4">
                <User size={16} />
                <span>{admin?.name}</span>
              </div>
              <Button variant="outline" size="sm" className="mr-2" onClick={() => {}}>
                <Bell size={16} />
              </Button>
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
                      <span className="font-medium">{admin?.name}</span>
                    </div>
                    
                    <nav className="flex flex-col gap-4">
                      <MobileNavLink to="/admin" icon={<LayoutDashboard size={20} />}>
                        Dashboard
                      </MobileNavLink>
                      <MobileNavLink to="/admin/clientes" icon={<Users size={20} />}>
                        Clientes
                      </MobileNavLink>
                      <MobileNavLink to="/admin/projetos" icon={<Briefcase size={20} />}>
                        Projetos
                      </MobileNavLink>
                      <MobileNavLink to="/admin/colaboradores" icon={<UserCheck size={20} />}>
                        Colaboradores
                      </MobileNavLink>
                      <MobileNavLink to="/admin/tarefas" icon={<CheckSquare size={20} />}>
                        Tarefas
                      </MobileNavLink>
                      <MobileNavLink to="/admin/chamados" icon={<Ticket size={20} />}>
                        Todos os Chamados
                      </MobileNavLink>
                      <MobileNavLink to="/admin/meus-chamados" icon={<User size={20} />}>
                        Meus Chamados
                      </MobileNavLink>
                      <MobileNavLink to="/admin/arquivos" icon={<FileText size={20} />}>
                        Arquivos
                      </MobileNavLink>
                      <MobileNavLink to="/admin/cronogramas" icon={<Calendar size={20} />}>
                        Cronogramas
                      </MobileNavLink>
                      <MobileNavLink to="/admin/mensagens" icon={<MessageSquare size={20} />}>
                        Mensagens
                      </MobileNavLink>
                      <MobileNavLink to="/admin/logs" icon={<Shield size={20} />}>
                        Logs de Acesso
                      </MobileNavLink>
                      <MobileNavLink to="/admin/activity-logs" icon={<Activity size={20} />}>
                        Logs de Atividade
                      </MobileNavLink>
                      <MobileNavLink to="/admin/onedrive" icon={<Cloud size={20} />}>
                        OneDrive/SharePoint
                      </MobileNavLink>
                      <MobileNavLink to="/admin/configuracoes" icon={<Settings size={20} />}>
                        Configurações
                      </MobileNavLink>
                      
                      {/* FP&A Section */}
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          FP&A - Consultoria
                        </h4>
                        <MobileNavLink to="/admin/fpa/gestao-clientes" icon={<Users size={20} />}>
                          Gestão de Clientes FP&A
                        </MobileNavLink>
                        <MobileNavLink to="/admin/fpa/integracao-dados" icon={<Database size={20} />}>
                          Integração de Dados
                        </MobileNavLink>
                        <MobileNavLink to="/admin/fpa/modelagem" icon={<BarChart3 size={20} />}>
                          Motor de Modelagem
                        </MobileNavLink>
                        <MobileNavLink to="/admin/fpa/analise-variacao" icon={<Target size={20} />}>
                          Análise de Variação
                        </MobileNavLink>
                        <MobileNavLink to="/admin/fpa/relatorios" icon={<PieChart size={20} />}>
                          Construtor de Relatórios
                        </MobileNavLink>
                      </div>
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
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider mb-4">
                Menu Principal
              </h3>
              <div className="space-y-1">
                <NavLink to="/admin" icon={<LayoutDashboard size={20} />}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/clientes" icon={<Users size={20} />}>
                  Gestão de Clientes
                </NavLink>
                <NavLink to="/admin/projetos" icon={<Briefcase size={20} />}>
                  Projetos
                </NavLink>
                <NavLink to="/admin/colaboradores" icon={<UserCheck size={20} />}>
                  Colaboradores
                </NavLink>
                <NavLink to="/admin/tarefas" icon={<CheckSquare size={20} />}>
                  Tarefas
                </NavLink>
                <NavLink to="/admin/chamados" icon={<Ticket size={20} />}>
                  Todos os Chamados
                </NavLink>
                <NavLink to="/admin/meus-chamados" icon={<User size={20} />}>
                  Meus Chamados
                </NavLink>
                <NavLink to="/admin/arquivos" icon={<FileText size={20} />}>
                  Arquivos
                </NavLink>
                <NavLink to="/admin/cronogramas" icon={<Calendar size={20} />}>
                  Cronogramas
                </NavLink>
                <NavLink to="/admin/mensagens" icon={<MessageSquare size={20} />}>
                  Mensagens Automáticas
                </NavLink>
                <NavLink to="/admin/logs" icon={<Shield size={20} />}>
                  Logs de Acesso
                </NavLink>
                <NavLink to="/admin/activity-logs" icon={<Activity size={20} />}>
                  Logs de Atividade
                </NavLink>
                <NavLink to="/admin/onedrive" icon={<Cloud size={20} />}>
                  OneDrive/SharePoint
                </NavLink>
                <NavLink to="/admin/configuracoes" icon={<Settings size={20} />}>
                  Configurações
                </NavLink>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider mb-4">
                FP&A - Consultoria Financeira
              </h3>
              <div className="space-y-1">
                <NavLink to="/admin/fpa/gestao-clientes" icon={<Users size={20} />}>
                  Gestão de Clientes FP&A
                </NavLink>
                <NavLink to="/admin/fpa/integracao-dados" icon={<Database size={20} />}>
                  Integração de Dados
                </NavLink>
                <NavLink to="/admin/fpa/modelagem" icon={<BarChart3 size={20} />}>
                  Motor de Modelagem
                </NavLink>
                <NavLink to="/admin/fpa/analise-variacao" icon={<Target size={20} />}>
                  Análise de Variação
                </NavLink>
                <NavLink to="/admin/fpa/relatorios" icon={<PieChart size={20} />}>
                  Construtor de Relatórios
                </NavLink>
              </div>
            </div>
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Admin Chat Widget */}
      <Chat isAdmin={true} />
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

export default AdminArea;
