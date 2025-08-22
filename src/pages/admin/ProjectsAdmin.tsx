import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, BarChart3, Search, Filter } from 'lucide-react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CreateProjectDialog } from '@/components/admin/CreateProjectDialog';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  start_date: string;
  end_date: string;
  created_at: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  assigned_to: string;
  created_at: string;
}

const ProjectsAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch projects with optimized caching
  const { 
    data: projects = [], 
    isLoading: projectsLoading,
    refetch: refetchProjects 
  } = useOptimizedQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gantt_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    },
    cacheTTL: 2
  });

  // Fetch tasks with optimized caching
  const { 
    data: tasksData = [], 
    isLoading: tasksLoading,
    refetch: refetchTasks 
  } = useOptimizedQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gantt_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Map the data to match our Task interface using correct field names
      return data.map(task => ({
        id: task.id,
        project_id: task.project_id,
        title: task.name || 'Untitled Task', // Use 'name' field from database
        status: task.progress === 100 ? 'completed' : 
               task.progress > 0 ? 'in_progress' : 'todo', // Map based on progress
        assigned_to: task.assigned_to || '',
        created_at: task.created_at
      })) as Task[];
    },
    cacheTTL: 2
  });

  const tasks = tasksData as Task[];

  // Filter projects based on search and status
  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Calculate statistics
  const stats = {
    total: Array.isArray(projects) ? projects.length : 0,
    active: Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0,
    completed: Array.isArray(projects) ? projects.filter(p => p.status === 'completed').length : 0,
    totalTasks: Array.isArray(tasks) ? tasks.length : 0,
    completedTasks: Array.isArray(tasks) ? tasks.filter(t => t.status === 'completed').length : 0,
    completionRate: Array.isArray(tasks) && tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
      : 0
  };

  // Get project statistics
  const getProjectStats = () => {
    if (!Array.isArray(projects)) return { byStatus: {}, byMonth: {} };
    
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMonth = projects.reduce((acc, project) => {
      const month = new Date(project.created_at).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { byStatus, byMonth };
  };

  const handleCreateProject = () => {
    console.log('Opening create project dialog');
    setCreateDialogOpen(true);
  };

  const handleProjectCreated = () => {
    console.log('Project created, refreshing data');
    queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('gantt_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Projeto excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    } catch (error: any) {
      toast.error('Erro ao excluir projeto: ' + error.message);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('gantt_projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'Planejamento',
      active: 'Ativo',
      completed: 'Concluído',
      on_hold: 'Pausado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const projectStats = getProjectStats();

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Projetos</h1>
          <p className="text-gray-600">Visualize e gerencie todos os projetos do sistema</p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projetos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos os Status</option>
                <option value="planning">Planejamento</option>
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="on_hold">Pausado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Nenhum projeto encontrado</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const projectTasks = Array.isArray(tasks) ? tasks.filter(task => task.project_id === project.id) : [];
            
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description || 'Sem descrição'}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Início:</span>
                      <span>{new Date(project.start_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fim:</span>
                      <span>{new Date(project.end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarefas:</span>
                      <span>{projectTasks.length}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectsAdmin;
