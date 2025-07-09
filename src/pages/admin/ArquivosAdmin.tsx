import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Upload, Download, Trash, FolderPlus, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

interface Arquivo {
  id: string;
  filename: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  user_id: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  document_categories?: {
    name: string;
    color: string | null;
  };
}

interface Cliente {
  id: string;
  name: string;
  company: string | null;
}

interface Categoria {
  id: string;
  name: string;
  color: string | null;
}

const ArquivosAdmin = () => {
  const { toast } = useToast();
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [nomeNovoArquivo, setNomeNovoArquivo] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [tabAtual, setTabAtual] = useState('todos');

  useEffect(() => {
    loadArquivos();
    loadClientes();
    loadCategorias();
  }, []);

  const loadArquivos = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_categories(name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArquivos(data || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar arquivos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, company')
        .order('name');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  // Filtragem dos arquivos
  const arquivosFiltrados = arquivos.filter(arquivo => {
    const correspondeAoTermo = arquivo.filename.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              (arquivo.content_type && arquivo.content_type.toLowerCase().includes(termoBusca.toLowerCase())) ||
                              (arquivo.document_categories?.name && arquivo.document_categories.name.toLowerCase().includes(termoBusca.toLowerCase()));
                          
    const correspondeAoCliente = filtroCliente ? arquivo.user_id === filtroCliente : true;
    const correspondeACategoria = filtroCategoria ? arquivo.category_id === filtroCategoria : true;
    
    if (tabAtual === 'todos') {
      return correspondeAoTermo && correspondeAoCliente && correspondeACategoria;
    } else {
      // Filtrar por tipo de arquivo baseado na extensão
      const extensao = arquivo.filename.split('.').pop()?.toLowerCase() || '';
      return correspondeAoTermo && correspondeAoCliente && correspondeACategoria && 
             extensao === tabAtual;
    }
  });

  const handleUpload = async () => {
    if (!nomeNovoArquivo || !clienteSelecionado || !categoriaSelecionada || !arquivoSelecionado) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos e selecione um arquivo",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Upload do arquivo para o storage
      const fileExt = arquivoSelecionado.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, arquivoSelecionado);

      if (uploadError) throw uploadError;

      // Inserir registro no banco
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          filename: nomeNovoArquivo.includes('.') ? nomeNovoArquivo : `${nomeNovoArquivo}.${fileExt}`,
          file_path: filePath,
          file_size: arquivoSelecionado.size,
          content_type: arquivoSelecionado.type,
          user_id: clienteSelecionado,
          category_id: categoriaSelecionada
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!"
      });
      
      // Limpar formulário
      setNomeNovoArquivo('');
      setClienteSelecionado('');
      setCategoriaSelecionada('');
      setArquivoSelecionado(null);
      setDialogAberto(false);
      
      loadArquivos();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar arquivo.",
        variant: "destructive"
      });
    }
  };

  const handleExcluirArquivo = async (arquivo: Arquivo) => {
    if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
      try {
        // Deletar arquivo do storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([arquivo.file_path]);

        if (storageError) throw storageError;

        // Deletar registro do banco
        const { error: dbError } = await supabase
          .from('documents')
          .delete()
          .eq('id', arquivo.id);

        if (dbError) throw dbError;

        toast({
          title: "Sucesso",
          description: "Arquivo excluído com sucesso!"
        });
        
        loadArquivos();
      } catch (error: any) {
        console.error('Erro ao excluir arquivo:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir arquivo.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownload = async (arquivo: Arquivo) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(arquivo.file_path);

      if (error) throw error;

      // Criar URL para download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = arquivo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Download iniciado!"
      });
    } catch (error: any) {
      console.error('Erro ao fazer download:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer download do arquivo.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setArquivoSelecionado(file);
      
      // Se o nome do arquivo não foi preenchido manualmente, usar o nome do arquivo selecionado
      if (!nomeNovoArquivo) {
        setNomeNovoArquivo(file.name);
      }
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

  // Tipos de arquivos para as abas
  const tiposDeArquivo = [
    { valor: 'todos', texto: 'Todos' },
    { valor: 'pdf', texto: 'PDF' },
    { valor: 'docx', texto: 'Word' },
    { valor: 'xlsx', texto: 'Excel' },
    { valor: 'pptx', texto: 'PowerPoint' },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando arquivos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Arquivos</h2>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Novo Arquivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Arquivo</DialogTitle>
              <DialogDescription>
                Selecione um arquivo e preencha as informações abaixo para enviar.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="arquivo" className="text-sm font-medium">Selecionar Arquivo*</label>
                  <Input
                    id="arquivo"
                    type="file"
                    onChange={handleFileChange}
                  />
                  {arquivoSelecionado && (
                    <p className="text-xs text-gray-500">
                      {arquivoSelecionado.name} ({formatFileSize(arquivoSelecionado.size)})
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium">Nome do Arquivo*</label>
                  <Input
                    id="nome"
                    value={nomeNovoArquivo}
                    onChange={(e) => setNomeNovoArquivo(e.target.value)}
                    placeholder="Nome do arquivo"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="cliente" className="text-sm font-medium">Cliente*</label>
                  <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.name} {cliente.company && `- ${cliente.company}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="categoria" className="text-sm font-medium">Categoria*</label>
                  <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpload}>
                Enviar Arquivo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e abas */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative grow max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar arquivos..."
              className="pl-9"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
          
          <Select value={filtroCliente} onValueChange={setFiltroCliente}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os clientes</SelectItem>
              {clientes.map(cliente => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categorias.map(categoria => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="todos" value={tabAtual} onValueChange={setTabAtual}>
          <TabsList className="mb-2">
            {tiposDeArquivo.map(tipo => (
              <TabsTrigger key={tipo.valor} value={tipo.valor}>
                {tipo.texto}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <Card>
        <Table>
          <TableCaption>Total de {arquivosFiltrados.length} arquivos encontrados</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arquivosFiltrados.length > 0 ? (
              arquivosFiltrados.map((arquivo) => (
                <TableRow key={arquivo.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="truncate max-w-[250px]" title={arquivo.filename}>
                      {arquivo.filename}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className="px-2 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: arquivo.document_categories?.color || '#e5e7eb',
                        color: '#374151'
                      }}
                    >
                      {arquivo.document_categories?.name || 'Sem categoria'}
                    </span>
                  </TableCell>
                  <TableCell>{formatFileSize(arquivo.file_size)}</TableCell>
                  <TableCell>{new Date(arquivo.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownload(arquivo)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleExcluirArquivo(arquivo)}
                        title="Excluir"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum arquivo encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ArquivosAdmin;