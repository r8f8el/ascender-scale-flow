
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, Check, User, Calendar, Trash, Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Dados de exemplo para solicitações
const solicitacoesIniciais = [
  {
    id: '1',
    cliente: 'Portobello',
    titulo: 'Solicito acesso ao relatório trimestral',
    descricao: 'Gostaria de obter acesso ao relatório trimestral de análise financeira que foi mencionado na última reunião. Precisamos desse documento para apresentar ao comitê executivo.',
    status: 'pendente',
    data: '12/05/2025',
    responsavel: null,
    resposta: null,
    prioridade: 'alta',
  },
  {
    id: '2',
    cliente: 'J.Assy',
    titulo: 'Agendamento de reunião com o setor financeiro',
    descricao: 'Solicito uma reunião com a equipe de análise financeira para discutir os resultados do último mês e as projeções para o próximo trimestre.',
    status: 'em-andamento',
    data: '10/05/2025',
    responsavel: 'Amanda Silva',
    resposta: 'Prezado cliente, estamos verificando a disponibilidade da equipe e entraremos em contato em breve para confirmar o horário da reunião.',
    prioridade: 'média',
  },
  {
    id: '3',
    cliente: 'Portobello',
    titulo: 'Dúvida sobre o cronograma',
    descricao: 'Gostaria de esclarecer algumas dúvidas sobre o cronograma apresentado. Em especial, as datas de implementação da fase 2 parecem conflitar com nosso calendário interno.',
    status: 'concluida',
    data: '05/05/2025',
    responsavel: 'Ricardo Mendes',
    resposta: 'Prezado cliente, ajustamos as datas da fase 2 conforme solicitado. O cronograma atualizado já está disponível em seu painel para visualização.',
    prioridade: 'baixa',
  },
];

// Lista de responsáveis
const responsaveis = [
  { id: '1', nome: 'Amanda Silva' },
  { id: '2', nome: 'Ricardo Mendes' },
  { id: '3', nome: 'Carla Santos' },
  { id: '4', nome: 'Admin Ascalate' },
];

