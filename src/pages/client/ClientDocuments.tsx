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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Área do Cliente
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seus documentos de forma organizada</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg">
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Folder size={16} />
            <span className="hidden sm:inline">Todos</span>
          </TabsTrigger>
          {categories.map((category) => {
            const IconComponent = getIconByName(category.icon);
            const documentsCount = getDocumentsByCategory(category.id).length;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent size={16} style={{ color: category.color }} />
                <span className="hidden sm:inline">{category.name}</span>
                {documentsCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {documentsCount}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => {
              const IconComponent = getIconByName(category.icon);
              const documentsCount = getDocumentsByCategory(category.id).length;
              return (
                <Card 
                  key={category.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 hover:scale-105 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                      <IconComponent 
                        size={32} 
                        className="text-primary group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{category.description}</p>
                    <Badge 
                      variant="secondary" 
                      className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    >
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
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                    <Folder size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Nenhum documento encontrado
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Comece enviando o primeiro documento para a categoria {category.name.toLowerCase()}.
                  </p>
                  <Button 
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Upload size={16} className="mr-2" />
                    Enviar Documento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getDocumentsByCategory(category.id).map((document) => (
                  <Card 
                    key={document.id} 
                    className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                          <FileText size={20} className="text-primary" />
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleView(document)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDownload(document)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {document.filename}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                          {formatFileSize(document.file_size)}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/60"></span>
                          {new Date(document.created_at).toLocaleDateString('pt-BR')}
                        </p>
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