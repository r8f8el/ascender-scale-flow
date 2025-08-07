
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminDocumentUpload from './AdminDocumentUpload';
import { 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Search,
  Filter,
  Users,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  category: string;
  description: string;
  user_id: string;
  uploaded_by_admin_id?: string;
  uploaded_at: string; // Changed from created_at
  updated_at: string;
  user?: {
    name: string;
    company: string;
  };
}

interface Client {
  id: string;
  name: string;
  company: string;
}

const DocumentManager: React.FC<{ clientId?: string; isAdmin?: boolean }> = ({ 
  clientId, 
  isAdmin = false 
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>(clientId || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = [
    'Documentos Fiscais',
    'Contratos',
    'Relatórios Financeiros', 
    'Balancetes',
    'DRE',
    'Fluxo de Caixa',
    'Orçamentos',
    'Outros'
  ];

  const fetchClients = async () => {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, company')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from('client_documents')
        .select(`
          *,
          client_profiles!client_documents_user_id_fkey(name, company)
        `);

      if (!isAdmin && user?.id) {
        query = query.eq('user_id', user.id);
      } else if (selectedClient) {
        query = query.eq('user_id', selectedClient);
      }

      const { data, error } = await query.order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      // Fix the type mapping
      const mappedDocuments = (data || []).map(doc => ({
        ...doc,
        user: Array.isArray(doc.client_profiles) ? doc.client_profiles[0] : doc.client_profiles
      }));
      
      setDocuments(mappedDocuments as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchClients();
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchDocuments();
  }, [selectedClient, user?.id, isAdmin]);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      toast.success('Documento excluído com sucesso');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gerenciamento de Documentos' : 'Meus Documentos'}
          </h2>
          <p className="text-gray-600">
            {isAdmin ? 'Visualizar e gerenciar documentos de todos os clientes' : 'Seus documentos organizados por categoria'}
          </p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Enviar Documentos
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Cliente
            </label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os clientes</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="h-4 w-4 inline mr-1" />
            Categoria
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="h-4 w-4 inline mr-1" />
            Buscar
          </label>
          <Input
            placeholder="Nome do arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory || selectedClient 
                ? 'Tente ajustar os filtros para ver mais resultados'
                : 'Ainda não há documentos carregados'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {document.filename}
                    </CardTitle>
                    {isAdmin && document.user && (
                      <p className="text-sm text-gray-600 mt-1">
                        Cliente: {document.user.name} - {document.user.company}
                      </p>
                    )}
                  </div>
                  <FileText className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{document.category}</Badge>
                  <span className="text-sm text-gray-500">
                    {formatFileSize(document.file_size)}
                  </span>
                </div>

                {document.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {document.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  Enviado em: {formatDate(document.uploaded_at)}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                  
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <AdminDocumentUpload
          clients={clients}
          categories={categories}
          selectedClient={selectedClient}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={() => {
            fetchDocuments();
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
};

export default DocumentManager;
