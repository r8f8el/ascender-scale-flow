import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

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

interface UploadFile {
  file: File;
  category: string;
  description: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const ClientDocuments = () => {
  const { client, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  console.log('📄 ClientDocuments - Cliente:', client?.name);

  // Se ainda está carregando autenticação, mostrar spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner 
          size="xl" 
          text="Carregando perfil..." 
          color="primary"
        />
      </div>
    );
  }

  // Se não tem cliente autenticado, mostrar erro
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Perfil não encontrado</h2>
          <p className="text-gray-500">Não foi possível carregar seus documentos.</p>
        </div>
      </div>
    );
  }

  const categories = [
    'Contratos',
    'Relatórios',
    'Manuais',
    'Projetos',
    'Backups',
    'Outros'
  ];

  const fetchDocuments = async () => {
    if (!client?.id) {
      // Evitar spinner infinito quando não há perfil de cliente
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const [cdRes, docRes] = await Promise.all([
        supabase
          .from('client_documents')
          .select('*')
          .eq('user_id', client.id)
          .order('uploaded_at', { ascending: false }),
        supabase
          .from('documents')
          .select('*, document_categories(name)')
          .eq('user_id', client.id)
          .order('created_at', { ascending: false })
      ]);

      if (cdRes.error) throw cdRes.error;
      if (docRes.error) throw docRes.error;

      const clientDocs = (cdRes.data || []) as any[];
      const legacyDocs = (docRes.data || []).map((d: any) => ({
        id: d.id,
        filename: d.filename,
        file_path: d.file_path,
        content_type: d.content_type,
        file_size: d.file_size ?? 0,
        category: d.document_categories?.name || 'Outros',
        description: null,
        uploaded_at: d.created_at,
        updated_at: d.updated_at
      })) as any[];

      const all = [...clientDocs, ...legacyDocs]
        .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

      setDocuments(all);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar documentos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!client?.id) {
      setLoading(false);
      return;
    }
    fetchDocuments();
  }, [client?.id]);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUploadFiles: UploadFile[] = files.map(file => ({
      file,
      category: 'Outros',
      description: '',
      progress: 0,
      status: 'pending'
    }));
    
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const updateUploadFile = (index: number, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return false;
    }

    return true;
  };

  const uploadSingleFile = async (uploadFile: UploadFile, index: number): Promise<boolean> => {
    if (!client?.id) {
      updateUploadFile(index, { 
        status: 'error', 
        error: 'Cliente não identificado' 
      });
      return false;
    }

    if (!validateFile(uploadFile.file)) {
      updateUploadFile(index, { 
        status: 'error', 
        error: 'Tipo de arquivo não permitido ou muito grande (máx 50MB)' 
      });
      return false;
    }

    try {
      updateUploadFile(index, { status: 'uploading', progress: 10 });

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = uploadFile.file.name.split('.').pop();
      const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `client-${client.id}/${uniqueFileName}`;

      updateUploadFile(index, { progress: 25 });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      updateUploadFile(index, { progress: 70 });

      // Save metadata to database - garantir que user_id seja definido
      const { error: dbError } = await supabase
        .from('client_documents')
        .insert({
          user_id: client.id, // Explicitamente definir o user_id
          filename: uploadFile.file.name,
          file_path: filePath,
          content_type: uploadFile.file.type,
          file_size: uploadFile.file.size,
          category: uploadFile.category,
          description: uploadFile.description || null
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Se falhou inserir no banco, remover do storage
        await supabase.storage
          .from('documents')
          .remove([filePath]);
        throw dbError;
      }

      updateUploadFile(index, { status: 'completed', progress: 100 });
      return true;

    } catch (error) {
      console.error('Erro no upload:', error);
      updateUploadFile(index, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
      return false;
    }
  };

  const handleUploadAll = async () => {
    if (uploadFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo para upload",
        variant: "destructive"
      });
      return;
    }

    if (!client?.id) {
      toast({
        title: "Erro",
        description: "Cliente não identificado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i];
      if (uploadFile.status === 'pending') {
        const success = await uploadSingleFile(uploadFile, i);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast({
        title: "Sucesso!",
        description: `${successCount} arquivo(s) enviado(s) com sucesso!`
      });
      fetchDocuments();
    }

    if (errorCount > 0) {
      toast({
        title: "Atenção",
        description: `${errorCount} arquivo(s) falharam no upload`,
        variant: "destructive"
      });
    }

    if (successCount === uploadFiles.length) {
      setIsUploadDialogOpen(false);
      setUploadFiles([]);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;

      if (data?.signedUrl) {
        const a = window.document.createElement('a');
        a.href = data.signedUrl;
        a.download = document.filename;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
      }

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
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 300); // 5 minutos

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
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
        <LoadingSpinner 
          size="xl" 
          text="Carregando documentos..." 
          color="primary"
        />
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
                Upload de Arquivos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enviar Documentos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="files-upload">Selecionar Arquivos</Label>
                  <Input
                    id="files-upload"
                    type="file"
                    multiple
                    onChange={handleFilesSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Tipos aceitos: PDF, Word, Excel, Imagens, TXT (máx 50MB cada)
                  </p>
                </div>

                {uploadFiles.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    <h4 className="font-semibold">Arquivos Selecionados:</h4>
                    {uploadFiles.map((uploadFile, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">{uploadFile.file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({formatFileSize(uploadFile.file.size)})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {uploadFile.status === 'completed' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Concluído
                              </Badge>
                            )}
                            {uploadFile.status === 'error' && (
                              <Badge variant="secondary" className="bg-red-100 text-red-700">
                                Erro
                              </Badge>
                            )}
                            {uploadFile.status === 'uploading' && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                Enviando...
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUploadFile(index)}
                              disabled={uploadFile.status === 'uploading'}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {uploadFile.status === 'uploading' && (
                          <Progress value={uploadFile.progress} className="w-full" />
                        )}

                        {uploadFile.status === 'error' && uploadFile.error && (
                          <p className="text-sm text-red-600">{uploadFile.error}</p>
                        )}

                        {uploadFile.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Categoria</Label>
                              <Select 
                                value={uploadFile.category}
                                onValueChange={(value) => updateUploadFile(index, { category: value })}
                              >
                                <SelectTrigger className="h-8">
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
                              <Label className="text-xs">Descrição</Label>
                              <Input
                                placeholder="Opcional..."
                                value={uploadFile.description}
                                onChange={(e) => updateUploadFile(index, { description: e.target.value })}
                                className="h-8"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleUploadAll} 
                    disabled={uploadFiles.length === 0 || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? 'Enviando...' : `Enviar ${uploadFiles.length} arquivo(s)`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsUploadDialogOpen(false);
                      setUploadFiles([]);
                    }}
                    disabled={isUploading}
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
