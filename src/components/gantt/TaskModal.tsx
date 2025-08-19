
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GanttTask } from '@/hooks/useGanttTasks';
import { toast } from 'sonner';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: GanttTask | null;
  onSave: (task: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete?: (taskId: string) => void;
}

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface FormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: TaskPriority;
  assigned_to: string;
  estimated_hours: number;
  progress: number;
  is_milestone: boolean;
  dependencies: string[];
  category: string;
  tags: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium' as TaskPriority,
    assigned_to: '',
    estimated_hours: 8,
    progress: 0,
    is_milestone: false,
    dependencies: [] as string[],
    category: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to || '',
        estimated_hours: task.estimated_hours || 8,
        progress: task.progress || 0,
        is_milestone: task.is_milestone || false,
        dependencies: task.dependencies || [],
        category: task.category || '',
        tags: task.tags || []
      });
    }
  }, [task]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da tarefa é obrigatório');
      return;
    }

    const taskData = {
      project_id: 'current-project',
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      start_date: formData.start_date,
      end_date: formData.end_date,
      priority: formData.priority,
      assigned_to: formData.assigned_to || null,
      estimated_hours: formData.estimated_hours,
      progress: formData.progress,
      is_milestone: formData.is_milestone,
      dependencies: formData.dependencies,
      category: formData.category,
      tags: formData.tags
    };

    onSave(taskData);
    onClose();
    toast.success(task ? 'Tarefa atualizada!' : 'Tarefa criada!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Data Fim</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {task ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
