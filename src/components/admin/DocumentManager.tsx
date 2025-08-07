
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminDocumentUpload from './AdminDocumentUpload';
import { useDocumentCategories } from '@/hooks/useDocumentCategories';
import { 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Search,
  Filter,
  Users,
  FolderOpen,
  Plus
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
  uploaded_at: string;
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
  const [documentsByClientAndCategory, setDocumentsByClientAndCategory] = useState<{
    [clientId: string]: {
      clientInfo: Client;
      categories: {
        [categoryName: string]: {
          categoryInfo: { name: string; color: string; icon: string };
          documents: Document[];
        }
      }
    }
  }>({});

  const { data: documentCategories = [], isLoading: categoriesLoading } = useDocumentCategories();

  // Mapeamento de categorias por nome para facilitar a busca
  const categoryMap = React.useMemo(() => {
    const map: { [key: string]: { name: string; color: string; icon: string } } = {};
    documentCategories.forEach(cat => {
      map[cat.name] = { name: cat.name, color: cat.color, icon: cat.icon };
    });
    return map;
  }, [documentCategories]);

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
          id,
          filename,
          file_path,
          file_size,
          content_type,
          category,
          description,
          user_id,
          uploaded_by_admin_id,
          uploaded_at,
          updated_at
        `);

      if (!isAdmin && user?.id) {
        query = query.eq('user_id', user.id);
      } else if (selectedClient) {
        query = query.eq('user_id', selectedClient);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      const mappedDocuments = (data || []).map((doc: any) => {
        const clientInfo = clients.find(c => c.id === doc.user_id);
        return {
          ...doc,
          user: clientInfo ? { name: clientInfo.name, company: clientInfo.company } : undefined
        };
      }) as Document[];
      
      setDocuments(mappedDocuments);

      // Group documents by client and category for admin view
      if (isAdmin) {
        const grouped = mappedDocuments.reduce((acc, doc) => {
          const clientId = doc.user_id;
          const categoryName = doc.category || 'Outros';
          
          if (!acc[clientId]) {
            acc[clientId] = {
              clientInfo: { 
                id: clientId, 
                name: doc.user?.name || 'Cliente', 
                company: doc.user?.company || 'Empresa' 
              },
              categories: {}
            };
          }
          
          if (!acc[clientId].categories[categoryName]) {
            acc[clientId].categories[categoryName] = {
              categoryInfo: categoryMap[categoryName] || { name: categoryName, color: '#6B7280', icon: 'FileText' },
              documents: []
            };
          }
          
          acc[clientId].categories[categoryName].documents.push(doc);
          return acc;
        }, {} as typeof documentsByClientAndCategory);
        
        setDocumentsByClientAndCategory(grouped);
      }
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
    if (!categoriesLoading) {
      fetchDocuments();
    }
  }, [selectedClient, selectedCategory, user?.id, isAdmin, categoriesLoading, documentCategories, clients]);

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
      const a = window.document.createElement('a');
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
    const categoryName = doc.category || 'Outros';
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());
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

  if (isLoading || categoriesLoading) {
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
            {isAdmin ? 'Visualizar e gerenciar documentos de todos os clientes organizados por categorias' : 'Seus documentos organizados por categoria'}
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
              {documentCategories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="h-4 w-4 inline mr-1" />
            Buscar
          </label>
          <Input
            placeholder="Nome do arquivo, descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Display - Admin view with grouping or regular grid */}
      {isAdmin && !selectedClient && !selectedCategory && !searchTerm ? (
        // Grouped view by client and category
        <div className="space-y-8">
          {Object.entries(documentsByClientAndCategory).map(([clientId, clientData]) => (
            <div key={clientId} className="border rounded-lg p-6 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {clientData.clientInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600">{clientData.clientInfo.company}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(clientData.categories).map(([categoryName, categoryData]) => (
                  <div key={categoryName} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: categoryData.categoryInfo.color }}
                        />
                        <h4 className="font-medium text-gray-900">
                          {categoryData.categoryInfo.name}
                        </h4>
                        <Badge variant="secondary">
                          {categoryData.documents.length} documento(s)
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryData.documents.map((document) => (
                        <div key={document.id} className="bg-white border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-gray-900 line-clamp-1">
                                {document.filename}
                              </h5>
                              {document.description && (
                                <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                                  {document.description}
                                </p>
                              )}
                            </div>
                            <FileText className="h-4 w-4 text-gray-400 ml-2" />
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>{formatFileSize(document.file_size)}</span>
                            <span>{formatDate(document.uploaded_at)}</span>
                          </div>

                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(document)}
                              className="flex-1 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(document.id)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(documentsByClientAndCategory).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600">
                  Ainda não há documentos carregados no sistema
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Regular grid view for filtered results or client view
        <>
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
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: `${categoryMap[document.category || 'Outros']?.color || '#6B7280'}20`, 
                          color: categoryMap[document.category || 'Outros']?.color || '#6B7280' 
                        }}
                      >
                        {document.category || 'Outros'}
                      </Badge>
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
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <AdminDocumentUpload
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
