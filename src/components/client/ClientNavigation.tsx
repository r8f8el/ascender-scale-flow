
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Calendar, 
  MessageCircle, 
  Users, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Kanban,
  GanttChart,
  CheckCircle2
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const ClientNavigation = () => {
  const location = useLocation();
  const { client } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === `/cliente${path}` || location.pathname.startsWith(`/cliente${path}/`);
  };

  const getLinkClass = (path: string) => {
    return `flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
      isActive(path)
        ? 'bg-primary text-primary-foreground'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;
  };

  const getSubLinkClass = (path: string) => {
    return `flex items-center px-6 py-2 rounded-md text-sm transition-colors ${
      isActive(path)
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;
  };

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200 p-4 h-full overflow-y-auto">
      <div className="space-y-1">
        {/* Main Navigation */}
        <Collapsible 
          open={expandedSections.includes('main')} 
          onOpenChange={() => toggleSection('main')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            Principal
            {expandedSections.includes('main') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            <Link to="/cliente" className={getLinkClass('')}>
              <FileText className="mr-3 h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/cliente/documentos" className={getLinkClass('/documentos')}>
              <FileText className="mr-3 h-4 w-4" />
              Documentos
            </Link>
            <Link to="/cliente/cronograma" className={getLinkClass('/cronograma')}>
              <Calendar className="mr-3 h-4 w-4" />
              Cronograma
            </Link>
            <Link to="/cliente/chamados" className={getLinkClass('/chamados')}>
              <HelpCircle className="mr-3 h-4 w-4" />
              Chamados
            </Link>
            <Link to="/cliente/equipe" className={getLinkClass('/equipe')}>
              <Users className="mr-3 h-4 w-4" />
              Equipe
            </Link>
            <Link to="/cliente/contato" className={getLinkClass('/contato')}>
              <MessageCircle className="mr-3 h-4 w-4" />
              Contato
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {/* Approval Flows */}
        <Collapsible 
          open={expandedSections.includes('aprovacoes')} 
          onOpenChange={() => toggleSection('aprovacoes')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            Aprovações
            {expandedSections.includes('aprovacoes') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            <Link to="/cliente/aprovacoes" className={getSubLinkClass('/aprovacoes')}>
              <CheckCircle2 className="mr-3 h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/cliente/aprovacoes/solicitacoes" className={getSubLinkClass('/aprovacoes/solicitacoes')}>
              <FileText className="mr-3 h-4 w-4" />
              Minhas Solicitações
            </Link>
            <Link to="/cliente/aprovacoes/dashboard" className={getSubLinkClass('/aprovacoes/dashboard')}>
              <CheckCircle2 className="mr-3 h-4 w-4" />
              Tarefas de Aprovação
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {/* Project Management */}
        <Collapsible 
          open={expandedSections.includes('projects')} 
          onOpenChange={() => toggleSection('projects')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            Projetos
            {expandedSections.includes('projects') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            <Link to="/cliente/kanban" className={getSubLinkClass('/kanban')}>
              <Kanban className="mr-3 h-4 w-4" />
              Kanban
            </Link>
            <Link to="/cliente/gantt" className={getSubLinkClass('/gantt')}>
              <GanttChart className="mr-3 h-4 w-4" />
              Gantt
            </Link>
          </CollapsibleContent>
        </Collapsible>

        {/* FP&A Section */}
        <Collapsible 
          open={expandedSections.includes('fpa')} 
          onOpenChange={() => toggleSection('fpa')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            FP&A
            {expandedSections.includes('fpa') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            <Link to="/cliente/fpa" className={getSubLinkClass('/fpa')}>
              <BarChart3 className="mr-3 h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/cliente/fpa/dados" className={getSubLinkClass('/fpa/dados')}>
              <FileText className="mr-3 h-4 w-4" />
              Dados
            </Link>
            <Link to="/cliente/fpa/relatorios" className={getSubLinkClass('/fpa/relatorios')}>
              <BarChart3 className="mr-3 h-4 w-4" />
              Relatórios
            </Link>
            <Link to="/cliente/fpa/cenarios" className={getSubLinkClass('/fpa/cenarios')}>
              <BarChart3 className="mr-3 h-4 w-4" />
              Cenários
            </Link>
            <Link to="/cliente/fpa/comunicacao" className={getSubLinkClass('/fpa/comunicacao')}>
              <MessageCircle className="mr-3 h-4 w-4" />
              Comunicação
            </Link>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </nav>
  );
};
