
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, Target, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';
import GanttChart from '@/components/gantt/GanttChart';
import { GanttTaskCreator } from '@/components/gantt/GanttTaskCreator';
import { GanttTaskModal } from '@/components/gantt/GanttTaskModal';
import { GanttProjectSelector } from '@/components/gantt/GanttProjectSelector';
import { GanttStats } from '@/components/gantt/GanttStats';
import { GanttExport } from '@/components/gantt/GanttExport';
import { GanttShare } from '@/components/gantt/GanttShare';
import { useGanttTasks, GanttTask } from '@/hooks/useGanttTasks';
import { useGanttProjects, GanttProject } from '@/hooks/useGanttProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'urgent': 'Urgente'
  };
  return labels[priority] || 'Média';
};

const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'low': 'default',
    'medium': 'secondary',
    'high': 'destructive',
    'urgent': 'destructive'
  };
  return variants[priority] || 'default';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'completed': 'Concluída',
    'in_progress': 'Em Andamento',
    'blocked': 'Bloqueada'
  };
  return labels[status] || 'Pendente';
};

const GanttAdmin = () => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('gantt');
  const [selectedProject, setSelectedProject] = useState<GanttProject | null>(null);

  const { 
    tasks: initialTasks, 
    loading: loadingTasks, 
    error: errorTasks, 
    fetchTasks 
  } = useGanttTasks(selectedProjectId || '');
  
  const { 
    projects, 
    loading: loadingProjects, 
    error: errorProjects, 
    refetch: refetchProjects,
    createProject: handleCreateProject
  } = useGanttProjects();

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  useEffect(() => {
    if (selectedProjectId) {
      const project = projects?.find(p => p.id === selectedProjectId);
      setSelectedProject(project || null);
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId, projects]);

  const handleCreateTask = async (taskData: any) => {
    console.log('Creating task with data:', taskData);

    if (!selectedProjectId) {
      toast.error('Selecione um projeto antes de criar uma tarefa.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gantt_tasks')
        .insert([{ ...taskData, project_id: selectedProjectId }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      
      // Optimistically update local state
      if (data && data.length > 0) {
        const newTask = data[0] as GanttTask;
        setTasks(prevTasks => [...prevTasks, newTask]);
      }
      
      // Invalidate cache and refetch tasks
      await fetchTasks();

      toast.success('Tarefa criada com sucesso!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleTaskUpdate = async (taskId: string, updatedFields: Partial<GanttTask>) => {
    console.log('Updating task:', { taskId, updatedFields });

    try {
      const { data, error } = await supabase
        .from('gantt_tasks')
        .update(updatedFields)
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task updated successfully:', data);
      
      // Optimistically update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updatedFields } : task
        )
      );
      
      // Invalidate cache and refetch tasks
      await fetchTasks();

      toast.success('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('Deleting task with ID:', taskId);

    try {
      const { error } = await supabase
        .from('gantt_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task deleted successfully');
      
      // Optimistically update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Invalidate cache and refetch tasks
      await fetchTasks();

      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'completed' | 'in_progress' | 'blocked') => {
    console.log('Updating task status:', { taskId, newStatus });
    
    try {
      // Calculate progress based on status
      let progress = 0;
      switch (newStatus) {
        case 'completed':
          progress = 100;
          break;
        case 'in_progress':
          progress = Math.max(10, 50); // At least 10% for in progress
          break;
        case 'blocked':
          progress = 0;
          break;
        default:
          progress = 0;
      }

      console.log('Calculated progress:', progress);

      // Update only the progress field in the database
      const { data, error } = await supabase
        .from('gantt_tasks')
        .update({ 
          progress: progress
        })
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task updated successfully:', data);
      
      // Update local state immediately
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, progress } 
            : task
        )
      );

      // Reload tasks to ensure sync
      await fetchTasks();
      
      toast.success(`Status atualizado para ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cronogramas</h1>
          <p className="text-muted-foreground">
            Gerencie projetos e tarefas com gráfico de Gantt
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <GanttExport 
            tasks={tasks} 
            projectName={selectedProject?.name || 'Projeto'} 
          />
          <GanttShare 
            projectId={selectedProjectId || ''} 
            projectName={selectedProject?.name || 'Projeto'}
            isOpen={false}
            onClose={() => {}}
            tasks={tasks}
          />
          <GanttTaskCreator 
            onCreateTask={handleCreateTask}
            loading={loadingTasks}
            disabled={!selectedProjectId}
          />
        </div>
      </div>

      <GanttProjectSelector
        projects={projects || []}
        selectedProjectId={selectedProjectId || ''}
        onSelectProject={setSelectedProjectId}
        loading={loadingProjects}
      />

      {selectedProject && (
        <GanttStats 
          tasks={tasks}
          isAdmin={true}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Gráfico de Gantt
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Lista de Tarefas
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Equipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gantt" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {selectedProjectId && tasks.length > 0 ? (
                <GanttChart 
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskSelect={setSelectedTaskId}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {!selectedProjectId ? (
                    <p>Selecione um projeto para visualizar as tarefas</p>
                  ) : (
                    <p>Nenhuma tarefa encontrada. Crie a primeira tarefa para começar.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tarefas do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{task.name}</h4>
                          <Badge variant={getPriorityVariant(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                          <Badge variant="outline">
                            {task.progress}% completo
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(task.start_date), 'dd/MM/yyyy')} - {format(new Date(task.end_date), 'dd/MM/yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {task.estimated_hours || 0}h
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTaskStatus(task.id, 'in_progress');
                          }}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Em Andamento
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTaskStatus(task.id, 'blocked');
                          }}
                          className="flex items-center gap-1"
                        >
                          <Pause className="h-3 w-3" />
                          Bloqueada
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTaskStatus(task.id, 'completed');
                          }}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Concluída
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg mb-2">Nenhuma tarefa encontrada</p>
                  <p className="text-sm">
                    {!selectedProjectId 
                      ? 'Selecione um projeto para ver as tarefas'
                      : 'Crie a primeira tarefa para começar'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membros da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">Gerenciamento de Equipe</p>
                <p className="text-sm">
                  Funcionalidade em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedTaskId && (
        <GanttTaskModal
          task={tasks.find(t => t.id === selectedTaskId) || null}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default GanttAdmin;
