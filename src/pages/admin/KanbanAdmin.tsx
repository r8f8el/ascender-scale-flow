
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { BoardEditDialog } from '@/components/kanban/BoardEditDialog';
import { useKanbanBoards } from '@/hooks/useKanbanBoards';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Kanban, Plus, Users, MoreVertical, Edit, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function KanbanAdmin() {
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useKanbanBoards();
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<any>(null);
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

  React.useEffect(() => {
    if (boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

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

  const handleDeleteBoard = async (boardId: string) => {
    if (confirm('Tem certeza que deseja excluir este quadro? Esta ação não pode ser desfeita.')) {
      await deleteBoard(boardId);
      if (selectedBoardId === boardId) {
        setSelectedBoardId(boards.length > 1 ? boards.find(b => b.id !== boardId)?.id || '' : '');
      }
    }
  };

  const selectedBoard = boards.find(board => board.id === selectedBoardId);

  return (
    <div className="space-y-8 p-6">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12" />
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Kanban className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Kanban
                  <span className="ml-2 text-primary">Manager</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Gerencie projetos com agilidade e organização
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size="lg"
            className="rounded-2xl px-6 py-3 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Quadro
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Modern Sidebar */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-b from-card to-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Quadros Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className={`group relative rounded-xl transition-all duration-200 ${
                    selectedBoardId === board.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <button
                    className="w-full text-left p-4 rounded-xl"
                    onClick={() => setSelectedBoardId(board.id)}
                  >
                    <div className="font-medium mb-1">{board.name}</div>
                    {board.description && (
                      <div className={`text-xs opacity-70 ${
                        selectedBoardId === board.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {board.description}
                      </div>
                    )}
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ${
                          selectedBoardId === board.id ? 'text-primary-foreground hover:text-primary-foreground/80' : ''
                        }`}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingBoard(board)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteBoard(board.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              
              {boards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Kanban className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhum quadro criado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board Area */}
        <div className="lg:col-span-4">
          {selectedBoardId ? (
            <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {selectedBoard?.name}
                    </CardTitle>
                    {selectedBoard?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedBoard.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingBoard(selectedBoard)}
                      className="rounded-xl"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Quadro
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <KanbanBoard boardId={selectedBoardId} />
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-0 shadow-lg h-[600px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Kanban className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Selecione um quadro</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Escolha um quadro na barra lateral ou crie um novo para começar
                  </p>
                </div>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Quadro
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Board Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                onClick={() => setIsCreateDialogOpen(false)}
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

      {/* Edit Board Dialog */}
      <BoardEditDialog
        board={editingBoard}
        isOpen={!!editingBoard}
        onClose={() => setEditingBoard(null)}
        onUpdate={updateBoard}
      />
    </div>
  );
}
