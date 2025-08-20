
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FPATaskTemplates } from './FPATaskTemplates';
import { useGanttTasks, GanttTask } from '@/hooks/useGanttTasks';
import { format, addDays } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: GanttTask | null;
  onSave: (taskData: any) => void;
  projectId: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  projectId
}) => {
  const { toast } = useToast();
  const { createTask, updateTask } = useGanttTasks(projectId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimated_hours: 8,
    progress: 0,
    is_milestone: false,
    assigned_to: '',
    dependencies: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('formulario');

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || format(new Date(), 'yyyy-MM-dd'),
        end_date: task.end_date || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        priority: task.priority || 'medium',
        estimated_hours: task.estimated_hours || 8,
        progress: task.progress || 0,
        is_milestone: task.is_milestone || false,
        assigned_to: task.assigned_to || '',
        dependencies: task.dependencies || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        priority: 'medium',
        estimated_hours: 8,
        progress: 0,
        is_milestone: false,
        assigned_to: '',
        dependencies: []
      });
    }
  }, [task, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template: { name: string; duration: number; description: string }) => {
    const endDate = addDays(new Date(formData.start_date), template.duration);
    
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      end_date: format(endDate, 'yyyy-MM-dd'),
      estimated_hours: template.duration * 8
    }));
    
    setActiveTab('formulario');
    
    toast({
      title: "Template aplicado!",
      description: `Template "${template.name}" foi aplicado à tarefa.`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Erro",
        description: "ID do projeto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        ...formData,
        project_id: projectId,
        estimated_hours: Number(formData.estimated_hours),
        progress: Number(formData.progress)
      };

      console.log('📝 Salvando tarefa:', taskData);

      let result;
      if (task) {
        // Atualizar tarefa existente
        result = await updateTask(task.id, taskData);
      } else {
        // Criar nova tarefa
        result = await createTask(taskData);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Sucesso!",
        description: task ? "Tarefa atualizada com sucesso" : "Tarefa criada com sucesso"
      });

      onSave(result.data);
      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${task ? 'atualizar' : 'criar'} tarefa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formulario" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Formulário
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates FP&A
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formulario" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Tarefa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite o nome da tarefa..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva a tarefa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress">Progresso (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_milestone"
                  checked={formData.is_milestone}
                  onCheckedChange={(checked) => handleInputChange('is_milestone', checked)}
                />
                <Label htmlFor="is_milestone">Esta é uma milestone</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : (task ? 'Atualizar' : 'Criar')} Tarefa
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <FPATaskTemplates
              onSelectTemplate={handleTemplateSelect}
              startDate={new Date(formData.start_date)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
