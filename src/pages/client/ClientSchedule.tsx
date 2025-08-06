
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MapPin, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  type: 'meeting' | 'deadline' | 'task' | 'presentation';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  attendees?: string[];
  created_at: string;
}

const ClientSchedule = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar eventos/tarefas relacionados ao cliente
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          due_date,
          status,
          priority,
          project:project_id(name, client_id),
          assigned_to:assigned_to(name)
        `)
        .eq('project.client_id', user.id);

      if (tasksError) {
        console.error('Erro ao carregar tarefas:', tasksError);
      }

      // Buscar projetos e suas datas importantes
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id);

      if (projectsError) {
        console.error('Erro ao carregar projetos:', projectsError);
      }

      // Converter dados para formato de eventos
      const allEvents: Event[] = [];

      // Adicionar tarefas como eventos
      if (tasks) {
        tasks.forEach(task => {
          if (task.due_date) {
            allEvents.push({
              id: `task-${task.id}`,
              title: task.title,
              description: task.description || '',
              start_date: task.due_date,
              end_date: task.due_date,
              type: 'task',
              status: task.status === 'completed' ? 'completed' : 'scheduled',
              created_at: new Date().toISOString()
            });
          }
        });
      }

      // Adicionar marcos dos projetos
      if (projects) {
        projects.forEach(project => {
          if (project.start_date) {
            allEvents.push({
              id: `project-start-${project.id}`,
              title: `Início: ${project.name}`,
              description: project.description || '',
              start_date: project.start_date,
              end_date: project.start_date,
              type: 'presentation',
              status: 'scheduled',
              created_at: project.created_at
            });
          }
          
          if (project.end_date) {
            allEvents.push({
              id: `project-end-${project.id}`,
              title: `Entrega: ${project.name}`,
              description: project.description || '',
              start_date: project.end_date,
              end_date: project.end_date,
              type: 'deadline',
              status: project.status === 'completed' ? 'completed' : 'scheduled',
              created_at: project.created_at
            });
          }
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
      toast.error('Erro ao carregar cronograma');
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type: string, status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'cancelled') return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'task':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'presentation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <User className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'task':
        return <Calendar className="h-4 w-4" />;
      case 'presentation':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatEventType = (type: string) => {
    const types = {
      meeting: 'Reunião',
      deadline: 'Prazo',
      task: 'Tarefa',
      presentation: 'Apresentação'
    };
    return types[type as keyof typeof types] || type;
  };

  const formatStatus = (status: string) => {
    const statuses = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  // Filtrar eventos do mês atual para visualização
  const currentMonthEvents = events.filter(event => {
    const eventDate = new Date(event.start_date);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Eventos próximos (próximos 7 dias)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_date);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return eventDate >= today && eventDate <= nextWeek && event.status !== 'completed';
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando cronograma...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cronograma</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe seus compromissos, prazos e marcos importantes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            Lista
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
            size="sm"
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-blue-600">{currentMonthEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos 7 Dias</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingEvents.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos eventos */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getEventColor(event.type, event.status)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getEventColor(event.type, event.status)}>
                    {formatEventType(event.type)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de todos os eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-600">Seus compromissos e prazos aparecerão aqui conforme os projetos forem criados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events
                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getEventColor(event.type, event.status)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{event.title}</h4>
                          {event.description && (
                            <p className="text-gray-600 mt-1">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.start_date).toLocaleDateString('pt-BR')}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={getEventColor(event.type, event.status)}>
                          {formatEventType(event.type)}
                        </Badge>
                        <Badge variant="outline">
                          {formatStatus(event.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSchedule;
