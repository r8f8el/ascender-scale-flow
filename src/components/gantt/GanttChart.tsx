import React, { useState, useMemo } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useGanttTasks, GanttTask } from '@/hooks/useGanttProjects';
import { useCollaborators } from '@/hooks/useCollaborators';
import { Calendar as CalendarIcon, Plus, BarChart3, List, Eye } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import 'gantt-task-react/dist/index.css';

interface GanttChartProps {
  projectId: string;
}

const priorityColors = {
  low: '#3B82F6',
  medium: '#F59E0B', 
  high: '#EF4444',
  urgent: '#DC2626'
};

export const GanttChart: React.FC<GanttChartProps> = ({ projectId }) => {
  const { tasks, loading, createTask, updateTask, deleteTask } = useGanttTasks(projectId);
  const { collaborators } = useCollaborators();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  
  const [taskForm, setTaskForm] = useState<{
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to: string;
    estimated_hours: string;
    is_milestone: boolean;
    dependencies: string[];
  }>({
    name: '',
    description: '',
    start_date: new Date(),
    end_date: addDays(new Date(), 7),
    priority: 'medium',
    assigned_to: '',
    estimated_hours: '',
    is_milestone: false,
    dependencies: []
  });

  const resetForm = () => {
    setTaskForm({
      name: '',
      description: '',
      start_date: new Date(),
      end_date: addDays(new Date(), 7),
      priority: 'medium',
      assigned_to: '',
      estimated_hours: '',
      is_milestone: false,
      dependencies: []
    });
    setEditingTask(null);
  };

  const ganttTasks: Task[] = useMemo(() => {
    return tasks.map((task) => ({
      start: parseISO(task.start_date),
      end: parseISO(task.end_date),
      name: task.name,
      id: task.id,
      progress: task.progress,
      type: task.is_milestone ? 'milestone' : 'task',
      dependencies: task.dependencies,
      styles: {
        backgroundColor: priorityColors[task.priority],
        backgroundSelectedColor: priorityColors[task.priority],
        progressColor: '#ffffff',
        progressSelectedColor: '#ffffff'
      }
    }));
  }, [tasks]);

  const handleCreateTask = () => {
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setEditingTask(task);
    setTaskForm({
      name: task.name,
      description: task.description || '',
      start_date: parseISO(task.start_date),
      end_date: parseISO(task.end_date),
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours?.toString() || '',
      is_milestone: task.is_milestone,
      dependencies: task.dependencies
    });
    setIsTaskDialogOpen(true);
  };

  const handleSubmitTask = async () => {
    if (!taskForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (taskForm.start_date >= taskForm.end_date) {
      toast.error('Data de fim deve ser posterior à data de início');
      return;
    }

    const taskData = {
      name: taskForm.name,
      description: taskForm.description,
      start_date: format(taskForm.start_date, 'yyyy-MM-dd'),
      end_date: format(taskForm.end_date, 'yyyy-MM-dd'),
      priority: taskForm.priority,
      assigned_to: taskForm.assigned_to || null,
      estimated_hours: taskForm.estimated_hours ? parseFloat(taskForm.estimated_hours) : null,
      is_milestone: taskForm.is_milestone,
      dependencies: taskForm.dependencies,
      project_id: projectId,
      progress: editingTask ? editingTask.progress : 0,
      actual_hours: editingTask ? editingTask.actual_hours : 0
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }

    setIsTaskDialogOpen(false);
    resetForm();
  };

  const handleDateChange = async (task: Task, children: Task[]) => {
    const ganttTask = tasks.find(t => t.id === task.id);
    if (!ganttTask) return;

    await updateTask(task.id, {
      start_date: format(task.start, 'yyyy-MM-dd'),
      end_date: format(task.end, 'yyyy-MM-dd')
    });
  };

  const handleProgressChange = async (task: Task, progress: number) => {
    await updateTask(task.id, { progress });
  };

  const handleTaskDelete = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cronograma do Projeto
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ViewMode.Hour}>Horas</SelectItem>
                  <SelectItem value={ViewMode.Day}>Dias</SelectItem>
                  <SelectItem value={ViewMode.Week}>Semanas</SelectItem>
                  <SelectItem value={ViewMode.Month}>Meses</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateTask}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ganttTasks.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie sua primeira tarefa para começar o cronograma
              </p>
              <Button onClick={handleCreateTask}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            </div>
          ) : (
            <div className="gantt-container" style={{ height: '400px', overflow: 'auto' }}>
              <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                onDateChange={handleDateChange}
                onProgressChange={handleProgressChange as any}
                onDoubleClick={(task) => handleEditTask(task.id)}
                onDelete={(task) => handleTaskDelete(task.id)}
                listCellWidth="200px"
                columnWidth={viewMode === ViewMode.Month ? 300 : 100}
                locale="pt-BR"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <List className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.progress === 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.progress > 0 && t.progress < 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marcos</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.is_milestone).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Tarefa *</label>
              <Input
                value={taskForm.name}
                onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da tarefa..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva a tarefa..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data de Início *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(taskForm.start_date, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={taskForm.start_date}
                      onSelect={(date) => date && setTaskForm(prev => ({ ...prev, start_date: date }))}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium">Data de Fim *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(taskForm.end_date, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={taskForm.end_date}
                      onSelect={(date) => date && setTaskForm(prev => ({ ...prev, end_date: date }))}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <Select
                  value={taskForm.assigned_to}
                  onValueChange={(value) => setTaskForm(prev => ({ ...prev, assigned_to: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {collaborators.map((collaborator) => (
                      <SelectItem key={collaborator.id} value={collaborator.id}>
                        {collaborator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Horas Estimadas</label>
                <Input
                  type="number"
                  value={taskForm.estimated_hours}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="is_milestone"
                  checked={taskForm.is_milestone}
                  onCheckedChange={(checked) => 
                    setTaskForm(prev => ({ ...prev, is_milestone: !!checked }))
                  }
                />
                <label htmlFor="is_milestone" className="text-sm font-medium">
                  Esta é uma etapa marco
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Cancelar
              </Button>
              {editingTask && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteTask(editingTask.id);
                    setIsTaskDialogOpen(false);
                    resetForm();
                  }}
                >
                  Excluir
                </Button>
              )}
              <Button onClick={handleSubmitTask}>
                {editingTask ? 'Atualizar' : 'Criar'} Tarefa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};