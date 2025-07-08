import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Eye, Calendar, DollarSign, Users, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client_profiles(name, company)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, company')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso!"
        });
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
      loadProjects();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (project: Project) => {
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
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Projetos</h2>
          <p className="text-muted-foreground">Gerencie todos os projetos da empresa</p>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {project.client_profiles ? `${project.client_profiles.name} - ${project.client_profiles.company}` : 'Sem cliente'}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(project)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
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
    </div>
  );
};

export default ProjectsAdmin;