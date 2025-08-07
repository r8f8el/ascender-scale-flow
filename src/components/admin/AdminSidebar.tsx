
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
    name: 'Colaboradores',
    href: '/admin/colaboradores',
    icon: Users,
  },
  {
    name: 'Projetos',
    href: '/admin/projetos',
    icon: Briefcase,
  },
  {
    name: 'Tarefas',
    href: '/admin/tarefas',
    icon: CheckSquare,
  },
  {
    name: 'Chamados',
    href: '/admin/chamados',
    icon: Ticket,
  },
  {
    name: 'Meus Chamados',
    href: '/admin/meus-chamados',
    icon: Ticket,
  },
  {
    name: 'Arquivos',
    href: '/admin/arquivos',
    icon: Upload,
  },
  {
    name: 'Documentos',
    href: '/admin/documentos',
    icon: FileText,
  },
];

const fpaNavigation = [
  {
    name: 'Dashboard FP&A',
    href: '/admin/fpa',
    icon: Calculator,
  },
  {
    name: 'Clientes FP&A',
    href: '/admin/fpa/clientes',
    icon: TrendingUp,
  },
  {
    name: 'Integração de Dados',
    href: '/admin/fpa/integracao',
    icon: Database,
  },
  {
    name: 'Construtor de Relatórios',
    href: '/admin/fpa/relatorios',
    icon: FileBarChart,
  },
  {
    name: 'Análise de Variância',
    href: '/admin/fpa/variancia',
    icon: BarChart3,
  },
  {
    name: 'Modelagem Financeira',
    href: '/admin/fpa/modelagem',
    icon: Layers,
  },
];

const systemNavigation = [
  {
    name: 'Fluxos de Aprovação',
    href: '/admin/workflows',
    icon: Shield,
  },
  {
    name: 'Logs do Sistema',
    href: '/admin/logs',
    icon: Activity,
  },
  {
    name: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
  {
    name: 'Testes',
    href: '/admin/testing',
    icon: TestTube,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  const isCurrentPath = (href: string) => {
    if (href === '/admin/fpa') {
      return location.pathname === '/admin/fpa' || location.pathname === '/admin/fpa/';
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItems = (items: typeof navigation) => (
    items.map((item) => (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200',
          isCurrentPath(item.href)
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </Link>
    ))
  );

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-white border-b border-gray-100">
          <h1 className="text-gray-900 text-lg font-semibold">Admin Panel</h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto py-4">
          <nav className="flex-1">
            {/* General Section */}
            <div className="space-y-1">
              {renderNavItems(navigation)}
            </div>

            {/* FP&A Analytics Section */}
            <div className="mt-8">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  FP&A ANALYTICS
                </h3>
              </div>
              <div className="space-y-1">
                {renderNavItems(fpaNavigation)}
              </div>
            </div>

            {/* System Section */}
            <div className="mt-8">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SISTEMA
                </h3>
              </div>
              <div className="space-y-1">
                {renderNavItems(systemNavigation)}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
