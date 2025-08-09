import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useKanbanBoards } from '@/hooks/useKanbanBoards';
import { useAuth } from '@/contexts/AuthContext';
import { Kanban, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function KanbanAdmin() {
  const { boards, loading, createBoard, deleteBoard } = useKanbanBoards();
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const [boardForm, setBoardForm] = useState({
    name: '',
    description: '',
    client_id: ''
  });

  React.useEffect(() => {
    // Load clients
    const loadClients = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('client_profiles').select('*');
      setClients(data || []);
    };
    loadClients();
  }, []);

  const handleCreateBoard = async () => {
    if (!boardForm.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const boardData = {
      name: boardForm.name,
      description: boardForm.description,
      client_id: boardForm.client_id || null,
      is_active: true,
      board_order: boards.length
    };

    const newBoard = await createBoard(boardData);
    if (newBoard) {
      setSelectedBoardId(newBoard.id);
      setIsCreateDialogOpen(false);
      setBoardForm({ name: '', description: '', client_id: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Kanban className="h-8 w-8" />
            Kanban - Gestão de Projetos
          </h1>
          <p className="text-muted-foreground">
            Gerencie projetos e tarefas com quadros Kanban
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Quadro
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quadros Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {boards.map((board) => (
                <Button
                  key={board.id}
                  variant={selectedBoardId === board.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedBoardId(board.id)}
                >
                  <div>
                    <div className="font-medium">{board.name}</div>
                    {board.description && (
                      <div className="text-xs text-muted-foreground">{board.description}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {selectedBoardId ? (
            <KanbanBoard boardId={selectedBoardId} />
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Kanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Selecione um quadro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Escolha um quadro à esquerda ou crie um novo
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Quadro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome do Quadro *</label>
              <Input
                value={boardForm.name}
                onChange={(e) => setBoardForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Desenvolvimento de Sistema"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={boardForm.description}
                onChange={(e) => setBoardForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o projeto..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <Select
                value={boardForm.client_id}
                onValueChange={(value) => setBoardForm(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBoard}>
                Criar Quadro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}