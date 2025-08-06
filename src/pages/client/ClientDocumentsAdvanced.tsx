
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DocumentManager from '@/components/DocumentManager';

const ClientDocumentsAdvanced = () => {
  const { client } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus documentos com recursos avançados
        </p>
      </div>
      
      <DocumentManager clientId={client?.id} isAdmin={false} />
    </div>
  );
};

export default ClientDocumentsAdvanced;
