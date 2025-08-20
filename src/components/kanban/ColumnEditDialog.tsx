
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { KanbanColumn } from '@/hooks/useKanbanBoards';
import { toast } from 'sonner';

interface ColumnEditDialogProps {
  column: KanbanColumn | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (columnData: Partial<KanbanColumn>) => void;
}

const defaultColors = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
];

export const ColumnEditDialog: React.FC<ColumnEditDialogProps> = ({
  column,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: column?.name || '',
    color: column?.color || defaultColors[0],
    wip_limit: column?.wip_limit || 0,
    is_done_column: column?.is_done_column || false
  });

  React.useEffect(() => {
    if (column) {
      setFormData({
        name: column.name,
        color: column.color,
        wip_limit: column.wip_limit || 0,
        is_done_column: column.is_done_column
      });
    } else {
      setFormData({
        name: '',
        color: defaultColors[0],
        wip_limit: 0,
        is_done_column: false
      });
    }
  }, [column]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da coluna é obrigatório');
      return;
    }

    onSave({
      name: formData.name.trim(),
      color: formData.color,
      wip_limit: formData.wip_limit > 0 ? formData.wip_limit : null,
      is_done_column: formData.is_done_column
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {column ? 'Editar Coluna' : 'Nova Coluna'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="column-name">Nome da Coluna *</Label>
            <Input
              id="column-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da coluna..."
              className="rounded-xl"
            />
          </div>
          
          <div>
            <Label>Cor da Coluna</Label>
            <div className="flex gap-2 mt-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="wip-limit">Limite WIP (0 = sem limite)</Label>
            <Input
              id="wip-limit"
              type="number"
              value={formData.wip_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, wip_limit: parseInt(e.target.value) || 0 }))}
              min="0"
              className="rounded-xl"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="done-column"
              checked={formData.is_done_column}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_done_column: checked }))}
            />
            <Label htmlFor="done-column">Coluna de finalização</Label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="rounded-xl">
              {column ? 'Atualizar' : 'Criar'} Coluna
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
