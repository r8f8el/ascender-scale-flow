
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
import { GanttProjectSelector } from '@/components/gantt/GanttProjectSelector';
import { useGanttProjects } from '@/hooks/useGanttProjects';
import { BarChart3, Plus, Calendar as CalendarIcon, Target, Lightbulb } from 'lucide-react';
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

  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

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
      toast.success('Projeto criado com sucesso!', {
        description: 'Agora você pode adicionar tarefas ao cronograma.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Gantt - Cronogramas
          </h1>
          <p className="text-muted-foreground">
            Gerencie cronogramas e dependências de projetos de consultoria FP&A
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>

      {projects.length === 0 && !loading ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-6 max-w-2xl mx-auto">
            <div>
              <Target className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-3">
                Bem-vindo ao Gantt de Projetos FP&A
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Organize e acompanhe todas as fases dos seus projetos de consultoria, 
                desde o kick-off até a entrega das recomendações executivas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  Planejamento Visual
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualize cronogramas, marcos e dependências entre tarefas
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  Acompanhamento Real
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monitore o progresso e ajuste prazos em tempo real
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Exemplo de fases típicas de um projeto FP&A:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Kick-off e alinhamento inicial</li>
                    <li>• Entendimento do negócio e coleta de dados</li>
                    <li>• Modelagem de forecast e cenários</li>
                    <li>• Validação do budget com stakeholders</li>
                    <li>• Entrega de recomendações executivas</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <GanttProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            loading={loading}
          />

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
                    Escolha um projeto à esquerda para visualizar o cronograma
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Criar Novo Projeto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do projeto (ex: Projeto FP&A - Cliente ABC)"
              value={projectForm.name}
              onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição do projeto e objetivos principais..."
              value={projectForm.description}
              onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Select
              value={projectForm.client_id}
              onValueChange={(value) => setProjectForm(prev => ({ ...prev, client_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cliente (opcional)" />
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
                  <Button variant="outline" className="justify-start">
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
                  <Button variant="outline" className="justify-start">
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
              <Button onClick={handleCreateProject}>Criar Projeto</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
