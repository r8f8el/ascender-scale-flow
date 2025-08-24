
import React from 'react';
import { Button } from '@/components/ui/button';
import { Kanban, Plus, Sparkles } from 'lucide-react';

interface KanbanAdminHeaderProps {
  onCreateBoard: () => void;
}

export const KanbanAdminHeader: React.FC<KanbanAdminHeaderProps> = ({
  onCreateBoard
}) => {
  return (
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
          onClick={onCreateBoard}
          size="lg"
          className="rounded-2xl px-6 py-3 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Quadro
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
