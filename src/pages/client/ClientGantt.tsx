
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Filter, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Share2,
  Settings,
  RefreshCw,
  List
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { TaskModal } from '@/components/gantt/TaskModal';
import { GanttExport } from '@/components/gantt/GanttExport';
import { GanttShare } from '@/components/gantt/GanttShare';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { GanttTask } from '@/hooks/useGanttTasks';

export default function ClientGantt() {
  const { user, client } = useAuth();
  const { toast } = useToast();
  
  // Estados dos modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  
  // Estados de controle
  const [selectedProjectId, setSelectedProjectId] = useState('123e4567-e89b-12d3-a456-426614174000'); // UUID válido temporário
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Dados de exemplo para teste (fallback)
  const [projects] = useState([
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Projeto de Consultoria Financeira',
      progress: 65,
      status: 'active',
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Implementação de Sistema FP&A',
      progress: 30,
      status: 'active',
      start_date: '2024-03-01',
      end_date: '2024-08-31'
    }
  ]);

  const [tasks, setTasks] = useState<GanttTask[]>([
    {
      id: '223e4567-e89b-12d3-a456-426614174000',
      name: 'Análise de Forças',
      description: 'Identificar e analisar as forças internas da empresa',
      start_date: '2024-06-05',
      end_date: '2024-06-08',
      progress: 100,
      status: 'completed',
      priority: 'medium',
      assigned_to: 'Rafael',
      dependencies: [],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 8,
      actual_hours: 8,
      category: 'Analysis',
      tags: ['swot'],
      assignee: 'Rafael'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Análise de Fraquezas',
      description: 'Identificar e analisar as fraquezas internas da empresa',
      start_date: '2024-06-05',
      end_date: '2024-06-08',
      progress: 100,
      status: 'completed',
      priority: 'medium',
      assigned_to: 'Rafael',
      dependencies: [],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 8,
      actual_hours: 8,
      category: 'Analysis',
      tags: ['swot'],
      assignee: 'Rafael'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174002',
      name: 'Análise de Oportunidades',
      description: 'Identificar e analisar as oportunidades externas',
      start_date: '2024-06-08',
      end_date: '2024-06-11',
      progress: 75,
      status: 'in_progress',
      priority: 'medium',
      assigned_to: 'Rafael',
      dependencies: ['223e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 8,
      actual_hours: 6,
      category: 'Analysis',
      tags: ['swot'],
      assignee: 'Rafael'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174003',
      name: 'Análise de Ameaças',
      description: 'Identificar e analisar as ameaças externas',
      start_date: '2024-06-08',
      end_date: '2024-06-11',
      progress: 60,
      status: 'in_progress',
      priority: 'medium',
      assigned_to: 'Rafael',
      dependencies: ['223e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 8,
      actual_hours: 5,
      category: 'Analysis',
      tags: ['swot'],
      assignee: 'Rafael'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174004',
      name: 'Compilação da Matriz SWOT',
      description: 'Criar a matriz SWOT consolidada',
      start_date: '2024-06-11',
      end_date: '2024-06-12',
      progress: 0,
      status: 'pending',
      priority: 'high',
      assigned_to: 'Paula',
      dependencies: ['223e4567-e89b-12d3-a456-426614174002', '223e4567-e89b-12d3-a456-426614174003'],
      is_milestone: true,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 4,
      actual_hours: 0,
      category: 'Deliverable',
      tags: ['swot', 'milestone'],
      assignee: 'Paula'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174005',
      name: 'Criação de Planos de Ação',
      description: 'Desenvolver planos de ação baseados na análise SWOT',
      start_date: '2024-06-12',
      end_date: '2024-06-16',
      progress: 0,
      status: 'pending',
      priority: 'high',
      assigned_to: 'Rafael e Paula',
      dependencies: ['223e4567-e89b-12d3-a456-426614174004'],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 16,
      actual_hours: 0,
      category: 'Planning',
      tags: ['action-plan'],
      assignee: 'Rafael e Paula'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174006',
      name: 'Apresentação para o cliente',
      description: 'Apresentar resultados e planos para o cliente',
      start_date: '2024-06-16',
      end_date: '2024-06-19',
      progress: 0,
      status: 'pending',
      priority: 'high',
      assigned_to: 'Rafael e Paula',
      dependencies: ['223e4567-e89b-12d3-a456-426614174005'],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 8,
      actual_hours: 0,
      category: 'Presentation',
      tags: ['client', 'final'],
      assignee: 'Rafael e Paula'
    }
  ]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'blocked': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // Helper function to check if a task is overdue
  const isTaskOverdue = (task: GanttTask) => {
    const today = new Date();
    const endDate = new Date(task.end_date);
    return endDate < today && task.status !== 'completed';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || (task.assignee && task.assignee.includes(assigneeFilter));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getProjectStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => isTaskOverdue(t)).length;

    return { total, completed, inProgress, blocked, notStarted: pending, overdue };
  };

  const stats = getProjectStats();

  const handleCreateTask = () => {
    if (!selectedProjectId) {
      toast({
        title: "Erro",
        description: "Selecione um projeto primeiro",
        variant: "destructive"
      });
      return;
    }
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: GanttTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      // Simular exclusão
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      toast({
        title: "Sucesso!",
        description: "Tarefa excluída com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefa",
        variant: "destructive"
      });
    }
  };

  const handleTaskSaved = (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => {
    // Simular salvamento
    if (selectedTask) {
      // Atualizar tarefa existente
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id 
          ? { ...t, ...taskData, updated_at: new Date().toISOString() }
          : t
      ));
    } else {
      // Criar nova tarefa
      const newTask: GanttTask = {
        ...taskData,
        id: `task-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_id: selectedProjectId
      };
      setTasks(prev => [...prev, newTask]);
    }
    
    toast({
      title: "Sucesso!",
      description: selectedTask ? "Tarefa atualizada com sucesso" : "Tarefa criada com sucesso"
    });
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const getCurrentProject = () => {
    return projects.find(p => p.id === selectedProjectId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Cronogramas de Projetos
        </h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie cronogramas, dependências e marcos dos projetos
        </p>
      </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button size="sm" onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Seleção de Projeto */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div>
              <Label className="text-sm font-medium">Projeto Ativo</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {getCurrentProject() && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">Progresso:</span> {getCurrentProject()?.progress || 0}%
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span> {getCurrentProject()?.status}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Período:</span> {new Date(getCurrentProject()?.start_date || '').toLocaleDateString('pt-BR')} - {new Date(getCurrentProject()?.end_date || '').toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Projeto */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Tarefas</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Concluídas</p>
                <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Em Progresso</p>
                <p className="text-2xl font-bold text-blue-800">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Atrasadas</p>
                <p className="text-2xl font-bold text-red-800">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Não Iniciadas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.notStarted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
          <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Não Iniciadas</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="blocked">Bloqueadas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Rafael">Rafael</SelectItem>
                  <SelectItem value="Paula">Paula</SelectItem>
                </SelectContent>
              </Select>
                    </div>
              </div>
            </CardContent>
          </Card>

      {/* Visualização Gantt */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Cronograma do Projeto
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Visualize o progresso e dependências das tarefas
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Dia
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Mês
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Gráfico Gantt Simulado */}
          <div className="space-y-4">
            {/* Cabeçalho da Timeline */}
            <div className="flex items-center border-b pb-2">
              <div className="w-64 font-medium text-sm text-gray-600">Nome da Tarefa</div>
              <div className="flex-1 grid grid-cols-7 gap-1 text-xs text-gray-500">
                <div className="text-center">05/06</div>
                <div className="text-center">08/06</div>
                <div className="text-center">11/06</div>
                <div className="text-center">12/06</div>
                <div className="text-center">16/06</div>
                <div className="text-center">19/06</div>
                <div className="text-center">23/06</div>
              </div>
              <div className="w-32 text-center font-medium text-sm text-gray-600">Progresso</div>
            </div>

            {/* Linha "Hoje" */}
            <div className="relative">
              <div className="absolute left-64 top-0 bottom-0 w-px bg-red-500 border-l-2 border-dashed border-red-500 z-10">
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Hoje
                </div>
              </div>
            </div>

            {/* Tarefas */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma tarefa encontrada</p>
                <p className="text-sm">Crie sua primeira tarefa para começar</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center border-b pb-3">
                  <div className="w-64 pr-4">
                    <div className="flex items-center gap-2">
                      {task.is_milestone && (
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{task.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {isTaskOverdue(task) && (
                            <Badge variant="destructive">Atrasada</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <Users className="h-3 w-3 inline mr-1" />
                          {task.assignee}
                  </p>
                </div>
          </div>
        </div>
                  
                  <div className="flex-1 relative">
                    <div className="grid grid-cols-7 gap-1 h-8">
                      {Array.from({ length: 7 }, (_, i) => {
                        const startDate = new Date('2024-06-05');
                        const currentDate = new Date(startDate);
                        currentDate.setDate(startDate.getDate() + (i * 3));
                        
                        const taskStart = new Date(task.start_date);
                        const taskEnd = new Date(task.end_date);
                        const isInRange = currentDate >= taskStart && currentDate <= taskEnd;
                        
                        return (
                          <div key={i} className="relative">
                            {isInRange && (
                              <div 
                                className={`h-6 rounded ${
                                  task.status === 'completed' ? 'bg-green-500' :
                                  task.status === 'in_progress' ? 'bg-blue-500' :
                                  task.status === 'blocked' ? 'bg-red-500' :
                                  'bg-gray-400'
                                }`}
                                style={{
                                  width: `${task.progress}%`,
                                  maxWidth: '100%'
                                }}
                              ></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="w-32 text-center">
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress} className="flex-1" />
                      <span className="text-xs font-medium">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-blue-600" />
            Lista de Tarefas ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <List className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma tarefa encontrada</p>
              <p className="text-sm">Ajuste os filtros ou crie uma nova tarefa</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {task.is_milestone && (
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      )}
                      <div>
                        <h4 className="font-medium">{task.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {isTaskOverdue(task) && (
                            <Badge variant="destructive">Atrasada</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(task.start_date).toLocaleDateString('pt-BR')} - {new Date(task.end_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4" />
                        {task.assignee}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">{task.progress}%</div>
                      <Progress value={task.progress} className="w-20" />
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSave={handleTaskSaved}
      />

      <GanttExport
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tasks={tasks as any}
        projectName={getCurrentProject()?.name || 'Projeto'}
      />

      <GanttShare
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectId={selectedProjectId}
        projectName={getCurrentProject()?.name || 'Projeto'}
        tasks={tasks as any}
      />
    </div>
  );
}
