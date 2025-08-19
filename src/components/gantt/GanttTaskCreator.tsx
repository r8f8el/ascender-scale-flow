
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, User, Clock, AlertTriangle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGanttTasks } from '@/hooks/useGanttTasks';
import { useAscalateCollaborators } from '@/hooks/useAscalateCollaborators';

interface GanttTaskCreatorProps {
  projectId: string;
  onTaskCreated?: () => void;
}

const taskTemplates = [
  {
    name: "Análise de Requisitos",
    description: "Levantamento e documentação de requisitos do projeto",
    estimatedHours: 16,
    priority: "high" as const
  },
  {
    name: "Desenvolvimento",
    description: "Implementação das funcionalidades do projeto",
    estimatedHours: 40,
    priority: "medium" as const
  },
  {
    name: "Testes",
    description: "Testes unitários e de integração",
    estimatedHours: 8,
    priority: "medium" as const
  },
  {
    name: "Revisão de Código",
    description: "Revisão e aprovação do código desenvolvido",
    estimatedHours: 4,
    priority: "high" as const
  },
  {
    name: "Deploy",
    description: "Deploy da aplicação em produção",
    estimatedHours: 2,
    priority: "high" as const
  }
];

export const GanttTaskCreator: React.FC<GanttTaskCreatorProps> = ({ projectId, onTaskCreated }) => {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 1));

  const { collaborators, isLoading: loadingCollaborators } = useAscalateCollaborators();
  const { createTask, isCreating } = useGanttTasks();

  const applyTemplate = (template: typeof taskTemplates[0]) => {
    setTaskName(template.name);
    setDescription(template.description);
    setEstimatedHours(template.estimatedHours);
    setPriority(template.priority);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName.trim()) return;

    const success = await createTask({
      name: taskName,
      description: description || undefined,
      project_id: projectId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      assigned_to: assignedTo || undefined,
      priority,
      estimated_hours: estimatedHours ? Number(estimatedHours) : undefined,
    });

    if (success) {
      // Reset form
      setTaskName('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setEstimatedHours('');
      setStartDate(new Date());
      setEndDate(addDays(new Date(), 1));
      setOpen(false);
      onTaskCreated?.();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Templates */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Templates de Tarefa</Label>
            <div className="grid grid-cols-1 gap-2">
              {taskTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="justify-start h-auto p-3"
                >
                  <div className="flex items-start gap-2 w-full">
                    {getPriorityIcon(template.priority)}
                    <div className="text-left flex-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description} • {template.estimatedHours}h
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da Tarefa */}
            <div className="space-y-2">
              <Label htmlFor="taskName">Nome da Tarefa *</Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Digite o nome da tarefa"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da tarefa"
                rows={3}
              />
            </div>

            {/* Grid com campos menores */}
            <div className="grid grid-cols-2 gap-4">
              {/* Responsável */}
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCollaborators ? (
                      <SelectItem value="" disabled>Carregando...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="">Sem responsável</SelectItem>
                        {collaborators.map((collaborator) => (
                          <SelectItem key={collaborator.id} value={collaborator.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {collaborator.name}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        Baixa
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Média
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Alta
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Horas estimadas */}
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Horas Estimadas</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 8"
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
