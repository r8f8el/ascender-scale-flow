
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Target, TrendingUp, Users, Settings, BarChart3 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // em dias
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  dependencies?: string[];
  icon?: React.ReactNode;
}

interface FPATaskTemplatesProps {
  onSelectTemplate: (template: { name: string; duration: number; description: string }) => void;
  startDate: Date;
}

const taskTemplates: TaskTemplate[] = [
  {
    id: 'kickoff',
    name: 'Kick-off do Projeto',
    description: 'Reunião inicial com stakeholders para alinhamento de objetivos e escopo',
    duration: 1,
    category: 'Planejamento',
    priority: 'high',
    estimatedHours: 4,
    icon: <Target className="h-4 w-4" />
  },
  {
    id: 'data-collection',
    name: 'Coleta de Dados Históricos',
    description: 'Levantamento e organização de dados financeiros dos últimos 24 meses',
    duration: 5,
    category: 'Análise',
    priority: 'medium',
    estimatedHours: 32,
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    id: 'baseline-model',
    name: 'Construção do Modelo Base',
    description: 'Desenvolvimento do modelo financeiro inicial com drivers principais',
    duration: 7,
    category: 'Modelagem',
    priority: 'high',
    estimatedHours: 48,
    icon: <Settings className="h-4 w-4" />
  },
  {
    id: 'scenario-analysis',
    name: 'Análise de Cenários',
    description: 'Criação de cenários otimista, pessimista e realista',
    duration: 3,
    category: 'Análise',
    priority: 'medium',
    estimatedHours: 20,
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    id: 'variance-analysis',
    name: 'Análise de Variações',
    description: 'Comparação entre real vs orçado e identificação de desvios',
    duration: 2,
    category: 'Análise',
    priority: 'medium',
    estimatedHours: 12,
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    id: 'rolling-forecast',
    name: 'Rolling Forecast',
    description: 'Implementação de previsão contínua trimestral',
    duration: 4,
    category: 'Previsão',
    priority: 'high',
    estimatedHours: 28,
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'dashboard-setup',
    name: 'Configuração de Dashboard',
    description: 'Criação de painéis executivos e operacionais',
    duration: 3,
    category: 'Reporting',
    priority: 'medium',
    estimatedHours: 20,
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    id: 'training',
    name: 'Treinamento da Equipe',
    description: 'Capacitação da equipe nas ferramentas e processos FP&A',
    duration: 2,
    category: 'Treinamento',
    priority: 'medium',
    estimatedHours: 16,
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'documentation',
    name: 'Documentação de Processos',
    description: 'Elaboração de manuais e procedimentos operacionais',
    duration: 3,
    category: 'Documentação',
    priority: 'low',
    estimatedHours: 20,
    icon: <FileText className="h-4 w-4" />
  }
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Planejamento': 'bg-blue-100 text-blue-700',
    'Análise': 'bg-green-100 text-green-700',
    'Modelagem': 'bg-purple-100 text-purple-700',
    'Previsão': 'bg-orange-100 text-orange-700',
    'Reporting': 'bg-cyan-100 text-cyan-700',
    'Treinamento': 'bg-pink-100 text-pink-700',
    'Documentação': 'bg-gray-100 text-gray-700'
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    'urgent': 'bg-red-100 text-red-700',
    'high': 'bg-orange-100 text-orange-700',
    'medium': 'bg-yellow-100 text-yellow-700',
    'low': 'bg-blue-100 text-blue-700'
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
};

export const FPATaskTemplates: React.FC<FPATaskTemplatesProps> = ({
  onSelectTemplate,
  startDate
}) => {
  const groupedTemplates = taskTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, TaskTemplate[]>);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 mx-auto text-primary mb-3" />
        <h3 className="text-lg font-semibold mb-2">Templates FP&A</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um template pré-configurado para acelerar a criação de tarefas
        </p>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid gap-3">
              {templates.map((template) => {
                const endDate = addDays(startDate, template.duration);
                
                return (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => onSelectTemplate({
                      name: template.name,
                      duration: template.duration,
                      description: template.description
                    })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          {template.icon || <FileText className="h-4 w-4 text-primary" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-sm truncate">{template.name}</h5>
                            <Badge variant="outline" className={getPriorityColor(template.priority)}>
                              {template.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {template.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{template.duration} dia{template.duration > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{template.estimatedHours || template.duration * 8}h</span>
                            </div>
                            <Badge variant="outline" className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span>Fim previsto: {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
