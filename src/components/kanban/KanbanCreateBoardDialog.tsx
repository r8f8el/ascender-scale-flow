
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  company: string;
}

interface KanbanCreateBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoard: (boardData: any) => void;
}

export const KanbanCreateBoardDialog: React.FC<KanbanCreateBoardDialogProps> = ({
  isOpen,
  onClose,
  onCreateBoard
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [boardForm, setBoardForm] = useState({
    name: '',
    description: '',
    client_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      const loadClients = async () => {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase.from('client_profiles').select('*');
          setClients(data || []);
        } catch (error) {
          console.error('Error loading clients:', error);
        }
      };
      loadClients();
    }
  }, [isOpen]);

  const handleCreateBoard = async () => {
    if (!boardForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const boardData = {
      name: boardForm.name,
      description: boardForm.description,
      client_id: boardForm.client_id || null,
      is_active: true
    };

    await onCreateBoard(boardData);
    onClose();
    setBoardForm({ name: '', description: '', client_id: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Criar Novo Quadro</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Quadro *</label>
            <Input
              value={boardForm.name}
              onChange={(e) => setBoardForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Desenvolvimento de Sistema"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={boardForm.description}
              onChange={(e) => setBoardForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o projeto..."
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cliente</label>
            <Select
              value={boardForm.client_id}
              onValueChange={(value) => setBoardForm(prev => ({ ...prev, client_id: value }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecionar cliente..." />
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
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateBoard}
              className="rounded-xl"
            >
              Criar Quadro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
