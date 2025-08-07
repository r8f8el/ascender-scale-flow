
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

const mainNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Clientes',
    href: '/admin/clientes',
    icon: Users,
  },
  {
    name: 'Documentos',
    href: '/admin/documentos',
    icon: FileText,
  },
  {
    name: 'FP&A - Gestão Clientes',
    href: '/admin/fpa/clientes',
    icon: TrendingUp,
  },
  {
    name: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  const isCurrentPath = (href: string) => {
    if (href === '/admin/fpa') {
      return location.pathname === '/admin/fpa' || location.pathname === '/admin/fpa/';
    }
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItems = (items: typeof mainNavigation) => (
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
        {/* Header com Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-white border-b border-gray-100">
          <img 
            src="/lovable-uploads/770511e1-4eca-4d48-9bf0-ba1d8072c723.png" 
            alt="Ascalate Logo" 
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto py-4">
          <nav className="flex-1">
            {/* Menu Principal */}
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                MENU PRINCIPAL
              </h3>
            </div>
            <div className="space-y-1">
              {renderNavItems(mainNavigation)}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
