
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
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
  Layers,
  Kanban,
  MessageCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Colaboradores',
    href: '/admin/colaboradores',
    icon: Users,
  },
  {
    name: 'Clientes',
    href: '/admin/clientes',
    icon: Users,
  },
  {
    name: 'Projetos',
    href: '/admin/projetos',
    icon: Briefcase,
  },
  {
    name: 'Kanban',
    href: '/admin/kanban',
    icon: Kanban,
  },
  {
    name: 'Cronogramas',
    href: '/admin/gantt',
    icon: BarChart3,
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
    name: 'Chat',
    href: '/admin/chat',
    icon: MessageCircle,
  },
  {
    name: 'Aprovações',
    href: '/admin/aprovacoes',
    icon: Shield,
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
  {
    name: 'Embeds de BI',
    href: '/admin/fpa/bi',
    icon: BarChart3,
  },
];

const systemNavigation = [
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
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItems = (items: typeof navigation) => (
    items.map((item) => (
      <SidebarMenuItem key={item.name}>
        <SidebarMenuButton asChild isActive={isCurrentPath(item.href)}>
          <Link to={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))
  );

  return (
    <Sidebar collapsible="icon">
            <SidebarHeader className="border-b">
        <div className="flex items-center justify-center p-2">
          <Logo className="h-8 w-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(navigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>FP&A Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(fpaNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(systemNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
