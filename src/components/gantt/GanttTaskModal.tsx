
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Flag, 
  Target, 
  Trash2, 
  Save,
  X,
  Plus,
  MessageSquare,
  Timer
} from 'lucide-react';
import { format } from 'date-fns';
import { GanttTask } from '@/hooks/useGanttTasks';
import { cn } from '@/lib/utils';

interface GanttTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: GanttTask | null;
  onSave: (taskData: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  isAdmin?: boolean;
}

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-blue-500' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-500' }
];

export const GanttTaskModal: React.FC<GanttTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  isAdmin = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    progress: 0,
    priority: 'medium',
    estimated_hours: 0,
    is_milestone: false,
    assigned_to: ''
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        progress: task.progress || 0,
        priority: task.priority || 'medium',
        estimated_hours: task.estimated_hours || 0,
        is_milestone: task.is_milestone || false,
        assigned_to: task.assigned_to || ''
      });
      setStartDate(task.start_date ? new Date(task.start_date) : undefined);
      setEndDate(task.end_date ? new Date(task.end_date) : undefined);
    } else {
      // Reset form for new task
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        name: '',
        description: '',
        start_date: format(today, 'yyyy-MM-dd'),
        end_date: format(tomorrow, 'yyyy-MM-dd'),
        progress: 0,
        priority: 'medium',
        estimated_hours: 8,
        is_milestone: false,
        assigned_to: ''
      });
      setStartDate(today);
      setEndDate(tomorrow);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        ...formData,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : formData.start_date,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : formData.end_date,
      });
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const priorityOption = priorityOptions.find(p => p.value === formData.priority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentários
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Tempo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Tarefa */}
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome da Tarefa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome da tarefa"
                  className="mt-1"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva os detalhes da tarefa"
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Data de Início */}
              <div>
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data de Fim */}
              <div>
                <Label>Data de Fim *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Prioridade */}
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue>
                      {priorityOption && (
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${priorityOption.color}`}></div>
                          {priorityOption.label}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Horas Estimadas */}
              <div>
                <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                  className="mt-1"
                  min="0"
                  step="0.5"
                />
              </div>

              {/* Progresso */}
              <div className="md:col-span-2">
                <Label>Progresso: {formData.progress}%</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[formData.progress]}
                    onValueChange={([value]) => setFormData({ ...formData, progress: value })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0%</span>
                    <span className="font-medium">{formData.progress}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Marco */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_milestone"
                  checked={formData.is_milestone}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_milestone: checked })}
                />
                <Label htmlFor="is_milestone">É um marco do projeto</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Funcionalidade de comentários em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              <Timer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Registro de tempo em desenvolvimento</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div>
            {task && isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading || !formData.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
