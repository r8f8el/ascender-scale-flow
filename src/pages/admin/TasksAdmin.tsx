import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  projects: {
    name: string;
  };
  collaborators?: {
    name: string;
    email: string;
  };
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
}

const TasksAdmin = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    actual_hours: ''
  });

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadCollaborators();
  }, []);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(name),
          collaborators(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseInt(formData.actual_hours) : null,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null
      };

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso!"
        });
      }

      // Enviar notificação se tarefa foi atribuída
      if (taskData.assigned_to && (!editingTask || editingTask.collaborators?.name !== taskData.assigned_to)) {
        await sendNotification(taskData.assigned_to, taskData.title);
      }

      setIsDialogOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        project_id: '',
        assigned_to: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        estimated_hours: '',
        actual_hours: ''
      });
      loadTasks();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar tarefa.",
        variant: "destructive"
      });
    }
  };

  const sendNotification = async (collaboratorId: string, taskTitle: string) => {
    try {
      // A notificação será criada automaticamente pelo trigger do banco
      // Aqui vamos buscar a notificação criada e disparar o envio do email
      await new Promise(resolve => setTimeout(resolve, 100)); // Aguardar o trigger

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id')
        .is('sent_at', null)
        .ilike('subject', `%${taskTitle}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (notifications && notifications.length > 0) {
        await supabase.functions.invoke('send-notification', {
          body: { notificationId: notifications[0].id }
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      project_id: task.projects ? task.id : '', // Precisa ajustar isso
      assigned_to: task.collaborators ? task.id : '', // Precisa ajustar isso
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
      estimated_hours: task.estimated_hours?.toString() || '',
      actual_hours: task.actual_hours?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
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

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando tarefas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Tarefas</h2>
          <p className="text-muted-foreground">Gerencie todas as tarefas dos projetos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                project_id: '',
                assigned_to: '',
                status: 'pending',
                priority: 'medium',
                due_date: '',
                estimated_hours: '',
                actual_hours: ''
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
              <DialogDescription>
                Preencha as informações da tarefa
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Tarefa</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Projeto</Label>
                  <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar projeto" />
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
                  <Label htmlFor="assigned_to">Atribuir para</Label>
                  <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((collaborator) => (
                        <SelectItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.name} - {collaborator.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="blocked">Bloqueada</SelectItem>
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
                  <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual_hours">Horas Reais</Label>
                  <Input
                    id="actual_hours"
                    type="number"
                    value={formData.actual_hours}
                    onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTask ? 'Atualizar' : 'Criar'} Tarefa
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {task.title}
                    {isOverdue(task.due_date) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {task.projects?.name}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === 'pending' && 'Pendente'}
                    {task.status === 'in_progress' && 'Em Progresso'}
                    {task.status === 'completed' && 'Concluída'}
                    {task.status === 'blocked' && 'Bloqueada'}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority === 'high' && 'Alta'}
                    {task.priority === 'medium' && 'Média'}
                    {task.priority === 'low' && 'Baixa'}
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="space-y-2">
                  {task.collaborators && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>{task.collaborators.name}</span>
                    </div>
                  )}

                  {task.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className={isOverdue(task.due_date) ? 'text-red-600 font-medium' : ''}>
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        {isOverdue(task.due_date) && ' (Atrasada)'}
                      </span>
                    </div>
                  )}

                  {(task.estimated_hours || task.actual_hours) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        {task.estimated_hours && `${task.estimated_hours}h estimadas`}
                        {task.estimated_hours && task.actual_hours && ' / '}
                        {task.actual_hours && `${task.actual_hours}h reais`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground text-center">
              Comece criando tarefas para organizar o trabalho da equipe
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksAdmin;