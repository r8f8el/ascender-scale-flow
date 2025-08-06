
import React from 'react';
import DocumentManager from '@/components/DocumentManager';

const ClientDocumentsAdmin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Documentos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie documentos de todos os clientes com recursos administrativos avançados
        </p>
      </div>
      
      <DocumentManager isAdmin={true} />
    </div>
  );
};

export default ClientDocumentsAdmin;
