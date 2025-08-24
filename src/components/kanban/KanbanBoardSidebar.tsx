
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { KanbanBoard } from '@/hooks/useKanbanBoards';
import { Kanban, MoreVertical, Edit, Trash2 } from 'lucide-react';

interface KanbanBoardSidebarProps {
  boards: KanbanBoard[];
  selectedBoardId: string;
  onSelectBoard: (id: string) => void;
  onEditBoard: (board: KanbanBoard) => void;
  onDeleteBoard: (id: string) => void;
}

export const KanbanBoardSidebar: React.FC<KanbanBoardSidebarProps> = ({
  boards,
  selectedBoardId,
  onSelectBoard,
  onEditBoard,
  onDeleteBoard
}) => {
  return (
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
              onClick={() => onSelectBoard(board.id)}
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
                <DropdownMenuItem onClick={() => onEditBoard(board)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteBoard(board.id)}
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
  );
};
