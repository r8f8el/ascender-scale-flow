import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { useToast } from '@/hooks/use-toast';

interface Cliente {
  id: string;
  name: string;
  company: string | null;
}

interface Cronograma {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  client_profiles?: Cliente;
  schedule_phases?: Etapa[];
}

interface Etapa {
  id: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  phase_order: number;
}

const CronogramasAdmin = () => {
  const { toast } = useToast();
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [cronogramaSelecionado, setCronogramaSelecionado] = useState<Cronograma | null>(null);
  const [novoCronograma, setNovoCronograma] = useState({
    client_id: '',
    title: '',
    etapas: [{
      id: Date.now().toString(),
      description: '',
      start_date: '',
      end_date: '',
      status: 'pending'
    }]
  });
  const [tabAtual, setTabAtual] = useState('todos');

  useEffect(() => {
    loadCronogramas();
    loadClientes();
  }, []);

  const loadCronogramas = async () => {
    try {
      const { data, error } = await supabase
        .from('project_schedules')
        .select(`
          *,
          client_profiles(id, name, company),
          schedule_phases(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCronogramas(data || []);
    } catch (error) {
      console.error('Erro ao carregar cronogramas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cronogramas.",
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

  // Filtragem dos cronogramas
  const cronogramasFiltrados = cronogramas.filter(cronograma => {
    const correspondeAoTermo = cronograma.title.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              (cronograma.client_profiles?.name && cronograma.client_profiles.name.toLowerCase().includes(termoBusca.toLowerCase()));
    const correspondeAoCliente = filtroCliente ? cronograma.client_profiles?.id === filtroCliente : true;
    
    if (tabAtual === 'todos') {
      return correspondeAoTermo && correspondeAoCliente;
    } else if (tabAtual === 'publicados') {
      return correspondeAoTermo && correspondeAoCliente && cronograma.published;
    } else {
      return correspondeAoTermo && correspondeAoCliente && !cronograma.published;
    }
  });

  const resetarFormulario = () => {
    setNovoCronograma({
      client_id: '',
      title: '',
      etapas: [{
        id: Date.now().toString(),
        description: '',
        start_date: '',
        end_date: '',
        status: 'pending'
      }]
    });
    setCronogramaSelecionado(null);
  };

  const abrirEdicao = (cronograma: Cronograma) => {
    setCronogramaSelecionado(cronograma);
    setNovoCronograma({
      client_id: cronograma.client_profiles?.id || '',
      title: cronograma.title,
      etapas: cronograma.schedule_phases?.map(fase => ({
        id: fase.id,
        description: fase.description,
        start_date: fase.start_date,
        end_date: fase.end_date,
        status: fase.status
      })) || []
    });
    setDialogAberto(true);
  };

  const adicionarEtapa = () => {
    const novasEtapas = [...novoCronograma.etapas, {
      id: Date.now().toString(),
      description: '',
      start_date: '',
      end_date: '',
      status: 'pending'
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

  const salvarCronograma = async () => {
    if (!novoCronograma.client_id || !novoCronograma.title) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validar cada etapa
    for (const etapa of novoCronograma.etapas) {
      if (!etapa.description || !etapa.start_date || !etapa.end_date) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todas as informações das etapas",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      if (cronogramaSelecionado) {
        // Editar cronograma existente
        const { error: scheduleError } = await supabase
          .from('project_schedules')
          .update({
            client_id: novoCronograma.client_id,
            title: novoCronograma.title
          })
          .eq('id', cronogramaSelecionado.id);

        if (scheduleError) throw scheduleError;

        // Deletar etapas antigas
        const { error: deleteError } = await supabase
          .from('schedule_phases')
          .delete()
          .eq('schedule_id', cronogramaSelecionado.id);

        if (deleteError) throw deleteError;

        // Inserir novas etapas
        const etapasData = novoCronograma.etapas.map((etapa, index) => ({
          schedule_id: cronogramaSelecionado.id,
          description: etapa.description,
          start_date: etapa.start_date,
          end_date: etapa.end_date,
          status: etapa.status,
          phase_order: index + 1
        }));

        const { error: phasesError } = await supabase
          .from('schedule_phases')
          .insert(etapasData);

        if (phasesError) throw phasesError;

        toast({
          title: "Sucesso",
          description: "Cronograma atualizado com sucesso!"
        });
      } else {
        // Adicionar novo cronograma
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('project_schedules')
          .insert([{
            client_id: novoCronograma.client_id,
            title: novoCronograma.title,
            published: false
          }])
          .select()
          .single();

        if (scheduleError) throw scheduleError;

        // Inserir etapas
        const etapasData = novoCronograma.etapas.map((etapa, index) => ({
          schedule_id: scheduleData.id,
          description: etapa.description,
          start_date: etapa.start_date,
          end_date: etapa.end_date,
          status: etapa.status,
          phase_order: index + 1
        }));

        const { error: phasesError } = await supabase
          .from('schedule_phases')
          .insert(etapasData);

        if (phasesError) throw phasesError;

        toast({
          title: "Sucesso",
          description: "Cronograma criado com sucesso!"
        });
      }
      
      setDialogAberto(false);
      resetarFormulario();
      loadCronogramas();
    } catch (error: any) {
      console.error('Erro ao salvar cronograma:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar cronograma.",
        variant: "destructive"
      });
    }
  };

  const excluirCronograma = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cronograma?')) {
      try {
        const { error } = await supabase
          .from('project_schedules')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Cronograma excluído com sucesso!"
        });
        
        loadCronogramas();
      } catch (error: any) {
        console.error('Erro ao excluir cronograma:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir cronograma.",
          variant: "destructive"
        });
      }
    }
  };

  const alterarStatusPublicacao = async (id: string, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('project_schedules')
        .update({ published: novoStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Cronograma ${novoStatus ? 'publicado' : 'despublicado'} com sucesso!`
      });
      
      loadCronogramas();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status da publicação.",
        variant: "destructive"
      });
    }
  };

  const alterarStatusEtapa = async (cronogramaId: string, etapaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('schedule_phases')
        .update({ status: novoStatus })
        .eq('id', etapaId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Status da etapa atualizado!"
      });
      
      loadCronogramas();
    } catch (error: any) {
      console.error('Erro ao alterar status da etapa:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status da etapa.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando cronogramas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Edição e Publicação de Cronogramas</h2>
        
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
                    value={novoCronograma.client_id} 
                    onValueChange={(value) => setNovoCronograma({...novoCronograma, client_id: value})}
                  >
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
                  <label htmlFor="titulo" className="text-sm font-medium">Título do Cronograma*</label>
                  <Input
                    id="titulo"
                    value={novoCronograma.title}
                    onChange={(e) => setNovoCronograma({...novoCronograma, title: e.target.value})}
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
                            value={etapa.description}
                            onChange={(e) => atualizarEtapa(index, 'description', e.target.value)}
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
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="in_progress">Em Andamento</SelectItem>
                                <SelectItem value="completed">Concluído</SelectItem>
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
                            value={etapa.start_date}
                            onChange={(e) => atualizarEtapa(index, 'start_date', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Data Fim*</label>
                          <Input
                            type="date"
                            value={etapa.end_date}
                            onChange={(e) => atualizarEtapa(index, 'end_date', e.target.value)}
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
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.name}
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
                  <h3 className="text-lg font-medium">{cronograma.title}</h3>
                  <p className="text-sm text-gray-500">
                    Cliente: {cronograma.client_profiles?.name || 'N/A'} | 
                    Atualizado em: {new Date(cronograma.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={cronograma.published ? "outline" : "default"}
                    size="sm"
                    onClick={() => alterarStatusPublicacao(cronograma.id, !cronograma.published)}
                  >
                    {cronograma.published ? 'Despublicar' : 'Publicar'}
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
                  {cronograma.schedule_phases?.map((etapa) => (
                    <li key={etapa.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        {etapa.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {etapa.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
                        {etapa.status === 'pending' && <AlertCircle className="h-4 w-4 text-gray-500" />}
                        <span className="text-sm">{etapa.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(etapa.start_date).toLocaleDateString('pt-BR')} - {new Date(etapa.end_date).toLocaleDateString('pt-BR')}
                        </span>
                        <Select
                          value={etapa.status}
                          onValueChange={(value) => alterarStatusEtapa(cronograma.id, etapa.id, value)}
                        >
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum cronograma encontrado</h3>
              <p className="text-muted-foreground text-center">
                Comece criando seu primeiro cronograma clicando no botão "Novo Cronograma"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CronogramasAdmin;