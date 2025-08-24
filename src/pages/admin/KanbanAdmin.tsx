
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { BoardEditDialog } from '@/components/kanban/BoardEditDialog';
import { KanbanAdminHeader } from '@/components/kanban/KanbanAdminHeader';
import { KanbanBoardSidebar } from '@/components/kanban/KanbanBoardSidebar';
import { KanbanCreateBoardDialog } from '@/components/kanban/KanbanCreateBoardDialog';
import { useKanbanBoards } from '@/hooks/useKanbanBoards';
import { Kanban, Plus } from 'lucide-react';

export default function KanbanAdmin() {
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useKanbanBoards();
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<any>(null);

  React.useEffect(() => {
    if (boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

  const handleCreateBoard = async (boardData: any) => {
    const newBoard = await createBoard({
      ...boardData,
      board_order: boards.length
    });
    if (newBoard) {
      setSelectedBoardId(newBoard.id);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <KanbanAdminHeader onCreateBoard={() => setIsCreateDialogOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-1">
          <KanbanBoardSidebar
            boards={boards}
            selectedBoardId={selectedBoardId}
            onSelectBoard={setSelectedBoardId}
            onEditBoard={setEditingBoard}
            onDeleteBoard={handleDeleteBoard}
          />
        </div>

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

      <KanbanCreateBoardDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateBoard={handleCreateBoard}
      />

      <BoardEditDialog
        board={editingBoard}
        isOpen={!!editingBoard}
        onClose={() => setEditingBoard(null)}
        onUpdate={updateBoard}
      />
    </div>
  );
}
