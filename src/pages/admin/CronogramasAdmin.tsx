
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Plus, Edit, Trash, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

// Lista de clientes para o dropdown
const clientes = [
  { id: '1', nome: 'Portobello' },
  { id: '2', nome: 'J.Assy' },
  { id: '3', nome: 'Ermenegildo Zegna' },
];

// Dados de exemplo para cronogramas
const cronogramasIniciais = [
  {
    id: '1',
    cliente: 'Portobello',
    titulo: 'Implementação de Novo Sistema',
    etapas: [
      { id: '101', descricao: 'Levantamento de Requisitos', dataInicio: '01/05/2025', dataFim: '10/05/2025', status: 'concluido' },
      { id: '102', descricao: 'Análise e Planejamento', dataInicio: '11/05/2025', dataFim: '20/05/2025', status: 'em-andamento' },
      { id: '103', descricao: 'Desenvolvimento', dataInicio: '21/05/2025', dataFim: '10/06/2025', status: 'pendente' },
      { id: '104', descricao: 'Testes e Validação', dataInicio: '11/06/2025', dataFim: '20/06/2025', status: 'pendente' },
      { id: '105', descricao: 'Deploy e Go-Live', dataInicio: '21/06/2025', dataFim: '30/06/2025', status: 'pendente' },
    ],
    publicado: true,
    ultimaAtualizacao: '10/05/2025',
  },
  {
    id: '2',
    cliente: 'J.Assy',
    titulo: 'Consultoria Financeira',
    etapas: [
      { id: '201', descricao: 'Diagnóstico Inicial', dataInicio: '05/05/2025', dataFim: '15/05/2025', status: 'concluido' },
      { id: '202', descricao: 'Análise de Processos', dataInicio: '16/05/2025', dataFim: '30/05/2025', status: 'pendente' },
      { id: '203', descricao: 'Recomendações', dataInicio: '01/06/2025', dataFim: '10/06/2025', status: 'pendente' },
      { id: '204', descricao: 'Implementação', dataInicio: '11/06/2025', dataFim: '25/06/2025', status: 'pendente' },
    ],
    publicado: false,
    ultimaAtualizacao: '05/05/2025',
  }
];

