import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart3, Calendar, FileCheck, Receipt, Folder, Book, Award, Upload, Download, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  created_at: string;
  category_id: string | null;
  document_categories?: {
    name: string;
    icon: string;
    color: string;
  };
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ClientDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadCategories();
      loadDocuments();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_categories(name, icon, color)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !user || !selectedCategoryForUpload) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo e uma categoria.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: uploadFile.name,
          file_path: filePath,
          file_size: uploadFile.size,
          content_type: uploadFile.type,
          category_id: selectedCategoryForUpload
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!"
      });

      setUploadFile(null);
      setSelectedCategoryForUpload('');
      setIsUploadDialogOpen(false);
      loadDocuments();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao enviar documento.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = async (document: Document) => {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(document.file_path);
      
      window.open(data.publicUrl, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o documento.",
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
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar documento.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Tamanho desconhecido';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIconByName = (iconName: string) => {
    const icons: { [key: string]: any } = {
      FileText,
      BarChart3,
      Calendar,
      FileCheck,
      Receipt,
      Folder,
      Book,
      Award
    };
    return icons[iconName] || Folder;
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category_id === selectedCategory);

  const getDocumentsByCategory = (categoryId: string) => {
    return documents.filter(doc => doc.category_id === categoryId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando documentos...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documentos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus documentos por categoria</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue hover:bg-blue/90">
              <Upload size={18} className="mr-2" />
              Enviar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={selectedCategoryForUpload} onValueChange={setSelectedCategoryForUpload}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => {
                      const IconComponent = getIconByName(category.icon);
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent size={16} style={{ color: category.color }} />
                            {category.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="file">Arquivo *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
              </div>
              
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || !uploadFile || !selectedCategoryForUpload}
                className="w-full"
              >
                {isUploading ? 'Enviando...' : 'Enviar Documento'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Folder size={16} />
            Todos
          </TabsTrigger>
          {categories.slice(0, 4).map((category) => {
            const IconComponent = getIconByName(category.icon);
            const documentsCount = getDocumentsByCategory(category.id).length;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <IconComponent size={16} style={{ color: category.color }} />
                <span className="hidden sm:inline">{category.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {documentsCount}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => {
              const IconComponent = getIconByName(category.icon);
              const documentsCount = getDocumentsByCategory(category.id).length;
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <IconComponent 
                      size={48} 
                      className="mx-auto mb-3" 
                      style={{ color: category.color }} 
                    />
                    <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <Badge variant="secondary">
                      {documentsCount} {documentsCount === 1 ? 'documento' : 'documentos'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="mb-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCategory('all')}
                className="mb-4"
              >
                <ArrowLeft size={16} className="mr-2" />
                Voltar para todas as categorias
              </Button>
              
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const IconComponent = getIconByName(category.icon);
                  return <IconComponent size={32} style={{ color: category.color }} />;
                })()}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>
            </div>

            {getDocumentsByCategory(category.id).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Folder size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum documento nesta categoria
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Faça upload do primeiro documento para {category.name.toLowerCase()}.
                  </p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload size={16} className="mr-2" />
                    Enviar Documento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDocumentsByCategory(category.id).map((document) => (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <FileText size={24} className="text-blue-600 flex-shrink-0" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleView(document)}>
                            <Eye size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(document)}>
                            <Download size={16} />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                        {document.filename}
                      </h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>{formatFileSize(document.file_size)}</p>
                        <p>{new Date(document.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ClientDocuments;