
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  MessageCircle, 
  FolderOpen, 
  Activity, 
  Settings,
  UserPlus,
  Calendar,
  GitBranch,
  BarChart3,
  Database,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/clients', label: 'Clientes', icon: Users },
    { path: '/admin/documents', label: 'Documentos', icon: FileText },
    { path: '/admin/tickets', label: 'Chamados', icon: MessageCircle },
    { path: '/admin/projects', label: 'Projetos', icon: FolderOpen },
    { path: '/admin/logs', label: 'Logs do Sistema', icon: Activity },
    { path: '/admin/approval-flows', label: 'Fluxos de Aprovação', icon: GitBranch },
    { path: '/admin/collaborators', label: 'Colaboradores', icon: UserPlus },
    { path: '/admin/schedules', label: 'Cronogramas', icon: Calendar },
    { path: '/admin/settings', label: 'Configurações', icon: Settings },
  ];

  const fpaMenuItems = [
    { path: '/admin/fpa/clients', label: 'Gerenciamento FP&A', icon: BarChart3 },
    { path: '/admin/fpa/data-integration', label: 'Integração de Dados', icon: Database },
    { path: '/admin/fpa/reports', label: 'Construtor de Relatórios', icon: FileSpreadsheet },
    { path: '/admin/fpa/variance-analysis', label: 'Análise de Variação', icon: TrendingUp },
  ];

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white border-r border-border overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <IconComponent className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
        
        {/* FP&A Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            FP&A
          </h3>
          {fpaMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                <IconComponent className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
