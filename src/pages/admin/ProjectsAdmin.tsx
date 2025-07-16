import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { Plus, Edit, Eye, Calendar, DollarSign, Users, CheckCircle, BarChart3, Trash2, Search, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ProjectDashboard from '@/components/projects/ProjectDashboard';
import ProjectDetail from '@/components/projects/ProjectDetail';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  progress: number;
  client_profiles?: {
    name: string;
    company: string;
  };
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
}

const ProjectsAdmin = () => {
  const { toast } = useToast();
  const { logUserAction, logDataOperation } = useActivityLogger();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget: '',
    progress: 0
  });

  // Optimized data fetching with cache
  const projectsQuery = useOptimizedQuery(
    'projects-with-clients',
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client_profiles(name, company)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false
    }
  );

  const clientsQuery = useOptimizedQuery(
    'clients',
    async () => {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, company')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    {
      staleTime: 60000, // 1 minute
      cacheTime: 600000 // 10 minutes
    }
  );

  // Memoized data
  const projects = useMemo(() => projectsQuery.data || [], [projectsQuery.data]);
  const clients = useMemo(() => clientsQuery.data || [], [clientsQuery.data]);
  const isLoading = projectsQuery.isLoading || clientsQuery.isLoading;

  useEffect(() => {
    logUserAction('access_projects_admin', 'Admin acessou gestão de projetos');
  }, [logUserAction]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        progress: parseInt(formData.progress.toString()),
        client_id: formData.client_id || null
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Projeto atualizado com sucesso!"
        });

        logDataOperation('update', 'project', `Projeto atualizado: ${formData.name}`);
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso!"
        });

        logDataOperation('create', 'project', `Novo projeto criado: ${formData.name}`);
      }

      setIsDialogOpen(false);
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        client_id: '',
        status: 'planning',
        priority: 'medium',
        start_date: '',
        end_date: '',
        budget: '',
        progress: 0
      });
      
      // Invalidate cache and refetch
      projectsQuery.invalidateQuery();
      projectsQuery.refetch();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto.",
        variant: "destructive"
      });
    }
  }, [formData, editingProject, toast, logDataOperation, projectsQuery]);

  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      client_id: project.client_profiles ? project.id : '',
      status: project.status,
      priority: project.priority,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget?.toString() || '',
      progress: project.progress
    });
    setIsDialogOpen(true);
    logUserAction('edit_project', `Iniciou edição do projeto: ${project.name}`);
  }, [logUserAction]);

  const handleDelete = useCallback(async (projectId: string, projectName: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso!"
      });

      logDataOperation('delete', 'project', `Projeto excluído: ${projectName}`);
      
      // Invalidate cache and refetch
      projectsQuery.invalidateQuery();
      projectsQuery.refetch();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto.",
        variant: "destructive"
      });
    }
  }, [toast, logDataOperation, projectsQuery]);

  const handleViewDetails = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    logUserAction('view_project_detail', `Visualizou detalhes do projeto: ${projectId}`);
  }, [logUserAction]);

  const handleRefresh = useCallback(() => {
    projectsQuery.refetch();
    clientsQuery.refetch();
  }, [projectsQuery, clientsQuery]);

  // Memoized filtered projects to prevent unnecessary recalculations
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client_profiles?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando projetos...</div>;
  }

  // Se um projeto está selecionado, mostrar detalhes
  if (selectedProject) {
    const project = projects.find(p => p.id === selectedProject);
    if (project) {
      return (
        <ProjectDetail
          projectId={selectedProject}
          onBack={() => setSelectedProject(null)}
          onEdit={handleEdit}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProjectDashboard />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gestão de Projetos</h2>
              <p className="text-muted-foreground">
                Gerencie todos os projetos da empresa
                {projectsQuery.isRefetching && (
                  <span className="ml-2 text-xs text-blue-600">Atualizando...</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={projectsQuery.isRefetching}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${projectsQuery.isRefetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProject(null);
              setFormData({
                name: '',
                description: '',
                client_id: '',
                status: 'planning',
                priority: 'medium',
                start_date: '',
                end_date: '',
                budget: '',
                progress: 0
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
              <DialogDescription>
                Preencha as informações do projeto
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planejamento</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="on_hold">Em Espera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress">Progresso (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProject ? 'Atualizar' : 'Criar'} Projeto
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>

      {/* Filtros e Busca */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="planning">Planejamento</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="on_hold">Em Espera</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {project.client_profiles ? `${project.client_profiles.name} - ${project.client_profiles.company}` : 'Sem cliente'}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(project.id)}
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id, project.name)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status === 'planning' && 'Planejamento'}
                    {project.status === 'in_progress' && 'Em Progresso'}
                    {project.status === 'completed' && 'Concluído'}
                    {project.status === 'on_hold' && 'Em Espera'}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority === 'high' && 'Alta'}
                    {project.priority === 'medium' && 'Média'}
                    {project.priority === 'low' && 'Baixa'}
                  </Badge>
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="space-y-2">
                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {project.budget.toLocaleString('pt-BR')}</span>
                    </div>
                  )}

                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {project.start_date && new Date(project.start_date).toLocaleDateString('pt-BR')}
                        {project.start_date && project.end_date && ' - '}
                        {project.end_date && new Date(project.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>{project.progress}% concluído</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && projects.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros de busca ou criar um novo projeto
            </p>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground text-center">
              Comece criando seu primeiro projeto clicando no botão "Novo Projeto"
            </p>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsAdmin;