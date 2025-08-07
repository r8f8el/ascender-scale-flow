
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Download, User, Building, Upload, Trash2, Filter, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminDocumentUpload from './AdminDocumentUpload';

interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  created_at: string;
  user_id: string;
  category: string;
  description: string | null;
  uploaded_by_admin_id: string | null;
}

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

const categories = [
  'Contratos',
  'Relatórios', 
  'Manuais',
  'Projetos',
  'Backups',
  'Outros'
];

const DocumentManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForClientId, setUploadForClientId] = useState<string>('');
  const { toast } = useToast();

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, email, company')
        .order('name');
      
      if (error) {
        console.error('Erro ao carregar clientes:', error);
        throw error;
      }
      return data as ClientProfile[];
    }
  });

  const { data: documents = [], isLoading: documentsLoading, refetch: refetchDocuments } = useQuery({
    queryKey: ['admin-documents', selectedClientId, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('client_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (selectedClientId !== 'all') {
        query = query.eq('user_id', selectedClientId);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao carregar documentos:', error);
        throw error;
      }
      return data as Document[];
    }
  });

  const getClientById = (clientId: string) => {
    return clients.find(client => client.id === clientId);
  };

  const filteredDocuments = documents.filter(doc => {
    const client = getClientById(doc.user_id);
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Download iniciado!"
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar documento.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${document.filename}"?`)) {
      return;
    }

    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!"
      });

      refetchDocuments();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir documento",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Contratos': 'bg-blue-100 text-blue-700',
      'Relatórios': 'bg-green-100 text-green-700',
      'Manuais': 'bg-purple-100 text-purple-700',
      'Projetos': 'bg-orange-100 text-orange-700',
      'Backups': 'bg-gray-100 text-gray-700',
      'Outros': 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const documentsGroupedByClient = filteredDocuments.reduce((acc, doc) => {
    const client = getClientById(doc.user_id);
    if (!client) return acc;
    
    if (!acc[client.id]) {
      acc[client.id] = {
        client,
        documents: []
      };
    }
    acc[client.id].documents.push(doc);
    return acc;
  }, {} as Record<string, { client: ClientProfile; documents: Document[] }>);

  const handleUploadForClient = (clientId: string) => {
    setUploadForClientId(clientId);
    setIsUploadDialogOpen(true);
  };

  const handleGeneralUpload = () => {
    setUploadForClientId('');
    setIsUploadDialogOpen(true);
  };

  if (clientsLoading || documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Documentos</h2>
          <p className="text-muted-foreground">Visualize e gerencie documentos de todos os clientes</p>
        </div>
        
        <Button onClick={handleGeneralUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Fazer Upload
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por documento, cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.company || client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="grid gap-6">
        {Object.entries(documentsGroupedByClient).map(([clientId, { client, documents: clientDocuments }]) => (
          <Card key={clientId} className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      <AvatarInitials name={client.name} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {client.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{client.email}</span>
                      {client.company && (
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {client.company}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {clientDocuments.length} {clientDocuments.length === 1 ? 'documento' : 'documentos'}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUploadForClient(client.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-3">
                {clientDocuments.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{document.filename}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {document.description || 'Sem descrição'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(document.file_size)}</span>
                          <span>{formatDate(document.created_at)}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryBadge(document.category)}`}
                          >
                            {document.category}
                          </Badge>
                          {document.uploaded_by_admin_id && (
                            <Badge variant="secondary" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(document)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(document)}
                        className="text-red-600 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(documentsGroupedByClient).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm || selectedClientId !== 'all' || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Ainda não há documentos cadastrados no sistema'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AdminDocumentUpload
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadComplete={refetchDocuments}
        selectedClientId={uploadForClientId}
      />
    </div>
  );
};

export default DocumentManager;
