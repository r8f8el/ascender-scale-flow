
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClientDocuments = () => {
  const { user, client } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dados mockados para demonstração
  const documents = [
    {
      id: '1',
      name: 'Contrato de Prestação de Serviços.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploaded_at: '2024-01-15T10:30:00Z',
      category: 'contratos'
    },
    {
      id: '2',
      name: 'Relatório Mensal Janeiro.xlsx',
      type: 'excel',
      size: '1.8 MB',
      uploaded_at: '2024-01-10T14:20:00Z',
      category: 'relatorios'
    },
    {
      id: '3',
      name: 'Apresentação Resultados Q1.pptx',
      type: 'powerpoint',
      size: '5.2 MB',
      uploaded_at: '2024-01-05T09:15:00Z',
      category: 'apresentacoes'
    }
  ];

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = () => {
    toast.info('Funcionalidade de upload em desenvolvimento');
  };

  const handleView = (docId: string) => {
    toast.info(`Visualizando documento ${docId}`);
  };

  const handleDownload = (docId: string) => {
    toast.info(`Fazendo download do documento ${docId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus documentos e arquivos
          </p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Enviar Arquivo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome do documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="recentes">Recentes</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Faça upload de seus primeiros documentos'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium text-gray-900">{doc.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</span>
                            <Badge variant="outline" className="ml-2 capitalize">
                              {doc.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleView(doc.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recentes">
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Documentos Recentes</h3>
              <p className="text-gray-600">
                Documentos enviados nos últimos 7 dias aparecerão aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contratos">
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Contratos</h3>
              <p className="text-gray-600">
                Seus contratos e documentos legais aparecerão aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
              <p className="text-gray-600">
                Relatórios e análises aparecerão aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDocuments;
