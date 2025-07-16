import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'project' | 'task';
  title: string;
  description?: string;
  status: string;
  date: string;
  assigned_to?: string;
  collaborator_name?: string;
}

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [projectId]);

  const loadTimeline = async () => {
    try {
      // Carregar eventos do projeto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, status, start_date, end_date, created_at')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Carregar tarefas do projeto
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id, title, description, status, due_date, created_at, assigned_to,
          collaborators(name)
        `)
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Combinar eventos
      const timelineEvents: TimelineEvent[] = [];

      // Adicionar evento de criação do projeto
      timelineEvents.push({
        id: `project-${projectData.id}`,
        type: 'project',
        title: `Projeto "${projectData.name}" criado`,
        status: 'created',
        date: projectData.created_at
      });

      // Adicionar data de início se existir
      if (projectData.start_date) {
        timelineEvents.push({
          id: `project-start-${projectData.id}`,
          type: 'project',
          title: `Projeto "${projectData.name}" iniciado`,
          status: 'started',
          date: projectData.start_date
        });
      }

      // Adicionar data de fim se existir
      if (projectData.end_date) {
        timelineEvents.push({
          id: `project-end-${projectData.id}`,
          type: 'project',
          title: `Projeto "${projectData.name}" finalizado`,
          status: 'completed',
          date: projectData.end_date
        });
      }

      // Adicionar tarefas
      tasksData.forEach(task => {
        timelineEvents.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          status: task.status,
          date: task.due_date || task.created_at,
          assigned_to: task.assigned_to,
          collaborator_name: task.collaborators?.name
        });
      });

      // Ordenar por data
      timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEvents(timelineEvents);
    } catch (error) {
      console.error('Erro ao carregar timeline:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar timeline do projeto.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string, status: string) => {
    if (type === 'project') {
      switch (status) {
        case 'created': return <PlayCircle className="h-4 w-4 text-blue-500" />;
        case 'started': return <PlayCircle className="h-4 w-4 text-green-500" />;
        case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'on_hold': return <PauseCircle className="h-4 w-4 text-yellow-500" />;
        default: return <Calendar className="h-4 w-4 text-gray-500" />;
      }
    } else {
      switch (status) {
        case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
        case 'blocked': return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        default: return <Calendar className="h-4 w-4 text-gray-500" />;
      }
    }
  };

  const getStatusColor = (type: string, status: string) => {
    if (type === 'project') {
      switch (status) {
        case 'created': return 'bg-blue-100 text-blue-800';
        case 'started': return 'bg-green-100 text-green-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'on_hold': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'blocked': return 'bg-red-100 text-red-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getStatusLabel = (type: string, status: string) => {
    if (type === 'project') {
      switch (status) {
        case 'created': return 'Criado';
        case 'started': return 'Iniciado';
        case 'completed': return 'Concluído';
        case 'on_hold': return 'Em Espera';
        default: return status;
      }
    } else {
      switch (status) {
        case 'completed': return 'Concluída';
        case 'in_progress': return 'Em Progresso';
        case 'blocked': return 'Bloqueada';
        case 'pending': return 'Pendente';
        default: return status;
      }
    }
  };

  const isOverdue = (date: string, status: string) => {
    return new Date(date) < new Date() && status !== 'completed';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-32">Carregando timeline...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline do Projeto</CardTitle>
        <CardDescription>
          Histórico de eventos e marcos do projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                    {getEventIcon(event.type, event.status)}
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-2"></div>
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge className={getStatusColor(event.type, event.status)}>
                          {getStatusLabel(event.type, event.status)}
                        </Badge>
                        {event.type === 'task' && isOverdue(event.date, event.status) && (
                          <Badge variant="destructive">Atrasada</Badge>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        {event.collaborator_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{event.collaborator_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground">
              Os eventos do projeto aparecerão aqui conforme eles são criados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;