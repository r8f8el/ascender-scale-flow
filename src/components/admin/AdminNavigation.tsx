
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  ClipboardList,
  Calendar,
  Settings,
  Activity,
  CheckCircle,
  X 
} from 'lucide-react';

interface AdminNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNavigation({ isOpen, onClose }: AdminNavigationProps) {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
    { name: 'Clientes', href: '/admin/clientes', icon: Users },
    { name: 'Arquivos', href: '/admin/arquivos', icon: FileText },
    { name: 'Solicitações', href: '/admin/solicitacoes', icon: ClipboardList },
    { name: 'Aprovações', href: '/admin/aprovacoes', icon: CheckCircle },
    { name: 'Cronogramas', href: '/admin/cronogramas', icon: Calendar },
    { name: 'Logs', href: '/admin/logs', icon: Activity },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-4 lg:hidden">
          <h2 className="text-lg font-semibold">Menu Admin</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )
                    }
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
