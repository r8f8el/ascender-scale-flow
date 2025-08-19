
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, Clock, Users, AlertTriangle, TrendingUp, CheckCircle, FileText, BarChart3, Calculator, ArrowLeft, UserPlus } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { GanttTask } from '@/hooks/useGanttTasks';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  projectId?: string;
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
  projectId
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
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  // Carregar usuários disponíveis (colaboradores Ascalate)
  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen]);

  const loadAvailableUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Buscar colaboradores da Ascalate
      const { data: collaborators, error: collaboratorsError } = await supabase
        .from('collaborators')
        .select('id, name, email, role')
        .eq('is_active', true);

      if (collaboratorsError) {
        console.error('Erro ao carregar colaboradores:', collaboratorsError);
      }

      // Combinar usuários
      const allUsers: User[] = (collaborators || []).map(c => ({ 
        ...c, 
        role: `Ascalate - ${c.role}` 
      }));

      setAvailableUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários disponíveis');
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
    } else {
      // Reset form when creating new task
      setFormData({
        name: '',
        description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        priority: 'medium',
        assigned_to: '',
        estimated_hours: 8,
        progress: 0,
        is_milestone: false,
        dependencies: [],
        category: '',
        tags: []
      });
    }
  }, [task]);

  const handleTemplateSelect = (template: any) => {
    const startDate = formData.start_date || format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addDays(parseISO(startDate), template.duration), 'yyyy-MM-dd');
    
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      estimated_hours: template.duration * 8, // 8 horas por dia
      end_date: endDate,
      category: template.category || 'FP&A'
    }));
    
    // Voltar para a aba do formulário
    setActiveTab('form');
    toast.success(`Template "${template.name}" aplicado com sucesso!`);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da tarefa é obrigatório');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Datas de início e fim são obrigatórias');
      return;
    }

    if (!projectId) {
      toast.error('ID do projeto é obrigatório');
      return;
    }

    const taskData = {
      project_id: projectId,
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      start_date: formData.start_date,
      end_date: formData.end_date,
      priority: formData.priority,
      assigned_to: formData.assigned_to || null,
      estimated_hours: formData.estimated_hours,
      progress: formData.progress,
      is_milestone: formData.is_milestone,
      dependencies: formData.dependencies
    };

    try {
      await onSave(taskData);
      onClose();
      toast.success(task ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error('Erro ao salvar tarefa. Tente novamente.');
    }
  };

  const handleBackToTemplates = () => {
    setActiveTab('templates');
    setFormData(prev => ({
      ...prev,
      name: '',
      description: '',
      estimated_hours: 8,
      category: ''
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Formulário
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Templates FP&A
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6 mt-6">
            {/* Botão de voltar aos templates se foi aplicado um template */}
            {formData.name && formData.description && (
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  onClick={handleBackToTemplates}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar aos Templates
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome da Tarefa *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome da tarefa"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva detalhadamente a tarefa"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Categoria
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: FP&A, Orçamento, Forecast"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="text-sm font-medium">
                      Data Início *
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date" className="text-sm font-medium">
                      Data Fim *
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Prioridade
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          Baixa
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          Média
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          Alta
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          Urgente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assigned_to" className="text-sm font-medium">
                    Responsável
                  </Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Nenhum
                        </div>
                      </SelectItem>
                      {isLoadingUsers ? (
                        <SelectItem value="" disabled>
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            Carregando...
                          </div>
                        </SelectItem>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-gray-500">{user.role}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimated_hours" className="text-sm font-medium">
                    Horas Estimadas
                  </Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    min="1"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_milestone"
                  checked={formData.is_milestone}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_milestone: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_milestone" className="text-sm font-medium">
                  Marcar como Milestone
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {task && onDelete && (
                <Button variant="destructive" onClick={() => onDelete(task.id)}>
                  Excluir
                </Button>
              )}
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {task ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                🎯 Templates de Consultoria FP&A
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Selecione um template para preencher automaticamente os dados da tarefa baseado nas melhores práticas de consultoria FP&A.
                Clique em qualquer template para aplicá-lo ao formulário.
              </p>
            </div>

            <div className="space-y-8">
              {FPA_TASK_TEMPLATES.map((category) => (
                <div key={category.category} className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    {category.category}
                  </h4>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {category.tasks.map((template) => (
                      <div
                        key={template.name}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {template.name}
                            </h5>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{template.duration} dia(s)</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Horas estimadas: {template.duration * 8}h</span>
                            <span className="text-blue-600 font-medium">Clique para aplicar</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
