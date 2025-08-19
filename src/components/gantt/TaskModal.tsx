
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, Clock, Users, AlertTriangle, TrendingUp, CheckCircle, FileText, BarChart3, Calculator } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { GanttTask } from '@/hooks/useGanttTasks';
import { toast } from 'sonner';

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

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

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

  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      estimated_hours: template.duration * 8, // 8 horas por dia
      end_date: format(addDays(parseISO(prev.start_date || new Date().toISOString().split('T')[0]), template.duration), 'yyyy-MM-dd')
    }));
    setSelectedTemplate('');
  };

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Formulário</TabsTrigger>
            <TabsTrigger value="templates">Templates FP&A</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium mb-2">Templates de Consultoria FP&A</h3>
              <p className="text-sm text-gray-600">
                Selecione um template para preencher automaticamente os dados da tarefa baseado nas melhores práticas de consultoria FP&A.
              </p>
            </div>

            {FPA_TASK_TEMPLATES.map((category) => (
              <div key={category.category} className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {category.category}
                </h4>
                <div className="grid gap-2">
                  {category.tasks.map((template) => (
                    <div
                      key={template.name}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{template.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{template.duration} dia(s)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
