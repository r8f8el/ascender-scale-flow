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
import { Calendar as CalendarIcon, Target, Clock, Users, AlertTriangle, TrendingUp, CheckCircle, FileText, BarChart3, Calculator } from 'lucide-react';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GanttTask } from '@/hooks/useGanttTasks';
import { toast } from 'sonner';

interface FPAGanttTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: GanttTask | null;
  onSave: (task: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete?: (taskId: string) => void;
  isAdmin: boolean;
  availableTasks?: GanttTask[];
}

// Templates específicos para consultoria FP&A
const FPA_TASK_TEMPLATES = [
  {
    category: 'Kick-off & Planejamento',
    tasks: [
      { name: 'Reunião de Kick-off', duration: 1, description: 'Alinhamento inicial com stakeholders' },
      { name: 'Definição de Escopo', duration: 2, description: 'Documentação detalhada do escopo do projeto' },
      { name: 'Cronograma Detalhado', duration: 1, description: 'Elaboração do cronograma final' }
    ]
  },
  {
    category: 'Entendimento do Negócio',
    tasks: [
      { name: 'Análise do Modelo de Negócio', duration: 3, description: 'Compreensão profunda do negócio' },
      { name: 'Mapeamento de Processos', duration: 5, description: 'Documentação dos processos financeiros' },
      { name: 'Identificação de KPIs', duration: 2, description: 'Definição dos principais indicadores' }
    ]
  },
  {
    category: 'Coleta e Análise de Dados',
    tasks: [
      { name: 'Coleta de Dados Financeiros', duration: 7, description: 'Extração de dados históricos' },
      { name: 'Validação de Dados', duration: 3, description: 'Verificação e limpeza dos dados' },
      { name: 'Análise de Tendências', duration: 4, description: 'Identificação de padrões e tendências' }
    ]
  },
  {
    category: 'Modelagem e Forecast',
    tasks: [
      { name: 'Construção do Modelo Base', duration: 8, description: 'Desenvolvimento do modelo financeiro' },
      { name: 'Cenários e Simulações', duration: 5, description: 'Criação de cenários otimista/pessimista/realista' },
      { name: 'Projeções de Receita', duration: 4, description: 'Modelagem detalhada de receitas' },
      { name: 'Projeções de Custos', duration: 4, description: 'Modelagem detalhada de custos' }
    ]
  },
  {
    category: 'Orçamento e Budget',
    tasks: [
      { name: 'Estruturação do Budget', duration: 6, description: 'Organização da estrutura orçamentária' },
      { name: 'Budget Operacional', duration: 5, description: 'Orçamento das operações' },
      { name: 'Budget de Investimentos', duration: 3, description: 'Planejamento de CAPEX' },
      { name: 'Validação com Gestores', duration: 3, description: 'Alinhamento com áreas responsáveis' }
    ]
  },
  {
    category: 'Entrega e Apresentação',
    tasks: [
      { name: 'Preparação da Apresentação', duration: 3, description: 'Criação de slides executivos' },
      { name: 'Apresentação para Diretoria', duration: 1, description: 'Apresentação dos resultados' },
      { name: 'Documentação Final', duration: 2, description: 'Entrega de documentação completa' },
      { name: 'Treinamento da Equipe', duration: 2, description: 'Capacitação da equipe interna' }
    ]
  }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
] as const;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Concluída', color: 'bg-green-100 text-green-800' },
  { value: 'blocked', label: 'Bloqueada', color: 'bg-red-100 text-red-800' }
] as const;

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

interface FormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string;
  estimated_hours: number;
  actual_hours: number;
  progress: number;
  is_milestone: boolean;
  dependencies: string[];
  category: string;
  tags: string[];
}

