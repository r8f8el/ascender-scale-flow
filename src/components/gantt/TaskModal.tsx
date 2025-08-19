import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertCircle, CheckCircle, Clock, Calendar as CalendarIcon, Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null;
  onTaskSaved: () => void;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  dependencies: string[];
  is_milestone: boolean;
  project_id: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  task,
  onTaskSaved
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium' as const,
    assigned_to: '',
    dependencies: [] as string[],
    is_milestone: false
  });

  const isEditing = !!task;

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      if (task) {
        setFormData({
          name: task.name,
          description: task.description || '',
          start_date: task.start_date,
          end_date: task.end_date,
          priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
          assigned_to: task.assigned_to || '',
          dependencies: [],
          is_milestone: task.is_milestone
        });
      } else {
        setFormData({
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          priority: 'medium',
          assigned_to: '',
          dependencies: [],
          is_milestone: false
        });
      }
    }
  }, [isOpen, task, projectId]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Erro",
        description: "Datas de início e fim são obrigatórias",
        variant: "destructive"
      });
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast({
        title: "Erro",
        description: "Data de início deve ser anterior à data de fim",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para envio
      const taskData = {
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        priority: formData.priority,
        assigned_to: formData.assigned_to || null,
        dependencies: [],
        is_milestone: formData.is_milestone
      };

      console.log('📤 Dados sendo enviados:', taskData);

      if (isEditing && task) {
        // Atualizar tarefa existente
        const { error } = await supabase
          .from('gantt_tasks')
          .update(taskData)
          .eq('id', task.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Tarefa atualizada com sucesso"
        });
      } else {
        // Criar nova tarefa
        const insertData = {
          ...taskData,
          project_id: projectId,
          progress: 0
        };

        console.log('📤 Dados de inserção:', insertData);

        const { error } = await supabase
          .from('gantt_tasks')
          .insert(insertData);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Tarefa criada com sucesso"
        });
      }

      onTaskSaved();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar tarefa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'delayed': return <AlertCircle className="h-4 w-4" />;
      case 'not-started': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5 text-blue-600" />
                Editar Tarefa
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-green-600" />
                Nova Tarefa
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome e Descrição */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Tarefa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome da tarefa"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a tarefa (opcional)"
                rows={3}
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">Data de Fim *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    Baixa
                  </Badge>
                </SelectItem>
                <SelectItem value="medium">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                    Média
                  </Badge>
                </SelectItem>
                <SelectItem value="high">
                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                    Alta
                  </Badge>
                </SelectItem>
                <SelectItem value="urgent">
                  <Badge variant="outline" className="bg-red-100 text-red-700">
                    Urgente
                  </Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Responsável */}
          <div>
            <Label htmlFor="assigned_to">Responsável</Label>
            <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Nenhum
                  </div>
                </SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marco */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_milestone"
              checked={formData.is_milestone}
              onChange={(e) => setFormData({ ...formData, is_milestone: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_milestone">Esta tarefa é um marco (milestone)</Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  {isEditing ? 'Atualizar' : 'Criar'} Tarefa
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
