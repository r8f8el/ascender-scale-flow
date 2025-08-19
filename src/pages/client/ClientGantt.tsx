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
import { GanttTask, useGanttTasks } from '@/hooks/useGanttTasks';
import { useGanttProjects } from '@/hooks/useGanttProjects';

export default function ClientGantt() {
  console.log('🔍 ClientGantt: Componente renderizando...');
  
  const { user, client } = useAuth();
  const { toast } = useToast();
  
  // Estados dos modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  
  // Estados de controle
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Usar hooks para dados reais
  const { projects, loading: projectsLoading, error: projectsError } = useGanttProjects();
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    testConnection
  } = useGanttTasks(selectedProjectId);

  // Logs de debug
  console.log('🔍 ClientGantt: Dados dos hooks:', {
    projects,
    projectsLoading,
    projectsError,
    selectedProjectId,
    tasks,
    tasksLoading,
    tasksError
  });

  // Estados de loading e erro
  const isLoading = projectsLoading || tasksLoading;
  const hasError = projectsError || tasksError;

  // Dados de fallback se não houver projetos ou tarefas
  const fallbackProjects = [
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
  ];

  const fallbackTasks: GanttTask[] = [
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
      start_date: '2024-06-09',
      end_date: '2024-06-12',
      progress: 75,
      status: 'in_progress',
      priority: 'medium',
      assigned_to: 'Paula',
      dependencies: ['223e4567-e89b-12d3-a456-426614174000'],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 12,
      actual_hours: 9,
      category: 'Analysis',
      tags: ['swot'],
      assignee: 'Paula'
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174002',
      name: 'Análise de Oportunidades',
      description: 'Identificar e analisar as oportunidades externas',
      start_date: '2024-06-13',
      end_date: '2024-06-16',
      progress: 0,
      status: 'pending',
      priority: 'high',
      assigned_to: 'Rafael',
      dependencies: ['223e4567-e89b-12d3-a456-426614174001'],
      is_milestone: false,
      project_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      estimated_hours: 16,
      actual_hours: 0,
      category: 'Analysis',
      tags: ['swot'],
      assignee: 'Rafael'
    }
  ];

  // Usar dados reais ou fallback
  const currentProjects = projects && projects.length > 0 ? projects : fallbackProjects;
  const currentTasks = tasks && tasks.length > 0 ? tasks : fallbackTasks;

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      console.log('🔍 Selecionando primeiro projeto real do Supabase:', projects[0]);
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Verificar se há projeto selecionado
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      console.log('🔍 Nenhum projeto selecionado, selecionando primeiro real...');
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Log quando selectedProjectId mudar
  useEffect(() => {
    if (selectedProjectId) {
      console.log('🔍 selectedProjectId atualizado para:', selectedProjectId);
      const selectedProject = projects?.find(p => p.id === selectedProjectId);
      console.log('🔍 Projeto selecionado:', selectedProject);
    }
  }, [selectedProjectId, projects]);

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

  // Helper function to safely format status text
  const formatStatusText = (status: string | undefined) => {
    if (!status) return 'Não definido';
    return status.replace('_', ' ');
  };

  const filteredTasks = currentTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || (task.assignee && task.assignee.includes(assigneeFilter));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getProjectStats = () => {
    const total = currentTasks.length;
    const completed = currentTasks.filter(t => t.status === 'completed').length;
    const inProgress = currentTasks.filter(t => t.status === 'in_progress').length;
    const blocked = currentTasks.filter(t => t.status === 'blocked').length;
    const pending = currentTasks.filter(t => t.status === 'pending').length;
    const overdue = currentTasks.filter(t => isTaskOverdue(t)).length;

    return { total, completed, inProgress, blocked, notStarted: pending, overdue };
  };

  const stats = getProjectStats();

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
    try {
      await deleteTask(taskId);
      
      toast({
        title: "Sucesso!",
        description: "Tarefa excluída com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'blocked') => {
    try {
      const task = currentTasks.find(t => t.id === taskId);
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

      const result = await updateTask(taskId, {
        ...task,
        status: newStatus,
        progress: newProgress
      });

      if (result.error) {
        throw result.error;
      }

      // Aguardar um pouco e então recarregar as tarefas
      setTimeout(async () => {
        try {
          // Forçar refresh das tarefas do hook
          if (typeof window !== 'undefined' && window.location) {
            // Recarregar apenas os dados, não a página inteira
            console.log('🔄 Recarregando tarefas após atualização de status...');
            // O hook useGanttTasks deve fazer o refresh automaticamente
          }
        } catch (refreshError) {
          console.error('Erro ao recarregar tarefas:', refreshError);
        }
      }, 500);

      toast({
        title: "Sucesso!",
        description: `Status alterado para: ${formatStatusText(newStatus)} - Progresso: ${newProgress}%`
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

  const handleTaskSaved = async (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔄 handleTaskSaved chamado com:', taskData);
      console.log('🔄 selectedTask:', selectedTask);
      console.log('🔄 selectedProjectId:', selectedProjectId);
      
      if (selectedTask) {
        // Atualizar tarefa existente
        console.log('🔄 Atualizando tarefa existente...');
        const result = await updateTask(selectedTask.id, taskData);
        console.log('🔄 Resultado da atualização:', result);
        
        if (result.error) {
          throw result.error;
        }
        
        toast({
          title: "Sucesso!",
          description: "Tarefa atualizada com sucesso"
        });
      } else {
        // Criar nova tarefa
        console.log('🔄 Criando nova tarefa...');
        const result = await createTask(taskData);
        console.log('🔄 Resultado da criação:', result);
        
        if (result.error) {
          throw result.error;
        }
        
        toast({
          title: "Sucesso!",
          description: "Tarefa criada com sucesso"
        });
      }
      
      console.log('🔄 Fechando modal e limpando estado...');
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      
      // Forçar recarregamento das tarefas
      console.log('🔄 Recarregando tarefas...');
      // Aguardar um pouco para o banco processar
      setTimeout(() => {
        console.log('🔄 Recarregando tarefas após delay...');
        // Aqui você pode chamar uma função de refresh se necessário
      }, 500);
      
    } catch (error) {
      console.error('❌ Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar tarefa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getCurrentProject = () => {
    return currentProjects.find(p => p.id === selectedProjectId);
  };

  return (
    <div className="space-y-6">
      {/* Botão de Teste Debug */}
      <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg">
        <h3 className="text-red-800 font-bold mb-2">🧪 DEBUG - Teste de Conexão</h3>
                   <Button 
             className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-6 py-3"
             onClick={async () => {
               console.log('🧪 BOTÃO DE TESTE CLICADO!');
               console.log('🧪 selectedProjectId:', selectedProjectId);
               console.log('🧪 currentProjects:', currentProjects);
               console.log('🧪 testConnection existe?', typeof testConnection);
               
               if (!selectedProjectId) {
                 alert('❌ Nenhum projeto selecionado! Selecione um projeto primeiro.');
                 return;
               }
               
               try {
                 const result = await testConnection();
                 console.log('🧪 Resultado:', result);
                 alert(`Teste: ${result.success ? 'SUCESSO' : 'ERRO'} - Verifique o console`);
               } catch (error) {
                 console.error('🧪 Erro no teste:', error);
                 alert('Erro no teste - Verifique o console');
               }
             }}
           >
             🧪 TESTAR CONEXÃO SUPABASE
           </Button>
           
           <Button 
             className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-6 py-3"
             onClick={async () => {
               console.log('🔍 VERIFICANDO TAREFAS NO BANCO...');
               console.log('🔍 selectedProjectId:', selectedProjectId);
               
               try {
                 const { supabase } = await import('@/integrations/supabase/client');
                 const { data, error } = await supabase
                   .from('gantt_tasks')
                   .select('*')
                   .eq('project_id', selectedProjectId);
                   
                 console.log('🔍 Tarefas no banco:', data);
                 console.log('🔍 Erro:', error);
                 
                 if (error) {
                   alert(`❌ Erro: ${error.message}`);
                 } else {
                   alert(`✅ Encontradas ${data?.length || 0} tarefas no banco`);
                 }
               } catch (error) {
                 console.error('🔍 Erro ao verificar tarefas:', error);
                 alert('Erro ao verificar tarefas');
               }
             }}
           >
             🔍 VER TAREFAS NO BANCO
           </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Carregando projetos e tarefas...</span>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Erro ao carregar dados</span>
          </div>
          <p className="text-red-600 mt-1">
            {projectsError || tasksError || 'Erro desconhecido. Usando dados de exemplo.'}
          </p>
        </div>
      )}

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
          <Button 
            variant="default" 
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
            onClick={async () => {
              console.log('🧪 Testando conexão...');
              const result = await testConnection();
              console.log('🧪 Resultado do teste:', result);
              if (result.success) {
                toast({
                  title: "✅ Conexão OK",
                  description: "Supabase conectado e funcionando!"
                });
              } else {
                toast({
                  title: "❌ Erro de Conexão",
                  description: "Problema com Supabase. Verifique o console.",
                  variant: "destructive"
                });
              }
            }}
          >
            🧪 TESTAR CONEXÃO
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
                  {currentProjects.map((project) => (
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
          {/* Gráfico Gantt Dinâmico */}
          <div className="space-y-4">
            {/* Cabeçalho da Timeline Dinâmico */}
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

            {/* Linha "Hoje" */}
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
                          <Badge variant="outline" className={getStatusColor(task.status || 'pending')}>
                            {getStatusIcon(task.status || 'pending')}
                            <span className="ml-1 capitalize">{formatStatusText(task.status)}</span>
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority || 'medium')}>
                            {task.priority || 'medium'}
                          </Badge>
                          {isTaskOverdue(task) && (
                            <Badge variant="destructive">Atrasada</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <Users className="h-3 w-3 inline mr-1" />
                          {task.assigned_to || 'Não atribuído'}
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
                                title={`${task.name}: ${task.progress}% concluído - Status: ${formatStatusText(task.status)}`}
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
                          <Badge variant="outline" className={getStatusColor(task.status || 'pending')}>
                            {getStatusIcon(task.status || 'pending')}
                            <span className="ml-1 capitalize">{formatStatusText(task.status)}</span>
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority || 'medium')}>
                            {task.priority || 'medium'}
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
                        {task.assignee || 'Não atribuído'}
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
                     
                     {/* Botões de Status */}
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

      {/* Modais */}
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
        tasks={currentTasks as any}
        projectName={getCurrentProject()?.name || 'Projeto'}
      />

      <GanttShare
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectId={selectedProjectId}
        projectName={getCurrentProject()?.name || 'Projeto'}
        tasks={currentTasks as any}
      />
    </div>
  );
}
