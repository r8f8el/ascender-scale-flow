import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GanttChart } from '@/components/gantt/GanttChart';
import { useGanttProjects } from '@/hooks/useGanttProjects';
import { BarChart3, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function GanttAdmin() {
  const { projects, loading, createProject } = useGanttProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    client_id: '',
    start_date: new Date(),
    end_date: new Date(),
    priority: 'medium',
    budget: ''
  });

  React.useEffect(() => {
    const loadClients = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('client_profiles').select('*');
      setClients(data || []);
    };
    loadClients();
  }, []);

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const projectData = {
      name: projectForm.name,
      description: projectForm.description,
      client_id: projectForm.client_id || null,
      start_date: format(projectForm.start_date, 'yyyy-MM-dd'),
      end_date: format(projectForm.end_date, 'yyyy-MM-dd'),
      priority: projectForm.priority,
      budget: projectForm.budget ? parseFloat(projectForm.budget) : null,
      status: 'planning',
      progress: 0,
      is_active: true
    };

    const newProject = await createProject(projectData);
    if (newProject) {
      setSelectedProjectId(newProject.id);
      setIsCreateDialogOpen(false);
      setProjectForm({
        name: '', description: '', client_id: '', start_date: new Date(),
        end_date: new Date(), priority: 'medium', budget: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Gantt - Cronogramas
          </h1>
          <p className="text-muted-foreground">
            Gerencie cronogramas e dependências de projetos
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projetos</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={selectedProjectId === project.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.progress}% concluído
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {selectedProjectId ? (
            <GanttChart projectId={selectedProjectId} isAdmin={true} />
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Selecione um projeto
                </h3>
                <p className="text-sm text-muted-foreground">
                  Escolha um projeto à esquerda ou crie um novo
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do projeto"
              value={projectForm.name}
              onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição"
              value={projectForm.description}
              onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <Select
              value={projectForm.client_id}
              onValueChange={(value) => setProjectForm(prev => ({ ...prev, client_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(projectForm.start_date, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={projectForm.start_date}
                    onSelect={(date) => date && setProjectForm(prev => ({ ...prev, start_date: date }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(projectForm.end_date, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={projectForm.end_date}
                    onSelect={(date) => date && setProjectForm(prev => ({ ...prev, end_date: date }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProject}>Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}