const CronogramasAdmin = () => {
  const [cronogramas, setCronogramas] = useState(cronogramasIniciais);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [cronogramaSelecionado, setCronogramaSelecionado] = useState<any | null>(null);
  const [novoCronograma, setNovoCronograma] = useState({
    cliente: '',
    titulo: '',
    etapas: [{
      id: Date.now().toString(),
      descricao: '',
      dataInicio: '',
      dataFim: '',
      status: 'pendente'
    }]
  });
  const [tabAtual, setTabAtual] = useState('todos');
  const [etapasEditadas, setEtapasEditadas] = useState<any[]>([]);

  // Filtragem dos cronogramas
  const cronogramasFiltrados = cronogramas.filter(cronograma => {
    const correspondeAoTermo = cronograma.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              cronograma.cliente.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeAoCliente = filtroCliente ? cronograma.cliente === filtroCliente : true;
    
    if (tabAtual === 'todos') {
      return correspondeAoTermo && correspondeAoCliente;
    } else if (tabAtual === 'publicados') {
      return correspondeAoTermo && correspondeAoCliente && cronograma.publicado;
    } else {
      return correspondeAoTermo && correspondeAoCliente && !cronograma.publicado;
    }
  });

  const resetarFormulario = () => {
    setNovoCronograma({
      cliente: '',
      titulo: '',
      etapas: [{
        id: Date.now().toString(),
        descricao: '',
        dataInicio: '',
        dataFim: '',
        status: 'pendente'
      }]
    });
    setCronogramaSelecionado(null);
    setEtapasEditadas([]);
  };

  const abrirEdicao = (cronograma: any) => {
    setCronogramaSelecionado(cronograma);
    setNovoCronograma({
      cliente: cronograma.cliente,
      titulo: cronograma.titulo,
      etapas: [...cronograma.etapas]
    });
    setEtapasEditadas([...cronograma.etapas]);
    setDialogAberto(true);
  };

  const adicionarEtapa = () => {
    const novasEtapas = [...novoCronograma.etapas, {
      id: Date.now().toString(),
      descricao: '',
      dataInicio: '',
      dataFim: '',
      status: 'pendente'
    }];
    setNovoCronograma({...novoCronograma, etapas: novasEtapas});
  };

  const removerEtapa = (index: number) => {
    const novasEtapas = [...novoCronograma.etapas];
    novasEtapas.splice(index, 1);
    setNovoCronograma({...novoCronograma, etapas: novasEtapas});
  };

  const atualizarEtapa = (index: number, campo: string, valor: string) => {
    const novasEtapas = [...novoCronograma.etapas];
    novasEtapas[index] = {...novasEtapas[index], [campo]: valor};
    setNovoCronograma({...novoCronograma, etapas: novasEtapas});
  };

  const salvarCronograma = () => {
    if (!novoCronograma.cliente || !novoCronograma.titulo) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar cada etapa
    for (const etapa of novoCronograma.etapas) {
      if (!etapa.descricao || !etapa.dataInicio || !etapa.dataFim) {
        toast.error('Por favor, preencha todas as informações das etapas');
        return;
      }
    }

    const hoje = new Date().toLocaleDateString('pt-BR');

    if (cronogramaSelecionado) {
      // Editar cronograma existente
      const cronogramasAtualizados = cronogramas.map(cron => 
        cron.id === cronogramaSelecionado.id 
          ? {
              ...cron,
              cliente: novoCronograma.cliente,
              titulo: novoCronograma.titulo,
              etapas: novoCronograma.etapas,
              ultimaAtualizacao: hoje
            } 
          : cron
      );
      setCronogramas(cronogramasAtualizados);
      toast.success('Cronograma atualizado com sucesso');
    } else {
      // Adicionar novo cronograma
      const novoCronogramaCompleto = {
        id: Date.now().toString(),
        cliente: novoCronograma.cliente,
        titulo: novoCronograma.titulo,
        etapas: novoCronograma.etapas,
        publicado: false,
        ultimaAtualizacao: hoje
      };
      setCronogramas([...cronogramas, novoCronogramaCompleto]);
      toast.success('Cronograma criado com sucesso');
    }
    
    setDialogAberto(false);
    resetarFormulario();
  };

  const excluirCronograma = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cronograma?')) {
      const cronogramasAtualizados = cronogramas.filter(cron => cron.id !== id);
      setCronogramas(cronogramasAtualizados);
      toast.success('Cronograma excluído com sucesso');
    }
  };

  const alterarStatusPublicacao = (id: string, novoStatus: boolean) => {
    const cronogramasAtualizados = cronogramas.map(cron => 
      cron.id === id ? {...cron, publicado: novoStatus} : cron
    );
    setCronogramas(cronogramasAtualizados);
    toast.success(`Cronograma ${novoStatus ? 'publicado' : 'despublicado'} com sucesso`);
  };

  const alterarStatusEtapa = (cronogramaId: string, etapaId: string, novoStatus: string) => {
    const cronogramasAtualizados = cronogramas.map(cron => 
      cron.id === cronogramaId 
        ? {
            ...cron,
            etapas: cron.etapas.map(etapa => 
              etapa.id === etapaId ? {...etapa, status: novoStatus} : etapa
            ),
            ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
          } 
        : cron
    );
    setCronogramas(cronogramasAtualizados);
    toast.success('Status da etapa atualizado');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Edição e Publicação de Cronogramas</h2>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={resetarFormulario}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cronograma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {cronogramaSelecionado ? 'Editar Cronograma' : 'Criar Novo Cronograma'}
              </DialogTitle>
              <DialogDescription>
                {cronogramaSelecionado 
                  ? 'Atualize as informações do cronograma e suas etapas.'
                  : 'Preencha o formulário para criar um novo cronograma.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="cliente" className="text-sm font-medium">Cliente*</label>
                  <Select 
                    value={novoCronograma.cliente} 
                    onValueChange={(value) => setNovoCronograma({...novoCronograma, cliente: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.nome}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="titulo" className="text-sm font-medium">Título do Cronograma*</label>
                  <Input
                    id="titulo"
                    value={novoCronograma.titulo}
                    onChange={(e) => setNovoCronograma({...novoCronograma, titulo: e.target.value})}
                    placeholder="Ex: Implementação de Sistema"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Etapas do Cronograma</h3>
                    <Button type="button" size="sm" onClick={adicionarEtapa}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Adicionar Etapa
                    </Button>
                  </div>
                  
                  {novoCronograma.etapas.map((etapa, index) => (
                    <Card key={etapa.id} className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Descrição*</label>
                          <Input
                            value={etapa.descricao}
                            onChange={(e) => atualizarEtapa(index, 'descricao', e.target.value)}
                            placeholder="Ex: Levantamento de Requisitos"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="space-y-2 flex-1">
                            <label className="text-xs font-medium">Status</label>
                            <Select
                              value={etapa.status}
                              onValueChange={(value) => atualizarEtapa(index, 'status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="em-andamento">Em Andamento</SelectItem>
                                <SelectItem value="concluido">Concluído</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {novoCronograma.etapas.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="mt-5"
                              onClick={() => removerEtapa(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Data Início*</label>
                          <Input
                            type="date"
                            value={etapa.dataInicio}
                            onChange={(e) => atualizarEtapa(index, 'dataInicio', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Data Fim*</label>
                          <Input
                            type="date"
                            value={etapa.dataFim}
                            onChange={(e) => atualizarEtapa(index, 'dataFim', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarCronograma}>
                {cronogramaSelecionado ? 'Salvar Alterações' : 'Criar Cronograma'}
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
              placeholder="Buscar cronogramas..."
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
        </div>
        
        <Tabs defaultValue="todos" value={tabAtual} onValueChange={setTabAtual}>
          <TabsList className="mb-2">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="publicados">Publicados</TabsTrigger>
            <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cronogramasFiltrados.length > 0 ? (
          cronogramasFiltrados.map((cronograma) => (
            <Card key={cronograma.id} className="overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                <div>
                  <h3 className="text-lg font-medium">{cronograma.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    Cliente: {cronograma.cliente} | Atualizado em: {cronograma.ultimaAtualizacao}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={cronograma.publicado ? "outline" : "default"}
                    size="sm"
                    onClick={() => alterarStatusPublicacao(cronograma.id, !cronograma.publicado)}
                  >
                    {cronograma.publicado ? 'Despublicar' : 'Publicar'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => abrirEdicao(cronograma)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => excluirCronograma(cronograma.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {cronograma.etapas.map((etapa) => (
                    <li key={etapa.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md">
                      <div className="mt-1">
                        {etapa.status === 'concluido' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {etapa.status === 'em-andamento' && <Clock className="h-5 w-5 text-amber-500" />}
                        {etapa.status === 'pendente' && <AlertCircle className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{etapa.descricao}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{etapa.dataInicio} - {etapa.dataFim}</span>
                        </div>
                      </div>
                      <Select
                        value={etapa.status}
                        onValueChange={(value) => alterarStatusEtapa(cronograma.id, etapa.id, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em-andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium">Nenhum cronograma encontrado</h3>
            <p className="text-sm mt-2">
              Crie um novo cronograma ou altere seus filtros de busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CronogramasAdmin;