const SolicitacoesAdmin = () => {
  const [solicitacoes, setSolicitacoes] = useState(solicitacoesIniciais);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [tabAtual, setTabAtual] = useState('todas');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any | null>(null);
  const [resposta, setResposta] = useState('');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');

  // Filtragem das solicitações
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    const correspondeAoTermo = solicitacao.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                               solicitacao.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
                               solicitacao.cliente.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeAoCliente = filtroCliente ? solicitacao.cliente === filtroCliente : true;
    
    if (tabAtual === 'todas') {
      return correspondeAoTermo && correspondeAoCliente;
    } else if (tabAtual === 'pendentes') {
      return correspondeAoTermo && correspondeAoCliente && solicitacao.status === 'pendente';
    } else if (tabAtual === 'em-andamento') {
      return correspondeAoTermo && correspondeAoCliente && solicitacao.status === 'em-andamento';
    } else {
      return correspondeAoTermo && correspondeAoCliente && solicitacao.status === 'concluida';
    }
  });

  // Lista única de clientes para o filtro
  const clientesUnicos = Array.from(new Set(solicitacoes.map(s => s.cliente))).map(cliente => ({
    nome: cliente
  }));

  const selecionarSolicitacao = (solicitacao: any) => {
    setSolicitacaoSelecionada(solicitacao);
    setResposta(solicitacao.resposta || '');
    setResponsavelSelecionado(solicitacao.responsavel || '');
  };

  const fecharDetalhes = () => {
    setSolicitacaoSelecionada(null);
    setResposta('');
    setResponsavelSelecionado('');
  };

  const atribuirResponsavel = (solicitacaoId: string, responsavel: string) => {
    const solicitacoesAtualizadas = solicitacoes.map(s => 
      s.id === solicitacaoId 
        ? {...s, responsavel, status: 'em-andamento'} 
        : s
    );
    setSolicitacoes(solicitacoesAtualizadas);
    
    if (solicitacaoSelecionada && solicitacaoSelecionada.id === solicitacaoId) {
      setSolicitacaoSelecionada({...solicitacaoSelecionada, responsavel, status: 'em-andamento'});
    }
    
    toast.success('Responsável atribuído com sucesso');
  };

  const salvarResposta = () => {
    if (!solicitacaoSelecionada) return;
    
    if (!resposta.trim()) {
      toast.error('Por favor, digite uma resposta');
      return;
    }
    
    const solicitacoesAtualizadas = solicitacoes.map(s => 
      s.id === solicitacaoSelecionada.id 
        ? {...s, resposta, status: 'concluida'} 
        : s
    );
    setSolicitacoes(solicitacoesAtualizadas);
    setSolicitacaoSelecionada({...solicitacaoSelecionada, resposta, status: 'concluida'});
    
    toast.success('Resposta enviada com sucesso');
  };

  const excluirSolicitacao = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      const solicitacoesAtualizadas = solicitacoes.filter(s => s.id !== id);
      setSolicitacoes(solicitacoesAtualizadas);
      
      if (solicitacaoSelecionada && solicitacaoSelecionada.id === id) {
        fecharDetalhes();
      }
      
      toast.success('Solicitação excluída com sucesso');
    }
  };

  const getPrioridadeClass = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'média': return 'bg-amber-100 text-amber-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-gray-100 text-gray-800';
      case 'em-andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Gerenciamento de Solicitações</h2>
      </div>

      {/* Filtros e abas */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative grow max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar solicitações..."
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
              {clientesUnicos.map((cliente, index) => (
                <SelectItem key={index} value={cliente.nome}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="todas" value={tabAtual} onValueChange={setTabAtual}>
          <TabsList className="mb-2">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de solicitações */}
        <div className={`lg:col-span-${solicitacaoSelecionada ? '1' : '3'} space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2`}>
          {solicitacoesFiltradas.length > 0 ? (
            solicitacoesFiltradas.map((solicitacao) => (
              <Card 
                key={solicitacao.id}
                className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                  solicitacaoSelecionada?.id === solicitacao.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => selecionarSolicitacao(solicitacao)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{solicitacao.titulo}</CardTitle>
                      <CardDescription>{solicitacao.cliente}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(solicitacao.status)}`}>
                        {solicitacao.status === 'pendente' ? 'Pendente' : 
                         solicitacao.status === 'em-andamento' ? 'Em Andamento' : 'Concluída'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadeClass(solicitacao.prioridade)}`}>
                        Prioridade {solicitacao.prioridade}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-gray-600 text-sm truncate">
                    {solicitacao.descricao}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{solicitacao.data}</span>
                  </div>
                  {solicitacao.responsavel ? (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{solicitacao.responsavel}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-amber-600">Não atribuído</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">Nenhuma solicitação encontrada</h3>
              <p className="text-sm mt-2">
                Ajuste seus filtros de busca para encontrar as solicitações desejadas.
              </p>
            </div>
          )}
        </div>

        {/* Detalhes da solicitação */}
        {solicitacaoSelecionada && (
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg pr-8">{solicitacaoSelecionada.titulo}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(solicitacaoSelecionada.status)}`}>
                      {solicitacaoSelecionada.status === 'pendente' ? 'Pendente' : 
                       solicitacaoSelecionada.status === 'em-andamento' ? 'Em Andamento' : 'Concluída'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadeClass(solicitacaoSelecionada.prioridade)}`}>
                      Prioridade {solicitacaoSelecionada.prioridade}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => excluirSolicitacao(solicitacaoSelecionada.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={fecharDetalhes}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Informações da Solicitação</h3>
                    <span className="text-xs text-gray-500">ID: {solicitacaoSelecionada.id}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {solicitacaoSelecionada.cliente.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{solicitacaoSelecionada.cliente}</p>
                        <p className="text-sm text-gray-500">{solicitacaoSelecionada.data}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      {solicitacaoSelecionada.descricao}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Responsável pela Solicitação</h3>
                  </div>
                  <Select 
                    value={solicitacaoSelecionada.responsavel || responsavelSelecionado} 
                    onValueChange={(value) => atribuirResponsavel(solicitacaoSelecionada.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Atribuir responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((resp) => (
                        <SelectItem key={resp.id} value={resp.nome}>
                          {resp.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Resposta</h3>
                  <Textarea
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    placeholder="Digite sua resposta para o cliente"
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="p-4 flex justify-end">
                <Button 
                  disabled={
                    !solicitacaoSelecionada.responsavel && 
                    !responsavelSelecionado
                  } 
                  onClick={salvarResposta}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Responder e Concluir
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitacoesAdmin;
