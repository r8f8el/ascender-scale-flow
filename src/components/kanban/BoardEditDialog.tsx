
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { KanbanBoard } from '@/hooks/useKanbanBoards';
import { toast } from 'sonner';

interface BoardEditDialogProps {
  board: KanbanBoard | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<KanbanBoard>) => void;
}

export const BoardEditDialog: React.FC<BoardEditDialogProps> = ({
  board,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: board?.name || '',
    description: board?.description || ''
  });

  React.useEffect(() => {
    if (board) {
      setFormData({
        name: board.name,
        description: board.description || ''
      });
    }
  }, [board]);

  const handleSubmit = () => {
    if (!board || !formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    onUpdate(board.id, {
      name: formData.name.trim(),
      description: formData.description.trim()
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Quadro</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="board-name">Nome do Quadro *</Label>
            <Input
              id="board-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do quadro..."
            />
          </div>
          
          <div>
            <Label htmlFor="board-description">Descrição</Label>
            <Textarea
              id="board-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do quadro..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
