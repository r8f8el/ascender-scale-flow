
import React, { useState } from 'react';
import { FileText, Upload, Download, Eye, Edit, Trash2, History, Shield, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUploadManager } from '@/hooks/useUploadManager';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  filename: string;
  file_path: string;
  content_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  category_id?: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
  metadata: {
    tags: string[];
    description?: string;
    deadline?: string;
    signed?: boolean;
    ocr_processed?: boolean;
  };
}

interface DocumentManagerProps {
  clientId?: string;
  isAdmin?: boolean;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ clientId, isAdmin = false }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentMetadata, setDocumentMetadata] = useState({
    tags: '',
    description: '',
    deadline: '',
    category: 'contract'
  });

  const { uploadFile: uploadFileManager, isUploading } = useUploadManager();
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'contract', label: 'Contratos' },
    { value: 'report', label: 'Relatórios' },
    { value: 'invoice', label: 'Faturas' },
    { value: 'legal', label: 'Documentos Legais' },
    { value: 'other', label: 'Outros' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.metadata.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await uploadFileManager(uploadFile, {
        bucket: 'documents',
        folder: clientId ? `client-${clientId}` : 'general',
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*'
        ],
        maxSizeBytes: 50 * 1024 * 1024 // 50MB
      });

      // Simulated OCR processing for images and PDFs
      const shouldProcessOCR = uploadFile.type.includes('image') || uploadFile.type.includes('pdf');
      
      const newDocument: Document = {
        id: crypto.randomUUID(),
        filename: uploadFile.name,
        file_path: result.path,
        content_type: uploadFile.type,
        file_size: uploadFile.size,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: documentMetadata.category,
        version: 1,
        status: 'draft',
        metadata: {
          tags: documentMetadata.tags.split(',').map(tag => tag.trim()),
          description: documentMetadata.description,
          deadline: documentMetadata.deadline,
          signed: false,
          ocr_processed: shouldProcessOCR
        }
      };

      setDocuments([...documents, newDocument]);
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      setDocumentMetadata({ tags: '', description: '', deadline: '', category: 'contract' });

      toast({
        title: "Sucesso!",
        description: `Documento ${uploadFile.name} enviado com sucesso!`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Search e Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Arquivo</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={documentMetadata.category} 
                    onValueChange={(value) => setDocumentMetadata({...documentMetadata, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição do documento..."
                    value={documentMetadata.description}
                    onChange={(e) => setDocumentMetadata({...documentMetadata, description: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    placeholder="contrato, financeiro, urgente..."
                    value={documentMetadata.tags}
                    onChange={(e) => setDocumentMetadata({...documentMetadata, tags: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={documentMetadata.deadline}
                    onChange={(e) => setDocumentMetadata({...documentMetadata, deadline: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={!uploadFile || isUploading}
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

      {/* Lista de Documentos */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-gray-500">
                {documents.length === 0 
                  ? 'Comece enviando seu primeiro documento'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{document.filename}</h3>
                        <Badge className={getStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                        {document.metadata.signed && (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Assinado
                          </Badge>
                        )}
                        {document.metadata.ocr_processed && (
                          <Badge variant="secondary">
                            OCR
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {document.metadata.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>v{document.version}</span>
                        <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>{new Date(document.created_at).toLocaleDateString()}</span>
                        {document.metadata.deadline && (
                          <span className="text-orange-600">
                            Prazo: {new Date(document.metadata.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {document.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {document.metadata.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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

export default DocumentManager;
