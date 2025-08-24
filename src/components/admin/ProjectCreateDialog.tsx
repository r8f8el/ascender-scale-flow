
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useClients } from '@/hooks/useClients';

interface ProjectCreateDialogProps {
  onSuccess?: () => void;
}

export const ProjectCreateDialog: React.FC<ProjectCreateDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    budget: ''
  });
  const queryClient = useQueryClient();
  const { data: clients = [], isLoading: clientsLoading } = useClients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        client_id: formData.client_id || null,
        status: formData.status,
        priority: formData.priority,
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: format(formData.end_date, 'yyyy-MM-dd'),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        progress: 0,
        is_active: true
      };

      const { data, error } = await supabase
        .from('gantt_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Projeto criado com sucesso!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        client_id: '',
        status: 'planning',
        priority: 'medium',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: ''
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Digite o nome do projeto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Descreva o projeto (opcional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={formData.client_id} onValueChange={(value) => updateFormData('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>Nenhum cliente encontrado</SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company || client.name} ({client.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planejamento</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="on_hold">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && updateFormData('start_date', date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => date && updateFormData('end_date', date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => updateFormData('budget', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
