import React from 'react';
import DocumentManager from '@/components/admin/DocumentManager';
import ChecklistManager from '@/components/admin/ChecklistManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, ClipboardList } from 'lucide-react';

const ClientDocumentsAdmin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Arquivos & Documentos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie os repositórios de arquivos de clientes e acompanhe as solicitações periódicas.
        </p>
      </div>

      <Tabs defaultValue="files" className="w-full space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Base de Documentos
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Checklist de Solicitações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <DocumentManager isAdmin={true} />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <ChecklistManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDocumentsAdmin;
