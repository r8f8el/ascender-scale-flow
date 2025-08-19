
import React, { useEffect, useState, useMemo } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import './gantt-custom.css';
import { GanttTask } from '@/hooks/useGanttTasks';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskSelect?: (task: GanttTask) => void;
  onTaskUpdate?: (task: GanttTask) => Promise<void>;
  viewMode?: ViewMode;
  height?: number;
}

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  onTaskSelect,
  onTaskUpdate,
  viewMode = ViewMode.Week,
  height = 600
}) => {
  const [ganttTasks, setGanttTasks] = useState<Task[]>([]);

  // Função para converter nossas tarefas para o formato do Gantt
  const convertToGanttTasks = (originalTasks: GanttTask[]): Task[] => {
    const convertedTasks: Task[] = [];
    
    // Agrupar tarefas por categoria
    const tasksByCategory = originalTasks.reduce((acc, task) => {
      const category = task.category || 'Outras';
      if (!acc[category]) acc[category] = [];
      acc[category].push(task);
      return acc;
    }, {} as Record<string, GanttTask[]>);

    // Criar fases (categorias) e tarefas
    Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
      // Adicionar fase como task pai
      const phaseStartDate = new Date(Math.min(...categoryTasks.map(t => new Date(t.start_date).getTime())));
      const phaseEndDate = new Date(Math.max(...categoryTasks.map(t => new Date(t.end_date).getTime())));
      
      convertedTasks.push({
        start: phaseStartDate,
        end: phaseEndDate,
        name: category,
        id: `phase-${category}`,
        type: 'project',
        progress: Math.round(categoryTasks.reduce((sum, t) => sum + t.progress, 0) / categoryTasks.length),
        isDisabled: true,
        styles: {
          backgroundColor: '#3B82F6',
          progressColor: '#1D4ED8',
          progressSelectedColor: '#1D4ED8',
          backgroundSelectedColor: '#2563EB'
        }
      });

      // Adicionar tarefas da categoria
      categoryTasks.forEach((task) => {
        const taskType = task.is_milestone ? 'milestone' : 'task';
        
        convertedTasks.push({
          start: new Date(task.start_date),
          end: new Date(task.end_date),
          name: task.name,
          id: task.id,
          type: taskType,
          progress: task.progress,
          project: `phase-${category}`,
          dependencies: task.dependencies || [],
          styles: {
            backgroundColor: getTaskColor(task),
            progressColor: getProgressColor(task),
            progressSelectedColor: getProgressColor(task),
            backgroundSelectedColor: getTaskColor(task)
          }
        });
      });
    });

    return convertedTasks;
  };

  const getTaskColor = (task: GanttTask): string => {
    if (task.is_milestone) return '#8B5CF6';
    
    switch (task.status || 'pending') {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'blocked': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getProgressColor = (task: GanttTask): string => {
    if (task.is_milestone) return '#7C3AED';
    
    switch (task.status || 'pending') {
      case 'completed': return '#059669';
      case 'in_progress': return '#2563EB';
      case 'blocked': return '#DC2626';
      default: return '#4B5563';
    }
  };

  // Converter tarefas quando mudarem
  useEffect(() => {
    const converted = convertToGanttTasks(tasks);
    setGanttTasks(converted);
  }, [tasks]);

  // Configurações do Gantt
  const ganttConfig = useMemo(() => ({
    columnWidth: viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 65 : 30,
    listCellWidth: '200px',
    rowHeight: 50,
    ganttHeight: height,
    barCornerRadius: 4,
    handleWidth: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
    rtl: false,
    locale: ptBR.code || 'pt-BR',
  }), [viewMode, height]);

  const handleTaskChange = async (task: Task) => {
    if (!onTaskUpdate) return;
    
    // Encontrar a tarefa original
    const originalTask = tasks.find(t => t.id === task.id);
    if (!originalTask) return;

    // Criar tarefa atualizada
    const updatedTask: GanttTask = {
      ...originalTask,
      start_date: format(task.start, 'yyyy-MM-dd'),
      end_date: format(task.end, 'yyyy-MM-dd'),
      progress: task.progress
    };

    try {
      await onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleProgressChange = async (task: Task) => {
    if (!onTaskUpdate) return;
    
    const originalTask = tasks.find(t => t.id === task.id);
    if (!originalTask) return;

    const updatedTask: GanttTask = {
      ...originalTask,
      progress: task.progress
    };

    try {
      await onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const handleDoubleClick = (task: Task) => {
    const originalTask = tasks.find(t => t.id === task.id);
    if (originalTask && onTaskSelect) {
      onTaskSelect(originalTask);
    }
  };

  // Função para renderizar tooltips customizados
  const TaskTooltip = ({ task, fontSize, fontFamily }: any) => {
    const originalTask = tasks.find(t => t.id === task.id);
    if (!originalTask) return null;

    return (
      <div className="gantt-tooltip">
        <div className="tooltip-header">
          <strong>{task.name}</strong>
          {originalTask.is_milestone && (
            <Badge variant="outline" className="ml-2">Marco</Badge>
          )}
        </div>
        <div className="tooltip-content">
          <div>Início: {format(task.start, 'dd/MM/yyyy')}</div>
          <div>Fim: {format(task.end, 'dd/MM/yyyy')}</div>
          <div>Progresso: {task.progress}%</div>
          {originalTask.assigned_to && (
            <div>Responsável: {originalTask.assigned_to}</div>
          )}
          {originalTask.description && (
            <div className="tooltip-description">{originalTask.description}</div>
          )}
        </div>
      </div>
    );
  };

  if (ganttTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium">Nenhuma tarefa encontrada</div>
          <div className="text-sm">Crie tarefas para visualizar o cronograma</div>
        </div>
      </div>
    );
  }

  return (
    <div className="gantt-container">
      <Gantt
        tasks={ganttTasks}
        viewMode={viewMode}
        onDateChange={handleTaskChange}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDoubleClick}
        columnWidth={ganttConfig.columnWidth}
        listCellWidth={ganttConfig.listCellWidth}
        rowHeight={ganttConfig.rowHeight}
        ganttHeight={ganttConfig.ganttHeight}
        barCornerRadius={ganttConfig.barCornerRadius}
        handleWidth={ganttConfig.handleWidth}
        fontFamily={ganttConfig.fontFamily}
        TooltipContent={TaskTooltip}
        locale={ganttConfig.locale}
      />
    </div>
  );
};

export default GanttChart;