export const FPAGanttTaskModal: React.FC<FPAGanttTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  isAdmin,
  availableTasks = []
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    priority: 'medium' as TaskPriority,
    status: 'pending' as TaskStatus,
    assigned_to: '',
    estimated_hours: 40,
    actual_hours: 0,
    progress: 0,
    is_milestone: false,
    dependencies: [] as string[],
    category: '',
    tags: [] as string[]
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || format(new Date(), 'yyyy-MM-dd'),
        end_date: task.end_date || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        assigned_to: task.assigned_to || '',
        estimated_hours: task.estimated_hours || 40,
        actual_hours: task.actual_hours || 0,
        progress: task.progress || 0,
        is_milestone: task.is_milestone || false,
        dependencies: task.dependencies || [],
        category: task.category || '',
        tags: task.tags || []
      });
    } else {
      // Reset form for new task
      setFormData({
        name: '',
        description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        priority: 'medium',
        status: 'pending',
        assigned_to: '',
        estimated_hours: 40,
        actual_hours: 0,
        progress: 0,
        is_milestone: false,
        dependencies: [],
        category: '',
        tags: []
      });
    }
  }, [task, isOpen]);

  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      estimated_hours: template.duration * 8, // 8 horas por dia
      end_date: format(addDays(parseISO(prev.start_date), template.duration), 'yyyy-MM-dd')
    }));
    setSelectedTemplate('');
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da tarefa é obrigatório');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Datas de início e fim são obrigatórias');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('Data de início deve ser anterior à data de fim');
      return;
    }

    const taskData = {
      project_id: 'current-project', // This should be passed as prop
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      start_date: formData.start_date,
      end_date: formData.end_date,
      priority: formData.priority,
      status: formData.status,
      assigned_to: formData.assigned_to || null,
      estimated_hours: formData.estimated_hours,
      actual_hours: formData.actual_hours,
      progress: formData.progress,
      is_milestone: formData.is_milestone,
      dependencies: formData.dependencies,
      category: formData.category,
      tags: formData.tags
    };

    onSave(taskData);
    onClose();
    toast.success(task ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!');
  };

  const handleDelete = () => {
    if (task?.id && onDelete) {
      onDelete(task.id);
      onClose();
      toast.success('Tarefa excluída com sucesso!');
    }
  };

  const calculateDuration = () => {
    if (formData.start_date && formData.end_date) {
      const days = differenceInDays(parseISO(formData.end_date), parseISO(formData.start_date)) + 1;
      return days;
    }
    return 0;
  };

  const priorityOption = PRIORITY_OPTIONS.find(p => p.value === formData.priority);
  const statusOption = STATUS_OPTIONS.find(s => s.value === formData.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
            {formData.is_milestone && (
              <Badge variant="outline" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Marco
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="scheduling">Cronograma</TabsTrigger>
            <TabsTrigger value="dependencies">Dependências</TabsTrigger>
            <TabsTrigger value="templates">Templates FP&A</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Nome da Tarefa *</Label>
                <Input
                  id="task-name"
                  name="task-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Análise de Modelo de Negócio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="task-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {FPA_TASK_TEMPLATES.map((category) => (
                      <SelectItem key={category.category} value={category.category}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Descrição</Label>
              <Textarea
                id="task-description"
                name="task-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva os objetivos e deliverables desta tarefa..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-assigned">Responsável</Label>
                <Input
                  id="task-assigned"
                  name="task-assigned"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-milestone"
                checked={formData.is_milestone}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_milestone: checked }))}
              />
              <Label htmlFor="is-milestone" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Esta é uma entrega importante (Marco)
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(parseISO(formData.start_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date ? parseISO(formData.start_date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({ ...prev, start_date: format(date, 'yyyy-MM-dd') }));
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(parseISO(formData.end_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date ? parseISO(formData.end_date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({ ...prev, end_date: format(date, 'yyyy-MM-dd') }));
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duração (dias)</Label>
                <div className="p-2 bg-gray-50 rounded flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{calculateDuration()} dias</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-hours">Horas Estimadas</Label>
                <Input
                  id="estimated-hours"
                  name="estimated-hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual-hours">Horas Realizadas</Label>
                <Input
                  id="actual-hours"
                  name="actual-hours"
                  type="number"
                  value={formData.actual_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, actual_hours: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Progresso: {formData.progress}%</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{formData.progress}%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-4">
            <div className="space-y-2">
              <Label>Dependências (tarefas que devem ser concluídas antes)</Label>
              <p className="text-sm text-gray-600">
                Selecione as tarefas que devem ser finalizadas antes desta tarefa poder começar.
              </p>
              
              {availableTasks.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTasks
                    .filter(t => t.id !== task?.id) // Não mostrar a própria tarefa
                    .map((availableTask) => (
                      <div key={availableTask.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`dep-${availableTask.id}`}
                          checked={formData.dependencies.includes(availableTask.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                dependencies: [...prev.dependencies, availableTask.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                dependencies: prev.dependencies.filter(id => id !== availableTask.id)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={`dep-${availableTask.id}`} className="text-sm">
                          {availableTask.name}
                        </label>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Nenhuma tarefa disponível para dependência. Crie outras tarefas primeiro.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Templates de Consultoria FP&A</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione um template para preencher automaticamente os dados da tarefa baseado nas melhores práticas de consultoria FP&A.
                </p>
              </div>

              {FPA_TASK_TEMPLATES.map((category) => (
                <div key={category.category} className="space-y-2">
                  <h4 className="font-medium text-md flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 ml-6">
                    {category.tasks.map((template, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{template.name}</h5>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                          <Badge variant="outline">{template.duration} dia{template.duration > 1 ? 's' : ''}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <div>
            {task && isAdmin && onDelete && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Excluir Tarefa
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md">
              <h3 className="text-lg font-medium mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
