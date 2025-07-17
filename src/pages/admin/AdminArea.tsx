
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AdminAuthContext';
import { Chat } from '@/components/Chat';
import AdminDashboard from './AdminDashboard';
import ClientesAdmin from './ClientesAdmin';
import ProjectsAdmin from './ProjectsAdmin';
import CollaboratorsAdmin from './CollaboratorsAdmin';
import TasksAdmin from './TasksAdmin';
import TicketsAdmin from './TicketsAdmin';
import MyTickets from './MyTickets';
import ArquivosAdmin from './ArquivosAdmin';
import CronogramasAdmin from './CronogramasAdmin';
import MensagensAdmin from './MensagensAdmin';
import LogsAdmin from './LogsAdmin';
import ActivityLogsAdmin from './ActivityLogsAdmin';
import OneDriveIntegration from './OneDriveIntegration';
import ConfiguracoesAdmin from './ConfiguracoesAdmin';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  UserCheck,
  CheckSquare,
  Ticket, 
  FileText,
  Calendar,
  MessageSquare,
  Activity,
  HardDrive,
  Settings,
  LogOut
} from 'lucide-react';

const AdminArea = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Gestão de Clientes', href: '/admin/clientes', icon: Users },
    { name: 'Projetos', href: '/admin/projetos', icon: Briefcase },
    { name: 'Colaboradores', href: '/admin/colaboradores', icon: UserCheck },
    { name: 'Tarefas', href: '/admin/tarefas', icon: CheckSquare },
    { name: 'Todos os Chamados', href: '/admin/chamados', icon: Ticket },
    { name: 'Meus Chamados', href: '/admin/meus-chamados', icon: Ticket },
    { name: 'Arquivos', href: '/admin/arquivos', icon: FileText },
    { name: 'Cronogramas', href: '/admin/cronogramas', icon: Calendar },
    { name: 'Mensagens Automáticas', href: '/admin/mensagens', icon: MessageSquare },
    { name: 'Logs de Acesso', href: '/admin/logs', icon: Activity },
    { name: 'Logs de Atividade', href: '/admin/logs-atividade', icon: Activity },
    { name: 'OneDrive/SharePoint', href: '/admin/onedrive', icon: HardDrive },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary">Área Administrativa</h1>
              {admin && (
                <div className="ml-4 text-sm text-muted-foreground">
                  Bem-vindo, {admin.name}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-900 border-r min-h-[calc(100vh-4rem)] p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/clientes" element={<ClientesAdmin />} />
            <Route path="/projetos" element={<ProjectsAdmin />} />
            <Route path="/colaboradores" element={<CollaboratorsAdmin />} />
            <Route path="/tarefas" element={<TasksAdmin />} />
            <Route path="/chamados" element={<TicketsAdmin />} />
            <Route path="/meus-chamados" element={<MyTickets />} />
            <Route path="/arquivos" element={<ArquivosAdmin />} />
            <Route path="/cronogramas" element={<CronogramasAdmin />} />
            <Route path="/mensagens" element={<MensagensAdmin />} />
            <Route path="/logs" element={<LogsAdmin />} />
            <Route path="/logs-atividade" element={<ActivityLogsAdmin />} />
            <Route path="/onedrive" element={<OneDriveIntegration />} />
            <Route path="/configuracoes" element={<ConfiguracoesAdmin />} />
          </Routes>
        </main>
      </div>

      {/* Admin Chat Widget */}
      <Chat isAdmin={true} />
    </div>
  );
};

export default AdminArea;
