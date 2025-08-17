
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Upload,
  Calendar,
  MessageSquare,
  Users,
  Phone,
  Shield,
  Calculator,
  Database,
  BarChart3,
  TrendingUp,
  MessageCircle,
  Kanban,
  CheckCircle
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
} from "@/components/ui/sidebar";

const mainNavigation = [
  {
    name: 'Dashboard',
    href: '/cliente',
    icon: BarChart3,
  },
  {
    name: 'Documentos',
    href: '/cliente/documentos',
    icon: FileText,
  },
  {
    name: 'Solicitações',
    href: '/cliente/requests',
    icon: Upload,
  },
  {
    name: 'Cronograma',
    href: '/cliente/cronograma',
    icon: Calendar,
  },
  {
    name: 'Chamados',
    href: '/cliente/chamados',
    icon: MessageSquare,
  },
  {
    name: 'Equipe',
    href: '/cliente/equipe',
    icon: Users,
  },
  {
    name: 'Contato',
    href: '/cliente/contato',
    icon: Phone,
  },
];

const approvalNavigation = [
  {
    name: 'Aprovações',
    href: '/cliente/aprovacoes',
    icon: Shield,
  },
];

const projectNavigation = [
  {
    name: 'Kanban',
    href: '/cliente/kanban',
    icon: Kanban,
  },
  {
    name: 'Gantt',
    href: '/cliente/gantt',
    icon: BarChart3,
  },
];

const fpaNavigation = [
  {
    name: 'Dashboard FP&A',
    href: '/cliente/fpa',
    icon: Calculator,
  },
  {
    name: 'Dashboard Real',
    href: '/cliente/fpa/dashboard',
    icon: TrendingUp,
  },
  {
    name: 'Dados',
    href: '/cliente/fpa/dados',
    icon: Database,
  },
  {
    name: 'Relatórios',
    href: '/cliente/fpa/relatorios',
    icon: BarChart3,
  },
  {
    name: 'Cenários',
    href: '/cliente/fpa/cenarios',
    icon: CheckCircle,
  },
  {
    name: 'Comunicação',
    href: '/cliente/fpa/comunicacao',
    icon: MessageCircle,
  },
  {
    name: 'BI Dashboard',
    href: '/cliente/fpa/bi',
    icon: BarChart3,
  },
];

export function ClientNavigation() {
  const location = useLocation();

  const isCurrentPath = (href: string) => {
    if (href === '/cliente/fpa') {
      return location.pathname === '/cliente/fpa' || location.pathname === '/cliente/fpa/';
    }
    if (href === '/cliente') {
      return location.pathname === '/cliente' || location.pathname === '/cliente/';
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItems = (items: typeof mainNavigation) => (
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
          <img 
            src="/lovable-uploads/770511e1-4eca-4d48-9bf0-ba1d8072c723.png" 
            alt="Ascalate Logo" 
            className="h-8 w-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(mainNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Aprovações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(approvalNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projetos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(projectNavigation)}
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
      </SidebarContent>
    </Sidebar>
  );
}
