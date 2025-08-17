
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { GanttTask } from '@/hooks/useGanttTasks';
import { useCollaborators } from '@/hooks/useCollaborators';
import { TaskCommentsGantt } from './TaskComments';
import { TaskTimeLogsGantt } from './TaskTimeLogs';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Flag,
  Target,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: GanttTask | null;
  onSave: (taskData: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const GanttTaskModal: React.FC<GanttTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  isAdmin = false
}) => {
  const { collaborators } = useCollaborators();
  const isMobile = useResponsive();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date(),
    end_date: addDays(new Date(), 7),
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assigned_to: '',
    estimated_hours: '',
    is_milestone: false,
    dependencies: [] as string[],
    progress: 0
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        start_date: parseISO(task.start_date),
        end_date: parseISO(task.end_date),
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        assigned_to: task.assigned_to || '',
        estimated_hours: task.estimated_hours?.toString() || '',
        is_milestone: task.is_milestone,
        dependencies: task.dependencies || [],
        progress: task.progress
      });
    } else {
      setFormData({
        name: '',
        description: '',
        start_date: new Date(),
        end_date: addDays(new Date(), 7),
        priority: 'medium',
        assigned_to: '',
        estimated_hours: '',
        is_milestone: false,
        dependencies: [],
        progress: 0
      });
    }
  }, [task]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const taskData = {
        name: formData.name,
        description: formData.description,
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: format(formData.end_date, 'yyyy-MM-dd'),
        priority: formData.priority,
        assigned_to: formData.assigned_to || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        is_milestone: formData.is_milestone,
        dependencies: formData.dependencies,
        progress: formData.progress
      };

      await onSave(taskData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    await onDelete(task.id);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusIcon = () => {
    if (formData.progress === 0) return <PlayCircle className="h-4 w-4 text-gray-500" />;
    if (formData.progress === 100) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <PauseCircle className="h-4 w-4 text-yellow-500" />;
  };

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full h-[90vh] max-w-none m-4 p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <h2 className="font-semibold text-lg">
                  {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {task && isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Task Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome da Tarefa *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome da tarefa..."
                  className="text-base"
                />
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Progresso</label>
                  <Badge className={getPriorityColor(formData.priority)}>
                    {formData.progress}%
                  </Badge>
                </div>
                <Slider
                  value={[formData.progress]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, progress: value[0] }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <Progress value={formData.progress} className="mt-2" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Início</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.start_date, 'dd/MM', { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Fim</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.end_date, 'dd/MM', { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, end_date: date }))}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Priority and Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Prioridade</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🔵 Baixa</SelectItem>
                      <SelectItem value="medium">🟡 Média</SelectItem>
                      <SelectItem value="high">🟠 Alta</SelectItem>
                      <SelectItem value="urgent">🔴 Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Responsável</label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
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

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva a tarefa..."
                  rows={3}
                />
              </div>

              {/* Milestone Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_milestone_mobile"
                  checked={formData.is_milestone}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_milestone: !!checked }))
                  }
                />
                <label htmlFor="is_milestone_mobile" className="text-sm font-medium">
                  Esta é uma etapa marco
                </label>
              </div>

              {/* Task Tabs for Mobile */}
              {task && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="comments">Comentários</TabsTrigger>
                    <TabsTrigger value="time">Tempo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="comments" className="mt-4">
                    <TaskCommentsGantt taskId={task.id} />
                  </TabsContent>
                  <TabsContent value="time" className="mt-4">
                    <TaskTimeLogsGantt taskId={task.id} />
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {/* Mobile Footer Actions */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.name.trim() || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {task ? 'Atualizar' : 'Criar'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop version
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <DialogTitle className="text-xl">
                {task ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
              {formData.progress > 0 && (
                <Badge className={getPriorityColor(formData.priority)}>
                  {formData.progress}% concluído
                </Badge>
              )}
            </div>
            {task && isAdmin && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Left Column - Main Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nome da Tarefa *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da tarefa..."
                className="text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva a tarefa..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  Data de Início *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.start_date, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  Data de Fim *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.end_date, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, end_date: date }))}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  <Target className="inline h-4 w-4 mr-1" />
                  Progresso: {formData.progress}%
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  className="w-20 text-center"
                />
              </div>
              <Slider
                value={[formData.progress]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, progress: value[0] }))}
                max={100}
                step={5}
                className="w-full"
              />
              <Progress value={formData.progress} className="mt-2" />
            </div>
          </div>

          {/* Right Column - Additional Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <Flag className="inline h-4 w-4 mr-1" />
                  Prioridade
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Baixa
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Média
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Alta
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Urgente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <User className="inline h-4 w-4 mr-1" />
                  Responsável
                </label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Clock className="inline h-4 w-4 mr-1" />
                Horas Estimadas
              </label>
              <Input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_milestone"
                checked={formData.is_milestone}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_milestone: !!checked }))
                }
              />
              <label htmlFor="is_milestone" className="text-sm font-medium">
                <Target className="inline h-4 w-4 mr-1" />
                Esta é uma etapa marco
              </label>
            </div>

            {task && (
              <div className="pt-4">
                <Tabs defaultValue="comments">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="comments">Comentários</TabsTrigger>
                    <TabsTrigger value="time">Tempo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="comments" className="mt-4">
                    <TaskCommentsGantt taskId={task.id} />
                  </TabsContent>
                  <TabsContent value="time" className="mt-4">
                    <TaskTimeLogsGantt taskId={task.id} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {task ? 'Atualizar' : 'Criar'} Tarefa
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
