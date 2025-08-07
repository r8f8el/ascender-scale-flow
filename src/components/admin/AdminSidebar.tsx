
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Ticket, 
  Briefcase, 
  CheckSquare, 
  Activity,
  Upload,
  Shield,
  TestTube,
  Calculator,
  TrendingUp,
  Database,
  FileBarChart,
  BarChart3,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: 'Clientes',
    href: '/admin/clientes',
    icon: Users,
    current: false,
  },
  {
    name: 'Colaboradores',
    href: '/admin/colaboradores',
    icon: Users,
    current: false,
  },
  {
    name: 'Projetos',
    href: '/admin/projetos',
    icon: Briefcase,
    current: false,
  },
  {
    name: 'Tarefas',
    href: '/admin/tarefas',
    icon: CheckSquare,
    current: false,
  },
  {
    name: 'Chamados',
    href: '/admin/chamados',
    icon: Ticket,
    current: false,
  },
  {
    name: 'Meus Chamados',
    href: '/admin/meus-chamados',
    icon: Ticket,
    current: false,
  },
  {
    name: 'Arquivos',
    href: '/admin/arquivos',
    icon: Upload,
    current: false,
  },
  {
    name: 'Documentos',
    href: '/admin/documentos',
    icon: FileText,
    current: false,
  },
];

const fpaNavigation = [
  {
    name: 'Dashboard FP&A',
    href: '/admin/fpa',
    icon: Calculator,
    current: false,
  },
  {
    name: 'Clientes FP&A',
    href: '/admin/fpa/clientes',
    icon: TrendingUp,
    current: false,
  },
  {
    name: 'Integração de Dados',
    href: '/admin/fpa/integracao',
    icon: Database,
    current: false,
  },
  {
    name: 'Construtor de Relatórios',
    href: '/admin/fpa/relatorios',
    icon: FileBarChart,
    current: false,
  },
  {
    name: 'Análise de Variância',
    href: '/admin/fpa/variancia',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Modelagem Financeira',
    href: '/admin/fpa/modelagem',
    icon: Layers,
    current: false,
  },
];

const systemNavigation = [
  {
    name: 'Fluxos de Aprovação',
    href: '/admin/workflows',
    icon: Shield,
    current: false,
  },
  {
    name: 'Logs do Sistema',
    href: '/admin/logs',
    icon: Activity,
    current: false,
  },
  {
    name: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
    current: false,
  },
  {
    name: 'Testes',
    href: '/admin/testing',
    icon: TestTube,
    current: false,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  const isCurrentPath = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <h1 className="text-white text-lg font-semibold">Admin Panel</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Geral
              </h3>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isCurrentPath(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isCurrentPath(item.href) ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                FP&A Analytics
              </h3>
              {fpaNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isCurrentPath(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isCurrentPath(item.href) ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sistema
              </h3>
              {systemNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isCurrentPath(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isCurrentPath(item.href) ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
