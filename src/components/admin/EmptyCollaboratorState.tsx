import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from 'lucide-react';

export const EmptyCollaboratorState: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum colaborador encontrado</h3>
        <p className="text-muted-foreground text-center">
          Comece adicionando colaboradores à sua equipe
        </p>
      </CardContent>
    </Card>
  );
};