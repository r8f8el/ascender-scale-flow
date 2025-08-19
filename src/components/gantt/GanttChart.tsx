
import React, { useState, useMemo, useCallback } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGanttTasks, GanttTask } from '@/hooks/useGanttTasks';
import { GanttHeader } from './GanttHeader';
import { GanttStats } from './GanttStats';
import { FPAGanttTaskModal } from './FPAGanttTaskModal';
import { GanttSyncIndicator } from './GanttSyncIndicator';
import { useResponsive } from '@/hooks/useResponsive';
import { BarChart3, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import 'gantt-task-react/dist/index.css';

interface GanttChartProps {
  projectId: string;
  isAdmin?: boolean;
}

const priorityColors = {
  low: '#3B82F6',
  medium: '#F59E0B', 
  high: '#EF4444',
  urgent: '#DC2626'
};

export const GanttChart: React.FC<GanttChartProps> = ({ 
  projectId, 
  isAdmin = false 
}) => {
  const { tasks, loading, createTask, updateTask, deleteTask, refetch } = useGanttTasks(projectId);
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
        backgroundColor: priorityColors[task.priority] || priorityColors.medium,
        backgroundSelectedColor: priorityColors[task.priority] || priorityColors.medium,
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

  const handleCreateTask = useCallback(() => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  }, []);

  const handleEditTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  }, [tasks]);

  // Handle task drag and drop for date changes
  const handleTaskChange = useCallback((task: Task) => {
    if (!isAdmin) return;
    
    const originalTask = tasks.find(t => t.id === task.id);
    if (!originalTask) return;

    const updatedTask = {
      ...originalTask,
      start_date: format(task.start, 'yyyy-MM-dd'),
      end_date: format(task.end, 'yyyy-MM-dd'),
      progress: task.progress
    };

    updateTask(task.id, updatedTask);
    toast.success('Tarefa atualizada com sucesso!');
  }, [isAdmin, tasks, updateTask]);



  // Handle task double click for quick edit
  const handleTaskDoubleClick = useCallback((task: Task) => {
    if (isAdmin) {
      handleEditTask(task.id);
    }
  }, [isAdmin, handleEditTask]);

  const handleSaveTask = useCallback(async (taskData: any) => {
    try {
      const fullTaskData = {
        ...taskData,
        project_id: projectId,
        actual_hours: selectedTask ? selectedTask.actual_hours : 0
      };

      if (selectedTask) {
        await updateTask(selectedTask.id, fullTaskData);
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        await createTask(fullTaskData);
        toast.success('Tarefa criada com sucesso!');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Erro ao salvar tarefa');
    }
  }, [selectedTask, createTask, updateTask, projectId]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa');
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

  if (tasks.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhuma tarefa encontrada
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isAdmin ? 'Crie sua primeira tarefa para começar o cronograma' : 'Aguarde as tarefas serem criadas'}
          </p>
          {isAdmin && (
            <div className="space-y-4">
              <Button 
                onClick={handleCreateTask}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
              

            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header fixo */}
      <div className="flex-shrink-0 space-y-4">
        <GanttHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateTask={handleCreateTask}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          isAdmin={isAdmin}
          taskCount={filteredTasks.length}
          completedCount={filteredTasks.filter(t => t.progress === 100).length}
          onRefresh={refetch}
        />
        
        {/* Indicador de Sincronização */}
        <div className="px-6">
          <GanttSyncIndicator projectId={projectId} isAdmin={isAdmin} />
        </div>
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
                  onDateChange={isAdmin ? handleTaskChange : undefined}
                  onProgressChange={isAdmin ? handleProgressChange : undefined}
                  onDoubleClick={handleTaskDoubleClick}
                  onDelete={isAdmin ? (task) => handleDeleteTask(task.id) : undefined}
                  listCellWidth={isMobile ? "150px" : "280px"}
                  columnWidth={
                    viewMode === ViewMode.Month ? 350 :
                    viewMode === ViewMode.Week ? (isMobile ? 100 : 180) :
                    viewMode === ViewMode.Day ? (isMobile ? 60 : 120) : 80
                  }
                  rowHeight={isMobile ? 40 : 55}
                  barCornerRadius={6}
                  handleWidth={10}
                  arrowColor="#6B7280"
                  arrowIndent={20}
                  timeStep={60000}
                  fontSize="13px"
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
      <FPAGanttTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        isAdmin={isAdmin}
        availableTasks={tasks}
      />


    </div>
  );
};
