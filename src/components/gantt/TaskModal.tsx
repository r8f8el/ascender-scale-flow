
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, Flag, FileText } from 'lucide-react';
import { GanttTask } from '@/hooks/useGanttTasks';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: GanttTask | null;
  onSave: (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  projectId: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  projectId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimated_hours: 0,
    progress: 0,
    is_milestone: false,
    assigned_to: '',
    project_id: projectId
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        priority: (task.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        estimated_hours: task.estimated_hours || 0,
        progress: task.progress || 0,
        is_milestone: task.is_milestone || false,
        assigned_to: task.assigned_to || '',
        project_id: projectId
      });
    } else {
      // Reset form for new task
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'medium',
        estimated_hours: 0,
        progress: 0,
        is_milestone: false,
        assigned_to: '',
        project_id: projectId
      });
    }
  }, [task, projectId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSave({
        ...formData,
        dependencies: [],
        status: formData.progress === 100 ? 'completed' : 
                formData.progress > 0 ? 'in_progress' : 'pending',
        actual_hours: 0,
        category: 'Task',
        tags: [],
        assignee: formData.assigned_to,
        collaborators: []
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome da Tarefa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Digite o nome da tarefa"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva a tarefa (opcional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="start_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Início *
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Fim *
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Prioridade
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
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
              <Label htmlFor="estimated_hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horas Estimadas
              </Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => handleChange('estimated_hours', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="progress">Progresso (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="assigned_to" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável
              </Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_milestone"
              checked={formData.is_milestone}
              onChange={(e) => handleChange('is_milestone', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_milestone">Esta tarefa é um marco</Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
