
import React, { useState } from 'react';
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
import { toast } from 'sonner';

// Dados de exemplo para os arquivos
const arquivosIniciais = [
  { 
    id: '1', 
    nome: 'Relatório Q1 2025.pdf', 
    tipo: 'PDF', 
    cliente: 'Portobello', 
    pasta: 'Relatórios',
    responsavel: 'Amanda Silva',
    tamanho: '2.4 MB',
    dataUpload: '10/05/2025'
  },
  { 
    id: '2', 
    nome: 'Contrato de Prestação de Serviços.docx', 
    tipo: 'DOCX', 
    cliente: 'J.Assy', 
    pasta: 'Contratos',
    responsavel: 'Ricardo Mendes',
    tamanho: '1.8 MB',
    dataUpload: '08/05/2025'
  },
  { 
    id: '3', 
    nome: 'Análise Financeira 2025.xlsx', 
    tipo: 'XLSX', 
    cliente: 'Portobello', 
    pasta: 'Financeiro',
    responsavel: 'Carla Santos',
    tamanho: '3.5 MB',
    dataUpload: '05/05/2025'
  },
  { 
    id: '4', 
    nome: 'Apresentação Inicial.pptx', 
    tipo: 'PPTX', 
    cliente: 'J.Assy', 
    pasta: 'Apresentações',
    responsavel: 'Amanda Silva',
    tamanho: '5.7 MB',
    dataUpload: '01/05/2025'
  },
];

// Lista de clientes para o dropdown
const clientes = [
  { id: '1', nome: 'Portobello' },
  { id: '2', nome: 'J.Assy' },
  { id: '3', nome: 'Ermenegildo Zegna' },
];

// Lista de pastas para o dropdown
const pastas = [
  { id: '1', nome: 'Relatórios' },
  { id: '2', nome: 'Contratos' },
  { id: '3', nome: 'Financeiro' },
  { id: '4', nome: 'Apresentações' },
  { id: '5', nome: 'Outros' },
];

const ArquivosAdmin = () => {
  const [arquivos, setArquivos] = useState(arquivosIniciais);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroPasta, setFiltroPasta] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [nomeNovoArquivo, setNomeNovoArquivo] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [pastaSelecionada, setPastaSelecionada] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [tabAtual, setTabAtual] = useState('todos');

  // Filtragem dos arquivos
  const arquivosFiltrados = arquivos.filter(arquivo => {
    const correspondeAoTermo = arquivo.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              arquivo.tipo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              arquivo.cliente.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              arquivo.pasta.toLowerCase().includes(termoBusca.toLowerCase());
                          
    const correspondeAoCliente = filtroCliente ? arquivo.cliente === filtroCliente : true;
    const correspondeAPasta = filtroPasta ? arquivo.pasta === filtroPasta : true;
    
    if (tabAtual === 'todos') {
      return correspondeAoTermo && correspondeAoCliente && correspondeAPasta;
    } else {
      return correspondeAoTermo && correspondeAoCliente && correspondeAPasta && 
             arquivo.tipo.toLowerCase() === tabAtual;
    }
  });

  const handleUpload = () => {
    if (!nomeNovoArquivo || !clienteSelecionado || !pastaSelecionada || !arquivoSelecionado) {
      toast.error('Por favor, preencha todos os campos e selecione um arquivo');
      return;
    }
    
    // Simular upload
    const extension = arquivoSelecionado.name.split('.').pop()?.toUpperCase() || '';
    const clienteNome = clientes.find(c => c.id === clienteSelecionado)?.nome || '';
    const pastaNome = pastas.find(p => p.id === pastaSelecionada)?.nome || '';
    
    const novoArquivo = {
      id: Date.now().toString(),
      nome: nomeNovoArquivo.includes('.') ? nomeNovoArquivo : `${nomeNovoArquivo}.${extension.toLowerCase()}`,
      tipo: extension,
      cliente: clienteNome,
      pasta: pastaNome,
      responsavel: 'Admin Ascalate', // Usuário logado
      tamanho: `${(arquivoSelecionado.size / (1024 * 1024)).toFixed(1)} MB`,
      dataUpload: new Date().toLocaleDateString('pt-BR')
    };
    
    setArquivos([...arquivos, novoArquivo]);
    toast.success('Arquivo enviado com sucesso!');
    
    // Limpar formulário
    setNomeNovoArquivo('');
    setClienteSelecionado('');
    setPastaSelecionada('');
    setArquivoSelecionado(null);
    setDialogAberto(false);
  };

  const handleExcluirArquivo = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
      const arquivosAtualizados = arquivos.filter(arquivo => arquivo.id !== id);
      setArquivos(arquivosAtualizados);
      toast.success('Arquivo excluído com sucesso');
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

  // Tipos de arquivos para as abas
  const tiposDeArquivo = [
    { valor: 'todos', texto: 'Todos' },
    { valor: 'pdf', texto: 'PDF' },
    { valor: 'docx', texto: 'Word' },
    { valor: 'xlsx', texto: 'Excel' },
    { valor: 'pptx', texto: 'PowerPoint' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Gerenciamento de Arquivos</h2>
        
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
                      {arquivoSelecionado.name} ({(arquivoSelecionado.size / 1024).toFixed(1)} KB)
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
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="pasta" className="text-sm font-medium">Pasta*</label>
                  <Select value={pastaSelecionada} onValueChange={setPastaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      {pastas.map(pasta => (
                        <SelectItem key={pasta.id} value={pasta.id}>
                          {pasta.nome}
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
                <SelectItem key={cliente.id} value={cliente.nome}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroPasta} onValueChange={setFiltroPasta}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por pasta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as pastas</SelectItem>
              {pastas.map(pasta => (
                <SelectItem key={pasta.id} value={pasta.nome}>
                  {pasta.nome}
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
              <TableHead>Cliente</TableHead>
              <TableHead>Pasta</TableHead>
              <TableHead>Responsável</TableHead>
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
                    <span className="truncate max-w-[250px]" title={arquivo.nome}>
                      {arquivo.nome}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({arquivo.tamanho})
                    </span>
                  </TableCell>
                  <TableCell>{arquivo.cliente}</TableCell>
                  <TableCell>{arquivo.pasta}</TableCell>
                  <TableCell>{arquivo.responsavel}</TableCell>
                  <TableCell>{arquivo.dataUpload}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleExcluirArquivo(arquivo.id)}
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
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
