import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { useKanbanBoards } from '@/hooks/useKanbanBoards';
import { useAuth } from '@/contexts/AuthContext';
import { Kanban } from 'lucide-react';

export default function ClientKanban() {
  const { user } = useAuth();
  const { boards, loading } = useKanbanBoards(user?.id);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  React.useEffect(() => {
    if (boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Kanban className="h-8 w-8" />
          Meus Projetos
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o progresso dos seus projetos
        </p>
      </div>

      {boards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Kanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Seus projetos aparecerão aqui quando forem criados pela equipe
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Projetos</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {boards.map((board) => (
                  <button
                    key={board.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedBoardId === board.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedBoardId(board.id)}
                  >
                    <div className="font-medium">{board.name}</div>
                    {board.description && (
                      <div className="text-xs opacity-70 mt-1">{board.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {selectedBoardId && <KanbanBoard boardId={selectedBoardId} />}
          </div>
        </div>
      )}
    </div>
  );
}