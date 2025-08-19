
import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import GanttChart from '@/components/gantt/GanttChart';
import { GanttHeader } from '@/components/gantt/GanttHeader';
import { GanttProjectSelector } from '@/components/gantt/GanttProjectSelector';
import { GanttStats } from '@/components/gantt/GanttStats';
import { GanttExport } from '@/components/gantt/GanttExport';
import { GanttShare } from '@/components/gantt/GanttShare';
import { GanttSyncIndicator } from '@/components/gantt/GanttSyncIndicator';
import { GanttTaskModal } from '@/components/gantt/GanttTaskModal';
import { useGanttProjects } from '@/hooks/useGanttProjects';
import { useGanttTasks, GanttTask } from '@/hooks/useGanttTasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calendar, Clock, Target, TrendingUp, Users, FileText, Settings, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GanttAdmin() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  const { projects, loading: projectsLoading, error: projectsError } = useGanttProjects();
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    refetch: refetchTasks
  } = useGanttTasks(selectedProjectId);

  // Selecionar primeiro projeto automaticamente
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const handleTaskSave = async (taskData: any) => {
    try {
      setSyncStatus('syncing');
      
      if (selectedTask) {
        // Atualizar tarefa existente
        const result = await updateTask(selectedTask.id, taskData);
        if (result.error) {
          throw result.error;
        }
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        // Criar nova tarefa
        const result = await createTask({
          ...taskData,
          project_id: selectedProjectId
        });
        if (result.error) {
          throw result.error;
        }
        toast.success('Tarefa criada com sucesso!');
      }
      
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      await refetchTasks();
      setSyncStatus('idle');
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error('Erro ao salvar tarefa');
      setSyncStatus('error');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      setSyncStatus('syncing');
      const result = await deleteTask(taskId);
      if (result.error) {
        throw result.error;
      }
      toast.success('Tarefa excluída com sucesso!');
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      await refetchTasks();
      setSyncStatus('idle');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
      setSyncStatus('error');
    }
  };

  const handleTaskEdit = (task: GanttTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Filtrar e processar tarefas com type safety
  const processedTasks = tasks.map(task => ({
    ...task,
    // Garantir que priority seja um dos valores válidos
    priority: (['low', 'medium', 'high', 'urgent'] as const).includes(task.priority as any) 
      ? task.priority 
      : 'medium' as const
  }));

  // Estatísticas das tarefas
  const taskStats = {
    total: processedTasks.length,
    completed: processedTasks.filter(t => t.progress === 100).length,
    inProgress: processedTasks.filter(t => t.progress > 0 && t.progress < 100).length,
    pending: processedTasks.filter(t => t.progress === 0).length,
    overdue: processedTasks.filter(t => {
      const endDate = new Date(t.end_date);
      const today = new Date();
      return endDate < today && t.progress < 100;
    }).length
  };

  if (projectsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Erro ao Carregar Projetos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">{projectsError}</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">
          <div className="p-6">
            {/* Cabeçalho da página */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    Cronogramas de Projeto (Gantt)
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gerencie cronogramas, tarefas e marcos dos projetos de consultoria
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <GanttSyncIndicator 
                    projectId={selectedProjectId} 
                    isAdmin={true}
                  />
                  <Button onClick={handleNewTask} disabled={!selectedProjectId}>
                    <Target className="h-4 w-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </div>
              </div>

              {/* Seletor de projeto */}
              <GanttProjectSelector 
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                loading={projectsLoading}
              />
            </div>

            {/* Conteúdo principal */}
            {selectedProjectId ? (
              <Tabs defaultValue="gantt" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="gantt">Cronograma Gantt</TabsTrigger>
                  <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                  <TabsTrigger value="export">Exportar & Compartilhar</TabsTrigger>
                  <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="gantt" className="space-y-6">
                  {/* Informações do projeto */}
                  {selectedProject && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                            <CardDescription className="text-base">
                              {selectedProject.description}
                            </CardDescription>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(selectedProject.start_date), 'dd/MM/yyyy', { locale: ptBR })} - 
                                {format(new Date(selectedProject.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                {selectedProject.progress}% concluído
                              </div>
                              <Badge 
                                variant={selectedProject.status === 'active' ? 'default' : 'secondary'}
                              >
                                {selectedProject.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {selectedProject.progress}%
                            </div>
                            <div className="text-sm text-gray-500">Progresso Geral</div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )}

                  {/* Gráfico Gantt */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Cronograma do Projeto</CardTitle>
                        <GanttHeader 
                          onRefresh={refetchTasks}
                          loading={tasksLoading}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {tasksError ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Erro ao carregar tarefas
                          </h3>
                          <p className="text-gray-600 mb-4">{tasksError}</p>
                          <Button onClick={refetchTasks}>
                            Tentar novamente
                          </Button>
                        </div>
                      ) : (
                        <GanttChart 
                          tasks={processedTasks}
                          onTaskEdit={handleTaskEdit}
                          onTaskCreate={handleNewTask}
                          loading={tasksLoading}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats">
                  <GanttStats tasks={processedTasks} />
                </TabsContent>

                <TabsContent value="export">
                  <GanttExport 
                    tasks={processedTasks}
                    projectName={selectedProject?.name || 'Projeto'}
                  />
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações do Gantt</CardTitle>
                      <CardDescription>
                        Configure as preferências de visualização e notificações
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Settings className="h-12 w-12 mx-auto mb-4" />
                        <p>Configurações em desenvolvimento</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Nenhum projeto selecionado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Selecione um projeto para visualizar o cronograma Gantt
                  </p>
                  {projects.length === 0 && !projectsLoading && (
                    <p className="text-sm text-gray-500">
                      Nenhum projeto encontrado. Crie um projeto primeiro.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Modal de tarefa */}
            <GanttTaskModal
              isOpen={isTaskModalOpen}
              onClose={() => {
                setIsTaskModalOpen(false);
                setSelectedTask(null);
              }}
              task={selectedTask}
              onSave={handleTaskSave}
              onDelete={handleTaskDelete}
              isAdmin={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
