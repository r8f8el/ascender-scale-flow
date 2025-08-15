
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Plus, Trash2, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Aprovador {
  id: string;
  nome: string;
  email: string;
  ordem: number;
}

interface ConfigurarFluxosDialogProps {
  children: React.ReactNode;
}

export const ConfigurarFluxosDialog: React.FC<ConfigurarFluxosDialogProps> = ({ children }) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [aprovadores, setAprovadores] = useState<Aprovador[]>([]);
  const [novoAprovador, setNovoAprovador] = useState({ nome: '', email: '' });

  // Buscar clientes
  const { data: clientes } = useQuery({
    queryKey: ['clientes-para-fluxo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, company')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar fluxo atual do cliente selecionado
  const { data: fluxoAtual } = useQuery({
    queryKey: ['fluxo-aprovadores', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const { data, error } = await supabase
        .from('fluxo_aprovadores')
        .select('*')
        .eq('cliente_id', selectedClient)
        .order('ordem');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClient
  });

  React.useEffect(() => {
    if (fluxoAtual) {
      setAprovadores(fluxoAtual.map(f => ({
        id: f.id,
        nome: f.nome_aprovador,
        email: f.email_aprovador,
        ordem: f.ordem
      })));
    }
  }, [fluxoAtual]);

  const adicionarAprovador = () => {
    if (!novoAprovador.nome || !novoAprovador.email) {
      toast.error('Preencha nome e email do aprovador');
      return;
    }

    const novoItem: Aprovador = {
      id: `temp-${Date.now()}`,
      nome: novoAprovador.nome,
      email: novoAprovador.email,
      ordem: aprovadores.length + 1
    };

    setAprovadores([...aprovadores, novoItem]);
    setNovoAprovador({ nome: '', email: '' });
  };

  const removerAprovador = (id: string) => {
    setAprovadores(aprovadores.filter(a => a.id !== id));
  };

  const salvarFluxo = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente');
      return;
    }

    try {
      // Remover fluxo existente
      await supabase
        .from('fluxo_aprovadores')
        .delete()
        .eq('cliente_id', selectedClient);

      // Inserir novo fluxo
      const fluxoParaInserir = aprovadores.map((aprovador, index) => ({
        cliente_id: selectedClient,
        aprovador_id: selectedClient, // Por enquanto usando o mesmo ID
        nome_aprovador: aprovador.nome,
        email_aprovador: aprovador.email,
        ordem: index + 1
      }));

      const { error } = await supabase
        .from('fluxo_aprovadores')
        .insert(fluxoParaInserir);

      if (error) throw error;

      toast.success('Fluxo de aprovação configurado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
      toast.error('Erro ao salvar fluxo de aprovação');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurar Fluxos de Aprovação
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes?.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.name} - {cliente.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClient && (
            <>
              {/* Lista de Aprovadores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fluxo de Aprovação Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aprovadores.map((aprovador, index) => (
                    <div key={aprovador.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium">{aprovador.nome}</p>
                        <p className="text-sm text-gray-600">{aprovador.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removerAprovador(aprovador.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {aprovadores.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum aprovador configurado
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Adicionar Novo Aprovador */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Adicionar Aprovador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={novoAprovador.nome}
                        onChange={(e) => setNovoAprovador({...novoAprovador, nome: e.target.value})}
                        placeholder="Nome do aprovador"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={novoAprovador.email}
                        onChange={(e) => setNovoAprovador({...novoAprovador, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  <Button onClick={adicionarAprovador} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Aprovador
                  </Button>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={salvarFluxo}>
                  Salvar Fluxo
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
