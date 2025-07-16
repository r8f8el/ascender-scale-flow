import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash, Key } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface Cliente {
  id: string;
  name: string;
  email: string;
  company: string | null;
  cnpj: string | null;
  created_at: string;
}

const ClientesAdmin = () => {
  const { toast } = useToast();
  const { logUserAction, logDataOperation } = useActivityLogger();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [novoCliente, setNovoCliente] = useState({
    name: '',
    company: '',
    email: '',
    password: ''
  });
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    loadClientes();
    logUserAction('access_clients_admin', 'Admin acessou gestão de clientes');
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, email, company, cnpj, created_at')
        .order('name');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra clientes baseado no termo de busca
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.name.toLowerCase().includes(termoBusca.toLowerCase()) ||
    cliente.email.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (cliente.company && cliente.company.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  const resetarFormulario = () => {
    setNovoCliente({ name: '', company: '', email: '', password: '' });
    setClienteParaEditar(null);
    setModoEdicao(false);
  };

  const handleAdicionarCliente = async () => {
    if (!novoCliente.name || !novoCliente.email || (!modoEdicao && !novoCliente.password)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (modoEdicao && clienteParaEditar) {
        // Atualizar cliente existente
        const { error } = await supabase
          .from('client_profiles')
          .update({
            name: novoCliente.name,
            company: novoCliente.company || null,
            email: novoCliente.email
          })
          .eq('id', clienteParaEditar.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: `Cliente ${novoCliente.name} atualizado com sucesso!`
        });

        logDataOperation('update', 'client', `Cliente atualizado: ${novoCliente.name} (${novoCliente.email})`);
      } else {
        // Criar novo usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: novoCliente.email,
          password: novoCliente.password,
          options: {
            data: {
              name: novoCliente.name,
              company: novoCliente.company
            }
          }
        });

        if (authError) throw authError;

        // Se o usuário foi criado com sucesso, criar o perfil do cliente também
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('client_profiles')
            .insert({
              id: authData.user.id,
              name: novoCliente.name,
              email: novoCliente.email,
              company: novoCliente.company || null,
              is_primary_contact: true
            });

          if (profileError) {
            console.warn('Perfil não criado automaticamente:', profileError);
            // Não falha a operação pois o trigger pode ter criado
          }
        }
        
        toast({
          title: "Sucesso",
          description: `Cliente ${novoCliente.name} adicionado com sucesso!`
        });

        logDataOperation('create', 'client', `Novo cliente criado: ${novoCliente.name} (${novoCliente.email})`);
      }
      
      setDialogAberto(false);
      resetarFormulario();
      loadClientes();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar cliente.",
        variant: "destructive"
      });
    }
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setNovoCliente({
      name: cliente.name,
      company: cliente.company || '',
      email: cliente.email,
      password: ''
    });
    setClienteParaEditar(cliente);
    setModoEdicao(true);
    setDialogAberto(true);
  };

  const handleResetarSenha = async (cliente: Cliente) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cliente.email);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `E-mail de redefinição de senha enviado para ${cliente.email}`
      });

      logUserAction('reset_client_password', `Senha resetada para cliente: ${cliente.name} (${cliente.email})`);
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar e-mail de redefinição.",
        variant: "destructive"
      });
    }
  };

  const handleExcluirCliente = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      try {
        // Primeiro, deletar o perfil do cliente
        const { error: profileError } = await supabase
          .from('client_profiles')
          .delete()
          .eq('id', id);

        if (profileError) throw profileError;

        // Depois, tentar deletar o usuário do auth (se possível)
        // Nota: A deleção do auth deve ser feita pelo próprio usuário ou via API admin
        
        toast({
          title: "Sucesso",
          description: "Cliente excluído com sucesso"
        });

        logDataOperation('delete', 'client', `Cliente excluído: ${id}`);
        
        loadClientes();
      } catch (error: any) {
        console.error('Erro ao excluir cliente:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir cliente.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar cliente..."
              className="pl-9 w-[250px]"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
          
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetarFormulario();
                  setDialogAberto(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{modoEdicao ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
                <DialogDescription>
                  {modoEdicao 
                    ? 'Atualize as informações do cliente no formulário abaixo.'
                    : 'Preencha o formulário para cadastrar um novo cliente.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Nome*</label>
                    <Input
                      id="name"
                      value={novoCliente.name}
                      onChange={(e) => setNovoCliente({...novoCliente, name: e.target.value})}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium">Empresa</label>
                    <Input
                      id="company"
                      value={novoCliente.company}
                      onChange={(e) => setNovoCliente({...novoCliente, company: e.target.value})}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">E-mail*</label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                  
                  {!modoEdicao && (
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">Senha Inicial*</label>
                      <Input
                        id="password"
                        type="password"
                        value={novoCliente.password}
                        onChange={(e) => setNovoCliente({...novoCliente, password: e.target.value})}
                        placeholder="********"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdicionarCliente}>
                  {modoEdicao ? 'Salvar Alterações' : 'Adicionar Cliente'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <Table>
          <TableCaption>Lista de {clientes.length} clientes cadastrados</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.name}</TableCell>
                  <TableCell>{cliente.company || '-'}</TableCell>
                  <TableCell>{cliente.cnpj || '-'}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{new Date(cliente.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditarCliente(cliente)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleResetarSenha(cliente)}
                        title="Resetar senha"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleExcluirCliente(cliente.id)}
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
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ClientesAdmin;