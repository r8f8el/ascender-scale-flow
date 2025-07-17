
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const EmptyTicketState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <MessageSquare className="h-12 w-12 mb-4 text-gray-400" />
      <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
      <p className="text-sm mt-2">
        Ajuste seus filtros de busca para encontrar os chamados desejados.
      </p>
    </div>
  );
};
