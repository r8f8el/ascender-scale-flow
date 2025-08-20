
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useKanbanData, KanbanTask, KanbanColumn } from '@/hooks/useKanbanBoards';
import { useCollaborators } from '@/hooks/useCollaborators';
import { Plus, Calendar as CalendarIcon, Clock, User, Flag, MoreVertical, Paperclip, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCommentsKanban } from '@/components/kanban/TaskComments';
import { TaskTimeLogsKanban } from '@/components/kanban/TaskTimeLogs';
import { TaskFileUpload } from '@/components/kanban/TaskFileUpload';

interface KanbanBoardProps {
  boardId: string;
}

const priorityColors = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-200'
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId }) => {
  const { columns, tasks, loading, createTask, updateTask, moveTask, deleteTask } = useKanbanData(boardId);
  const { collaborators } = useCollaborators();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to: string;
    due_date: Date | undefined;
    estimated_hours: string;
    attachments: any[];
  }>({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    due_date: undefined,
    estimated_hours: '',
    attachments: []
  });

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: '',
      due_date: undefined,
      estimated_hours: '',
      attachments: []
    });
    setEditingTask(null);
    setSelectedColumnId('');
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: KanbanTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      assigned_to: task.assigned_to || '',
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      estimated_hours: task.estimated_hours?.toString() || '',
      attachments: task.attachments || []
    });
    setIsTaskDialogOpen(true);
  };

  const handleSubmitTask = async () => {
    if (!taskForm.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    const taskData = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      assigned_to: taskForm.assigned_to || null,
      due_date: taskForm.due_date ? format(taskForm.due_date, 'yyyy-MM-dd') : null,
      estimated_hours: taskForm.estimated_hours ? parseFloat(taskForm.estimated_hours) : null,
      column_id: editingTask ? editingTask.column_id : selectedColumnId,
      board_id: boardId,
      task_order: editingTask ? editingTask.task_order : tasks.filter(t => t.column_id === selectedColumnId).length,
      actual_hours: editingTask ? editingTask.actual_hours : 0,
      labels: editingTask ? editingTask.labels : [],
      attachments: taskForm.attachments,
      checklist: editingTask ? editingTask.checklist : []
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }

    setIsTaskDialogOpen(false);
    resetForm();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    await moveTask(draggableId, destination.droppableId, destination.index);
  };

  const getTasksByColumn = (columnId: string) => {
    return tasks
      .filter(task => task.column_id === columnId)
      .sort((a, b) => a.task_order - b.task_order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card className="h-full flex flex-col rounded-2xl border-0 shadow-lg bg-gradient-to-b from-card to-card/80">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/30 to-background/50 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-lg"
                        style={{ backgroundColor: column.color }}
                      />
                      <span>{column.name}</span>
                      <Badge variant="secondary" className="ml-auto rounded-full px-2 py-1 text-xs">
                        {getTasksByColumn(column.id).length}
                      </Badge>
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCreateTask(column.id)}
                      className="p-2 h-8 w-8 rounded-xl hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {column.wip_limit && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1 w-fit">
                      Limite: {getTasksByColumn(column.id).length}/{column.wip_limit}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 p-4 pt-2">
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-32 transition-colors duration-200 rounded-xl p-2 ${
                          snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
                        }`}
                      >
                        {getTasksByColumn(column.id).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-pointer hover:shadow-lg transition-all duration-200 rounded-xl border-0 ${
                                  snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary/30 rotate-2' : 'shadow-md'
                                } bg-gradient-to-br from-background to-background/80`}
                                onClick={() => handleEditTask(task)}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-semibold text-sm leading-tight">
                                        {task.title}
                                      </h4>
                                      <Badge
                                        className={`text-xs rounded-full px-2 py-1 ${priorityColors[task.priority]}`}
                                      >
                                        <Flag className="w-3 h-3 mr-1" />
                                        {priorityLabels[task.priority]}
                                      </Badge>
                                    </div>
                                    
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 rounded-lg p-2">
                                        {task.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {task.due_date && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                                          </div>
                                        )}
                                        {task.estimated_hours && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">
                                            <Clock className="w-3 h-3" />
                                            {task.estimated_hours}h
                                          </div>
                                        )}
                                        {task.attachments && task.attachments.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">
                                            <Paperclip className="w-3 h-3" />
                                            {task.attachments.length}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {task.collaborators && (
                                        <Avatar className="h-7 w-7 ring-2 ring-background">
                                          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-primary/10">
                                            {task.collaborators.name
                                              .split(' ')
                                              .map(n => n[0])
                                              .join('')
                                              .toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              <Sparkles className="w-5 h-5 text-primary" />
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título da tarefa..."
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva a tarefa..."
                  rows={3}
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger className="rounded-xl">
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
                  <SelectTrigger className="rounded-xl">
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
                <label className="text-sm font-medium">Data de Entrega</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left rounded-xl">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {taskForm.due_date 
                        ? format(taskForm.due_date, 'dd/MM/yyyy', { locale: ptBR })
                        : 'Selecionar data'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={taskForm.due_date}
                      onSelect={(date) => setTaskForm(prev => ({ ...prev, due_date: date }))}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium">Horas Estimadas</label>
                <Input
                  type="number"
                  value={taskForm.estimated_hours}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="border rounded-xl p-4 bg-muted/30">
              <TaskFileUpload
                taskId={editingTask?.id || 'new'}
                attachments={taskForm.attachments}
                onAttachmentsUpdate={(attachments) => 
                  setTaskForm(prev => ({ ...prev, attachments }))
                }
              />
            </div>
            
            {editingTask && (
              <div className="pt-2">
                <Tabs defaultValue="comments">
                  <TabsList className="grid grid-cols-2 w-full sm:w-auto rounded-xl">
                    <TabsTrigger value="comments" className="rounded-lg">Comentários</TabsTrigger>
                    <TabsTrigger value="time" className="rounded-lg">Tempo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="comments">
                    <TaskCommentsKanban taskId={editingTask.id} />
                  </TabsContent>
                  <TabsContent value="time">
                    <TaskTimeLogsKanban taskId={editingTask.id} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="rounded-xl">
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
                  className="rounded-xl"
                >
                  Excluir
                </Button>
              )}
              <Button onClick={handleSubmitTask} className="rounded-xl">
                {editingTask ? 'Atualizar' : 'Criar'} Tarefa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
