
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, Download, Trash2, Search, FileText, Image, File, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUploadManager } from '@/hooks/useUploadManager';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string | null;
  category: string;
  client_name: string | null;
  uploaded_at: string;
  file_path: string;
}

interface FileManagerProps {
  isAdmin?: boolean;
}

export const FileManager: React.FC<FileManagerProps> = ({ isAdmin = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [uploading, setUploading] = useState(false);

  const {
    uploadFile,
    uploadMultiple,
    deleteFile,
    isUploading,
    progress,
    validateFile
  } = useUploadManager();

  // Carregar arquivos com cache otimizado
  const {
    data: files = [],
    isLoading,
    refetch: refreshFiles
  } = useOptimizedQuery({
    queryKey: ['files', isAdmin ? 'admin' : 'client'],
    queryFn: async () => {
      let query = supabase.from('files').select('*');
      
      if (!isAdmin && user) {
        query = query.eq('client_id', user.id);
      }
      
      const { data, error } = await query.order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as FileData[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10 // 10 minutos
  });

  const categories = [
    'Sem categoria',
    'Documentos Fiscais',
    'Relatórios',
    'Contratos',
    'Extratos Bancários',
    'Outros'
  ];

  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'image', label: 'Imagens' },
    { value: 'spreadsheet', label: 'Planilhas' },
    { value: 'document', label: 'Documentos' },
    { value: 'other', label: 'Outros' }
  ];

  const getFileIcon = (type: string | null) => {
    if (!type) return <File className="h-4 w-4" />;
    
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

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

  const getFileTypeCategory = (mimeType: string | null) => {
    if (!mimeType) return 'other';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    return 'other';
  };

  const filteredFiles = Array.isArray(files) ? files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesType = selectedType === 'all' || getFileTypeCategory(file.type) === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  }) : [];

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || !user) return;

    const fileArray = Array.from(fileList);
    
    // Validate files individually
    for (const file of fileArray) {
      const isValid = validateFile(file, {
        bucket: 'files',
        allowedTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSizeBytes: 10 * 1024 * 1024 // 10MB
      });
      
      if (!isValid) {
        return;
      }
    }

    setUploading(true);
    try {
      await uploadMultiple(fileArray, {
        bucket: 'files',
        folder: user.id,
        onProgress: (progressValue) => {
          console.log(`Upload progress: ${progressValue}%`);
        }
      });

      toast({
        title: "Sucesso",
        description: "Arquivos enviados com sucesso!"
      });
      
      refreshFiles();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [user, validateFile, uploadMultiple, refreshFiles, toast]);

  const downloadFile = async (file: FileData) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar arquivo",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFile = async (file: FileData) => {
    try {
      await deleteFile('files', file.file_path);

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Arquivo deletado com sucesso!"
      });
      
      refreshFiles();
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar arquivo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Arquivos</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gerencie todos os arquivos do sistema' : 'Seus documentos e arquivos'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => refreshFiles()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button asChild disabled={uploading || isUploading}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading || isUploading ? 'Enviando...' : 'Enviar Arquivos'}
              </span>
            </Button>
          </Label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading || isUploading}
          />
        </div>
      </div>

      {/* Progresso do upload */}
      {(progress > 0 && progress < 100) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando arquivos...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome do arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
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
            
            <div>
              <Label>Tipo de Arquivo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {fileTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de arquivos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Arquivos ({filteredFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {files.length === 0 ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo corresponde aos filtros'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="secondary">{file.category}</Badge>
                        {isAdmin && file.client_name && (
                          <Badge variant="outline">{file.client_name}</Badge>
                        )}
                        <span>{formatDate(file.uploaded_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o arquivo "{file.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteFile(file)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
