
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GanttProject } from '@/hooks/useGanttProjects';

interface GanttProjectSelectorProps {
  projects: GanttProject[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  loading?: boolean;
}

const priorityColors = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500', 
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

const statusColors = {
  planning: 'bg-gray-500',
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  on_hold: 'bg-yellow-500',
  cancelled: 'bg-red-500'
};

export const GanttProjectSelector: React.FC<GanttProjectSelectorProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  loading
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Projetos</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Projetos</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum projeto encontrado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4" />
          Projetos ({projects.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant={selectedProjectId === project.id ? "default" : "ghost"}
              className="w-full p-4 h-auto justify-start text-left transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onSelectProject(project.id)}
            >
              <div className="w-full space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm truncate flex-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${priorityColors[project.priority]} text-white`}
                    >
                      {project.priority === 'low' ? 'Baixa' :
                       project.priority === 'medium' ? 'Média' :
                       project.priority === 'high' ? 'Alta' : 'Urgente'}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${statusColors[project.status]} text-white border-0`}
                    >
                      {project.status === 'planning' ? 'Planejamento' :
                       project.status === 'active' ? 'Ativo' :
                       project.status === 'completed' ? 'Concluído' :
                       project.status === 'on_hold' ? 'Pausado' : 'Cancelado'}
                    </Badge>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(project.start_date), 'dd/MM', { locale: ptBR })} - {' '}
                      {format(new Date(project.end_date), 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                  {project.budget && (
                    <div className="flex items-center gap-1">
                      <span>R$ {project.budget.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
