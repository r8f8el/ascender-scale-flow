
import React, { useState, useMemo, useCallback } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGanttTasks, GanttTask } from '@/hooks/useGanttTasks';
import { GanttHeader } from './GanttHeader';
import { GanttStats } from './GanttStats';
import { GanttTaskModal } from './GanttTaskModal';
import { GanttTaskCreator } from './GanttTaskCreator';
import { useResponsive } from '@/hooks/useResponsive';
import { BarChart3, Lightbulb } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import 'gantt-task-react/dist/index.css';

interface GanttChartProps {
  projectId: string;
  isAdmin?: boolean;
}

const priorityColors = {
  low: '#10B981',     // Verde
  medium: '#F59E0B',  // Amarelo
  high: '#EF4444',    // Vermelho
  urgent: '#DC2626'   // Vermelho escuro
};

export const GanttChart: React.FC<GanttChartProps> = ({ 
  projectId, 
  isAdmin = true 
}) => {
  const { tasks, loading, creating, createTask, updateTask, deleteTask, refetch } = useGanttTasks(projectId);
  const isMobile = useResponsive();
  
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? ViewMode.Week : ViewMode.Day);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all'
  });

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || 
                           (filters.status === 'completed' && task.progress === 100) ||
                           (filters.status === 'active' && task.progress > 0 && task.progress < 100) ||
                           (filters.status === 'planning' && task.progress === 0);
      
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      
      const matchesAssignee = filters.assignee === 'all' || task.assigned_to === filters.assignee;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, filters]);

  const ganttTasks: Task[] = useMemo(() => {
    return filteredTasks.map((task, index) => ({
      start: parseISO(task.start_date),
      end: parseISO(task.end_date),
      name: task.name,
      id: task.id,
      progress: task.progress,
      type: task.is_milestone ? 'milestone' : 'task',
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      styles: {
        backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium,
        backgroundSelectedColor: priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium,
        progressColor: '#ffffff',
        progressSelectedColor: '#ffffff',
        ...(isMobile && {
          fontSize: '12px',
          height: 35
        })
      },
      displayOrder: index
    }));
  }, [filteredTasks, isMobile]);

  const handleCreateTask = useCallback(async (taskData: any) => {
    try {
      console.log('GanttChart: Creating task with data:', taskData);
      await createTask(taskData);
    } catch (error) {
      console.error('GanttChart: Error creating task:', error);
    }
  }, [createTask]);

  const handleEditTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  }, [tasks]);

  const handleSaveTask = useCallback(async (taskData: any) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        await handleCreateTask(taskData);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Erro ao salvar tarefa');
    }
  }, [selectedTask, updateTask, handleCreateTask]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [deleteTask]);

  const handleDateChange = useCallback(async (task: Task) => {
    if (!isAdmin) return;
    
    try {
      await updateTask(task.id, {
        start_date: format(task.start, 'yyyy-MM-dd'),
        end_date: format(task.end, 'yyyy-MM-dd')
      });
      toast.success('Datas atualizadas!');
    } catch (error) {
      console.error('Error updating dates:', error);
      toast.error('Erro ao atualizar datas');
    }
  }, [updateTask, isAdmin]);

  const handleProgressChange = useCallback(async (task: Task) => {
    if (!isAdmin) return;

    const progress = task.progress;
    
    try {
      await updateTask(task.id, { progress });
      toast.success(`Progresso atualizado para ${progress}%`);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Erro ao atualizar progresso');
    }
  }, [updateTask, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="max-w-md mx-auto">
            <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Selecione um projeto
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Escolha um projeto para visualizar e gerenciar o cronograma
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="max-w-md mx-auto">
            <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {isAdmin 
                ? 'Comece criando sua primeira tarefa para montar o cronograma do projeto' 
                : 'Aguarde as tarefas serem criadas pela equipe'
              }
            </p>
            
            {isAdmin && (
              <div className="space-y-4">
                <GanttTaskCreator 
                  onCreateTask={handleCreateTask} 
                  loading={creating}
                  disabled={!projectId}
                />
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h4 className="text-sm font-medium text-blue-900">
                        Dicas para começar
                      </h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Crie marcos importantes como "Kick-off" e "Entrega Final"</li>
                        <li>• Defina fases como "Coleta de Dados" e "Análise"</li>
                        <li>• Use prioridades para destacar tarefas críticas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header fixo */}
      <div className="flex-shrink-0">
        <GanttHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateTask={() => setIsTaskModalOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          isAdmin={isAdmin}
          taskCount={filteredTasks.length}
          completedCount={filteredTasks.filter(t => t.progress === 100).length}
          onRefresh={refetch}
          customCreateButton={
            <GanttTaskCreator 
              onCreateTask={handleCreateTask} 
              loading={creating}
              disabled={!projectId}
            />
          }
        />
      </div>

      {/* Statistics */}
      <div className="flex-shrink-0 px-6 py-4">
        <GanttStats tasks={filteredTasks} isAdmin={isAdmin} />
      </div>

      {/* Gantt Chart - Ocupa todo o espaço restante */}
      <div className="flex-1 px-6 pb-6">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            {ganttTasks.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros para ver mais tarefas
                </p>
              </div>
            ) : (
              <div 
                className="gantt-container w-full" 
                style={{ 
                  height: isMobile ? '400px' : 'calc(100vh - 320px)', 
                  minHeight: '400px',
                  overflow: 'auto',
                  backgroundColor: '#fafafa'
                }}
              >
                <Gantt
                  tasks={ganttTasks}
                  viewMode={viewMode}
                  onDateChange={handleDateChange}
                  onProgressChange={handleProgressChange}
                  onDoubleClick={(task) => isAdmin && handleEditTask(task.id)}
                  onDelete={(task) => isAdmin && handleDeleteTask(task.id)}
                  listCellWidth={isMobile ? "150px" : "280px"}
                  columnWidth={
                    viewMode === ViewMode.Month ? 350 :
                    viewMode === ViewMode.Week ? (isMobile ? 100 : 180) :
                    viewMode === ViewMode.Day ? (isMobile ? 60 : 120) : 80
                  }
                  rowHeight={isMobile ? 40 : 55}
                  barCornerRadius={6}
                  handleWidth={10}
                  fontSize="13px"
                  arrowColor="#6B7280"
                  arrowIndent={20}
                  todayColor="rgba(59, 130, 246, 0.3)"
                  TooltipContent={({ task }) => {
                    const taskData = tasks.find(t => t.id === task.id);
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs z-50">
                        <h4 className="font-semibold text-sm mb-2">{task.name}</h4>
                        {taskData && (
                          <div className="space-y-1 text-xs text-gray-600">
                            <div>Progresso: {task.progress}%</div>
                            <div>Prioridade: {taskData.priority}</div>
                            <div>Início: {format(task.start, 'dd/MM/yyyy')}</div>
                            <div>Fim: {format(task.end, 'dd/MM/yyyy')}</div>
                            {taskData.assigned_to && (
                              <div>Responsável: {taskData.collaborators?.name || 'N/A'}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }}
                  locale="pt-BR"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Modal */}
      <GanttTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        isAdmin={isAdmin}
      />
    </div>
  );
};
