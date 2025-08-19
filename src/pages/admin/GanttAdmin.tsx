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
  List,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { TaskModal } from '@/components/gantt/TaskModal';
import { GanttExport } from '@/components/gantt/GanttExport';
import { GanttShare } from '@/components/gantt/GanttShare';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { GanttTask } from '@/hooks/useGanttTasks';
import { supabase } from '@/integrations/supabase/client';

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface GanttProject {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  priority: string;
}

export default function GanttAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados dos modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Estados de controle
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Estados de dados reais
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados reais do banco
  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadProjects(selectedClientId);
    }
  }, [selectedClientId]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, email, company')
        .order('name');

      if (error) throw error;
      
      setClients(data || []);
      if (data && data.length > 0) {
        setSelectedClientId(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      });
    }
  };

  const loadProjects = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('gantt_projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id);
      } else {
        setSelectedProjectId('');
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos",
        variant: "destructive"
      });
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('gantt_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear dados para o formato esperado do GanttTask
      const mappedTasks: GanttTask[] = (data || []).map(task => ({
        id: task.id,
        name: task.name || '',
        description: task.description || '',
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        progress: task.progress || 0,
        status: task.progress === 100 ? 'completed' : 
                task.progress > 0 ? 'in_progress' : 'pending',
        priority: (task.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        assigned_to: task.assigned_to || '',
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        is_milestone: task.is_milestone || false,
        project_id: task.project_id,
        created_at: task.created_at,
        updated_at: task.updated_at,
        estimated_hours: task.estimated_hours || 0,
        actual_hours: task.actual_hours || 0,
        category: 'Task',
        tags: [],
        assignee: task.assigned_to || 'Não atribuído',
        collaborators: []
      }));
      
      setTasks(mappedTasks);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

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
      case 'pending': return <Calendar className="h-4 w-4" />;
      case 'blocked': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // Funções auxiliares para visualização dinâmica
  const getTimelineHeaders = () => {
    const today = new Date();
    const headers: string[] = [];
    
    switch (viewMode) {
      case 'day':
        // Mostrar próximos 7 dias
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          headers.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }
        break;
      case 'week':
        // Mostrar próximas 4 semanas
        for (let i = 0; i < 4; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + (i * 7));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          headers.push(`${weekStart.toLocaleDateString('pt-BR', { day: '2-digit' })}-${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`);
        }
        break;
      case 'month':
        // Mostrar próximos 6 meses
        for (let i = 0; i < 6; i++) {
          const date = new Date(today);
          date.setMonth(today.getMonth() + i);
          headers.push(date.toLocaleDateString('pt-BR', { month: 'short' }));
        }
        break;
    }
    
    return headers;
  };

  const getTodayPosition = () => {
    const today = new Date();
    const timelineStart = new Date();
    
    switch (viewMode) {
      case 'day':
        return 264; // Posição fixa para visualização diária
      case 'week':
        return 264; // Posição fixa para visualização semanal
      case 'month':
        return 264; // Posição fixa para visualização mensal
      default:
        return 264;
    }
  };

  const getTimelineCells = (task: GanttTask) => {
    const today = new Date();
    const cells: { isInRange: boolean; progress: number; startOffset: number; width: number }[] = [];
    
    switch (viewMode) {
      case 'day':
        // 7 células para 7 dias
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const taskStart = new Date(task.start_date);
          const taskEnd = new Date(task.end_date);
          const isInRange = date >= taskStart && date <= taskEnd;
          
          cells.push({ 
            isInRange, 
            progress: isInRange ? task.progress : 0,
            startOffset: 0,
            width: isInRange ? 100 : 0
          });
        }
        break;
      case 'week':
        // 4 células para 4 semanas
        for (let i = 0; i < 4; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + (i * 7));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const taskStart = new Date(task.start_date);
          const taskEnd = new Date(task.end_date);
          const isInRange = (weekStart <= taskEnd && weekEnd >= taskStart);
          
          cells.push({ 
            isInRange, 
            progress: isInRange ? task.progress : 0,
            startOffset: 0,
            width: isInRange ? 100 : 0
          });
        }
        break;
      case 'month':
        // 6 células para 6 meses
        for (let i = 0; i < 6; i++) {
          const date = new Date(today);
          date.setMonth(today.getMonth() + i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const taskStart = new Date(task.start_date);
          const taskEnd = new Date(task.end_date);
          const isInRange = (monthStart <= taskEnd && monthEnd >= taskStart);
          
          cells.push({ 
            isInRange, 
            progress: isInRange ? task.progress : 0,
            startOffset: 0,
            width: isInRange ? 100 : 0
          });
        }
        break;
    }
    
    return cells;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = task.project_id === selectedProjectId;
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee?.includes(assigneeFilter);
    
    return matchesProject && matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getProjectStats = () => {
    const clientTasks = tasks.filter(t => t.project_id === selectedProjectId);
    const total = clientTasks.length;
    const completed = clientTasks.filter(t => t.status === 'completed').length;
    const inProgress = clientTasks.filter(t => t.status === 'in_progress').length;
    const pending = clientTasks.filter(t => t.status === 'pending').length;
    const blocked = clientTasks.filter(t => t.status === 'blocked').length;

    return { total, completed, inProgress, pending, blocked };
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

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      // Excluir do banco
      const { error } = await supabase
        .from('gantt_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Atualizar estado local
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

  const handleTaskSaved = async (taskData: any) => {
    try {
      if (selectedTask) {
        // Atualizar tarefa existente
        const { error } = await supabase
          .from('gantt_tasks')
          .update({
            name: taskData.name,
            description: taskData.description,
            start_date: taskData.start_date,
            end_date: taskData.end_date,
            priority: taskData.priority,
            estimated_hours: taskData.estimated_hours,
            progress: taskData.progress,
            is_milestone: taskData.is_milestone
          })
          .eq('id', selectedTask.id);

        if (error) throw error;
      } else {
        // Criar nova tarefa
        const { error } = await supabase
          .from('gantt_tasks')
          .insert({
            project_id: selectedProjectId,
            name: taskData.name,
            description: taskData.description,
            start_date: taskData.start_date,
            end_date: taskData.end_date,
            priority: taskData.priority,
            estimated_hours: taskData.estimated_hours,
            progress: taskData.progress,
            is_milestone: taskData.is_milestone
          });

        if (error) throw error;
      }

      // Recarregar tarefas
      await loadTasks(selectedProjectId);
      
      toast({
        title: "Sucesso!",
        description: "Tarefa salva com sucesso"
      });

      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar tarefa",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'blocked') => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        toast({
          title: "Erro",
          description: "Tarefa não encontrada",
          variant: "destructive"
        });
        return;
      }

      // Atualizar progresso baseado no status
      let newProgress = 0;
      switch (newStatus) {
        case 'completed':
          newProgress = 100;
          break;
        case 'in_progress':
          newProgress = 50;
          break;
        case 'blocked':
          newProgress = 0;
          break;
        case 'pending':
          newProgress = 0;
          break;
        default:
          newProgress = 0;
      }

      // Atualizar no banco
      const { error } = await supabase
        .from('gantt_tasks')
        .update({
          progress: newProgress
        })
        .eq('id', taskId);

      if (error) throw error;

      // Atualizar tarefa localmente
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status: newStatus,
              progress: newProgress
            }
          : t
      ));

      toast({
        title: "Sucesso!",
        description: `Status alterado para: ${newStatus.replace('_', ' ')} - Progresso: ${newProgress}%`
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getCurrentProject = () => {
    return projects.find(p => p.id === selectedProjectId && p.client_id === selectedClientId);
  };

  const getCurrentClient = () => {
    return clients.find(c => c.id === selectedClientId);
  };

  const getClientProjects = () => {
    return projects.filter(p => p.client_id === selectedClientId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Gantt - Cronogramas (Admin)
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie cronogramas, dependências e marcos de todos os projetos
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

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-sm font-medium">Cliente</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Projeto do Cliente</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getClientProjects().map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <span className="font-medium">Cliente:</span> {getCurrentClient()?.company || getCurrentClient()?.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Período:</span> {new Date(getCurrentProject()?.start_date || '').toLocaleDateString('pt-BR')} - {new Date(getCurrentProject()?.end_date || '').toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                <p className="text-2xl font-bold text-red-800">{stats.blocked}</p>
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
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <SelectItem value="blocked">Atrasadas</SelectItem>
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
                  <SelectItem value="Carlos">Carlos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Cronograma do Projeto
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {viewMode === 'day' && 'Visualização diária - próximos 7 dias'}
                {viewMode === 'week' && 'Visualização semanal - próximas 4 semanas'}
                {viewMode === 'month' && 'Visualização mensal - próximos 6 meses'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Dia
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Semana
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Mês
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center border-b pb-2">
              <div className="w-64 font-medium text-sm text-gray-600">Nome da Tarefa</div>
              <div className="flex-1 flex gap-1 text-xs text-gray-500">
                {getTimelineHeaders().map((header, index) => (
                  <div key={index} className="flex-1 text-center min-w-0 px-1">
                    <div className="truncate" title={header}>
                      {header}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-32 text-center font-medium text-sm text-gray-600">Progresso</div>
            </div>

            <div className="relative">
              <div 
                className="absolute top-0 bottom-0 w-px bg-red-500 border-l-2 border-dashed border-red-500 z-10"
                style={{ left: `${getTodayPosition()}px` }}
              >
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Hoje
                </div>
              </div>
            </div>

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
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <Users className="h-3 w-3 inline mr-1" />
                          {task.assignee}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="flex gap-1 h-8">
                      {getTimelineCells(task).map((cell, index) => (
                        <div key={index} className="flex-1 relative min-w-0">
                          {cell.isInRange && (
                            <div 
                              className={`h-6 rounded transition-all duration-200 ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'in_progress' ? 'bg-blue-500' :
                                task.status === 'blocked' ? 'bg-red-500' :
                                task.status === 'pending' ? 'bg-yellow-500' :
                                'bg-gray-400'
                              }`}
                              style={{
                                width: `${cell.width}%`,
                                maxWidth: `${cell.width}%`
                              }}
                              title={`${task.name}: ${task.progress}% concluído - Status: ${task.status.replace('_', ' ')}`}
                            ></div>
                          )}
                          {!cell.isInRange && (
                            <div className="h-6 border border-dashed border-gray-200 rounded opacity-30"></div>
                          )}
                        </div>
                      ))}
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
                    
                    <div className="flex gap-1 mt-2">
                      <Button 
                        variant={task.status === 'completed' ? 'default' : 'outline'} 
                        size="sm" 
                        className="text-xs px-2 py-1 h-7"
                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                      >
                        ✅ Concluída
                      </Button>
                      <Button 
                        variant={task.status === 'in_progress' ? 'default' : 'outline'} 
                        size="sm" 
                        className="text-xs px-2 py-1 h-7"
                        onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                      >
                        🔄 Em Andamento
                      </Button>
                      <Button 
                        variant={task.status === 'blocked' ? 'default' : 'outline'} 
                        size="sm" 
                        className="text-xs px-2 py-1 h-7"
                        onClick={() => handleUpdateTaskStatus(task.id, 'blocked')}
                      >
                        ⚠️ Bloqueada
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSave={handleTaskSaved}
        projectId={selectedProjectId}
      />

      <GanttExport
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tasks={tasks}
        projectName={getCurrentProject()?.name || 'Projeto'}
      />

      <GanttShare
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectId={selectedProjectId}
        projectName={getCurrentProject()?.name || 'Projeto'}
        tasks={tasks}
      />
    </div>
  );
}
