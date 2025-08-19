import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus, MoreHorizontal, Edit, Trash2, Play, Pause, CheckCircle, Clock, Target, FileText, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import GanttChart from '@/components/gantt/GanttChart';
import { GanttProjectSelector } from '@/components/gantt/GanttProjectSelector';
import { GanttStats } from '@/components/gantt/GanttStats';
import { GanttExport } from '@/components/gantt/GanttExport';
import { GanttShare } from '@/components/gantt/GanttShare';
import { TaskModal } from '@/components/gantt/TaskModal';
import { useGanttTasks, GanttTask } from '@/hooks/useGanttTasks';
import { useGanttProjects, GanttProject } from '@/hooks/useGanttProjects';
import { FPATaskTemplates } from '@/components/gantt/FPATaskTemplates';
import { useCompanyTeamMembers } from '@/hooks/useTeamMembers';

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-green-500', icon: '🟢' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-500', icon: '🟡' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500', icon: '🟠' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-500', icon: '🔴' }
];

const GanttTaskCreator = ({ onCreateTask, loading = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    estimated_hours: 8,
    is_milestone: false,
    assigned_to: ''
  });

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 1));

  const { data: teamMembers = [], isLoading: loadingTeam } = useCompanyTeamMembers();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      estimated_hours: 8,
      is_milestone: false,
      assigned_to: ''
    });
    setStartDate(new Date());
    setEndDate(addDays(new Date(), 1));
    setActiveTab('templates');
  };

  const handleTemplateSelect = (template) => {
    console.log('Template selecionado:', template);
    
    const calculatedEndDate = addDays(startDate, template.duration);
    const estimatedHours = template.duration * 8;

    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      estimated_hours: estimatedHours
    }));
    
    setEndDate(calculatedEndDate);
    setActiveTab('manual');

    toast.success(`Template "${template.name}" aplicado com sucesso!`, {
      description: `Duração: ${template.duration} dia(s) • ${estimatedHours} horas`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da tarefa é obrigatório');
      return;
    }

    if (startDate >= endDate && !formData.is_milestone) {
      toast.error('Data de fim deve ser posterior à data de início');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(formData.is_milestone ? startDate : endDate, 'yyyy-MM-dd'),
        priority: formData.priority,
        estimated_hours: formData.estimated_hours,
        is_milestone: formData.is_milestone,
        assigned_to: formData.assigned_to || null,
        progress: 0,
        actual_hours: 0,
        dependencies: []
      };

      console.log('GanttTaskCreator: Submitting task data:', taskData);
      
      await onCreateTask(taskData);
      
      setIsOpen(false);
      resetForm();
      
    } catch (error) {
      console.error('GanttTaskCreator: Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPriority = priorityOptions.find(p => p.value === formData.priority);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2 bg-primary hover:bg-primary/90" 
          disabled={disabled || loading}
        >
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Criar Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates FP&A
            </TabsTrigger>
            <TabsTrigger value="responsavel" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Responsável
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            <FPATaskTemplates 
              onSelectTemplate={handleTemplateSelect}
              startDate={startDate}
            />
          </TabsContent>

          <TabsContent value="responsavel" className="mt-4">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 mx-auto text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">Selecionar Responsável</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha um membro da sua equipe para ser responsável pela tarefa
                </p>
              </div>

              {loadingTeam ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Carregando equipe...</span>
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all hover:border-primary",
                        formData.assigned_to === member.id 
                          ? "border-primary bg-primary/5" 
                          : "border-muted"
                      )}
                      onClick={() => {
                        setFormData({ ...formData, assigned_to: member.id });
                        setActiveTab('manual');
                        toast.success(`${member.name} selecionado como responsável`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {member.hierarchy_levels && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {member.hierarchy_levels.name}
                            </p>
                          )}
                        </div>
                        {formData.assigned_to === member.id && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg mb-2">Nenhum membro encontrado</p>
                  <p className="text-sm">
                    Entre em contato com o administrador para adicionar membros à equipe
                  </p>
                </div>
              )}

              {formData.assigned_to && (
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={() => setActiveTab('manual')}
                    className="gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Continuar para Detalhes
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formData.assigned_to && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">Responsável Selecionado</Label>
                  {(() => {
                    const selectedMember = teamMembers.find(m => m.id === formData.assigned_to);
                    return selectedMember ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {selectedMember.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm">{selectedMember.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, assigned_to: '' })}
                          className="ml-auto h-6 px-2 text-xs"
                        >
                          Remover
                        </Button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Nome da Tarefa *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Kick-off do projeto"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva os detalhes e objetivos da tarefa..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data de Início *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal transition-all duration-200",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) {
                            setStartDate(date);
                            if (date >= endDate) {
                              setEndDate(addDays(date, 1));
                            }
                          }
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data de Fim *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal transition-all duration-200",
                          !endDate && "text-muted-foreground"
                        )}
                        disabled={formData.is_milestone}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        disabled={(date) => date < startDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="transition-all duration-200">
                      <SelectValue>
                        {selectedPriority && (
                          <div className="flex items-center gap-2">
                            <span>{selectedPriority.icon}</span>
                            <span>{selectedPriority.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_hours" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horas Estimadas
                  </Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                    min="0.5"
                    step="0.5"
                    className="transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Switch
                  id="is_milestone"
                  checked={formData.is_milestone}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, is_milestone: checked });
                    if (checked) {
                      setEndDate(startDate);
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor="is_milestone" className="text-sm font-medium cursor-pointer">
                    Marco do Projeto
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Marcos representam pontos importantes sem duração (ex: reunião de kick-off)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.name.trim()}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Criando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Tarefa
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default function GanttAdmin() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    createTask, 
    updateTask, 
    deleteTask, 
    updateTaskProgress,
    fetchTasks 
  } = useGanttTasks(selectedProjectId);

  const { 
    projects, 
    loading: projectsLoading, 
    createProject 
  } = useGanttProjects();

  const handleCreateTask = async (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedProjectId) {
      toast.error('Selecione um projeto primeiro');
      return;
    }

    try {
      const fullTaskData = {
        ...taskData,
        project_id: selectedProjectId
      };

      const result = await createTask(fullTaskData);
      
      if (result.error) {
        console.error('Erro ao criar tarefa:', result.error);
        toast.error('Erro ao criar tarefa');
      } else {
        toast.success('Tarefa criada com sucesso!');
        await fetchTasks();
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const progressMap: Record<string, number> = {
        'pending': 0,
        'in_progress': 50,
        'completed': 100,
        'blocked': 25
      };

      const progress = progressMap[newStatus] || 0;

      const { error } = await updateTaskProgress(taskId, progress);
      
      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status da tarefa');
      } else {
        toast.success('Status da tarefa atualizado com sucesso!');
        await fetchTasks();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  const handleEditTask = (task: GanttTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteTask(taskId);
      if (result.error) {
        toast.error('Erro ao excluir tarefa');
      } else {
        toast.success('Tarefa excluída com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const handleTaskSave = async (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedTask) return;

    try {
      const result = await updateTask(selectedTask.id, taskData);
      if (result.error) {
        toast.error('Erro ao atualizar tarefa');
      } else {
        toast.success('Tarefa atualizada com sucesso!');
        setIsTaskModalOpen(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const projectName = projects.find(p => p.id === selectedProjectId)?.name || '';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cronogramas (Gantt)</h1>
            <p className="text-muted-foreground">
              Gerencie projetos e cronogramas com visualização Gantt
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedProjectId && (
              <>
                <GanttTaskCreator 
                  onCreateTask={handleCreateTask}
                  loading={tasksLoading}
                />
                <GanttExport 
                  tasks={tasks}
                  projectName={projectName}
                />
                <Button
                  variant="outline"
                  onClick={() => setIsShareDialogOpen(true)}
                  className="gap-2"
                >
                  Compartilhar
                </Button>
              </>
            )}
          </div>
        </div>

        <GanttProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          onProjectCreate={createProject}
          loading={projectsLoading}
        />

        {selectedProjectId && (
          <>
            <GanttStats tasks={tasks} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Cronograma do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Carregando tarefas...</span>
                  </div>
                ) : tasksError ? (
                  <div className="text-center py-8 text-red-600">
                    Erro ao carregar tarefas: {tasksError}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Nenhuma tarefa encontrada</p>
                    <p>Crie uma nova tarefa para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <GanttChart tasks={tasks} />
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold mb-4">Lista de Tarefas</h3>
                      {tasks.map((task) => (
                        <Card key={task.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium">{task.name}</h4>
                                <Badge 
                                  variant={
                                    task.priority === 'urgent' ? 'destructive' :
                                    task.priority === 'high' ? 'default' :
                                    task.priority === 'medium' ? 'secondary' : 'outline'
                                  }
                                >
                                  {task.priority === 'urgent' ? 'Urgente' :
                                   task.priority === 'high' ? 'Alta' :
                                   task.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                                <Badge variant="outline">
                                  {task.progress}% concluído
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>Início: {format(new Date(task.start_date), 'dd/MM/yyyy')}</span>
                                <span>Fim: {format(new Date(task.end_date), 'dd/MM/yyyy')}</span>
                                {task.assigned_to && <span>Responsável: {task.assigned_to}</span>}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                                  className="gap-1"
                                  title="Marcar como Pendente"
                                >
                                  <Clock className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                                  className="gap-1"
                                  title="Marcar como Em Progresso"
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                  className="gap-1"
                                  title="Marcar como Concluída"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'blocked')}
                                  className="gap-1"
                                  title="Marcar como Bloqueada"
                                >
                                  <Pause className="h-3 w-3" />
                                </Button>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleTaskSave}
        projectId={selectedProjectId}
      />

      <GanttShare
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        tasks={tasks}
        projectId={selectedProjectId}
        projectName={projectName}
      />
    </div>
  );
}
