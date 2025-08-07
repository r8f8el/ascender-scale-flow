
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Upload,
  FolderOpen,
  File,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUploadManager } from '@/hooks/useUploadManager';

interface Document {
  id: string;
  filename: string;
  file_path: string;
  content_type: string | null;
  file_size: number;
  category: string;
  description: string | null;
  uploaded_at: string;
  updated_at: string;
}

const ClientDocuments = () => {
  const { client } = useAuth();
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUploadManager();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFileData, setUploadFileData] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    category: 'Outros',
    description: ''
  });

  console.log('📄 ClientDocuments - Cliente:', client?.name);

  const categories = [
    'Contratos',
    'Relatórios',
    'Manuais',
    'Projetos',
    'Backups',
    'Outros'
  ];

  const fetchDocuments = async () => {
    if (!client?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('user_id', client.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [client?.id]);

  const handleUpload = async () => {
    if (!uploadFileData || !client?.id) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para upload",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await uploadFile(uploadFileData, {
        bucket: 'documents',
        folder: `client-${client.id}`,
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/*'
        ],
        maxSizeBytes: 50 * 1024 * 1024 // 50MB
      });

      // Salvar metadados no banco
      const { error: dbError } = await supabase
        .from('client_documents')
        .insert({
          user_id: client.id,
          filename: uploadFileData.name,
          file_path: result.path,
          content_type: uploadFileData.type,
          file_size: uploadFileData.size,
          category: uploadMetadata.category,
          description: uploadMetadata.description || null
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso!",
        description: `Documento ${uploadFileData.name} enviado com sucesso!`
      });

      setIsUploadDialogOpen(false);
      setUploadFileData(null);
      setUploadMetadata({ category: 'Outros', description: '' });
      fetchDocuments();

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive"
      });
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
        description: "Erro ao baixar documento",
        variant: "destructive"
      });
    }
  };

  const handleView = async (document: Document) => {
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(document.file_path);

      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Erro ao visualizar:', error);
      toast({
        title: "Erro",
        description: "Erro ao visualizar documento",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${document.filename}"?`)) {
      return;
    }

    try {
      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Deletar registro do banco
      const { error: dbError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!"
      });

      fetchDocuments();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir documento",
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (contentType: string | null) => {
    if (!contentType) return <File className="h-5 w-5 text-gray-500" />;
    if (contentType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return <FileText className="h-5 w-5 text-green-500" />;
    if (contentType.includes('document') || contentType.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (contentType.includes('image')) return <FileText className="h-5 w-5 text-purple-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return documents.reduce((total, doc) => total + doc.file_size, 0);
  };

  const getLastUploadDate = () => {
    if (documents.length === 0) return 'N/A';
    const lastDoc = documents.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())[0];
    return formatDate(lastDoc.uploaded_at);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e baixe seus documentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchDocuments}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload de Arquivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Arquivo</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setUploadFileData(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={uploadMetadata.category} 
                    onValueChange={(value) => setUploadMetadata({...uploadMetadata, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição do documento..."
                    value={uploadMetadata.description}
                    onChange={(e) => setUploadMetadata({...uploadMetadata, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!uploadFileData || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? 'Enviando...' : 'Enviar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold">{new Set(documents.map(d => d.category)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Último Upload</p>
                <p className="text-lg font-bold">{getLastUploadDate()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Espaço Usado</p>
                <p className="text-lg font-bold">{formatFileSize(getTotalSize())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Todos
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Seus documentos aparecerão aqui quando forem enviados'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getFileIcon(document.content_type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{document.filename}</h3>
                      <p className="text-sm text-gray-600 mb-2">{document.description || 'Sem descrição'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(document.uploaded_at)}
                        </span>
                        <span>{formatFileSize(document.file_size)}</span>
                        <Badge 
                          variant="outline" 
                          className={getCategoryBadge(document.category)}
                        >
                          {document.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(document)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(document)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientDocuments;
