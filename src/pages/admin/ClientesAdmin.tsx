
import React, { useState } from 'react';
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
import { Search, Plus, Edit, Trash, Shield, Key } from 'lucide-react';
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
import { toast } from 'sonner';

// Dados de exemplo para clientes
const clientesIniciais = [
  { id: '1', nome: 'Portobello', cnpj: '05.454.666/0001-09', email: 'contato@portobello.com.br', status: 'ativo' },
  { id: '2', nome: 'J.Assy', cnpj: '09.123.456/0001-21', email: 'financeiro@jassy.com.br', status: 'ativo' },
  { id: '3', nome: 'Ermenegildo Zegna', cnpj: '12.987.654/0001-87', email: 'contato@zegna.com.br', status: 'inativo' },
];

const ClientesAdmin = () => {
  const [clientes, setClientes] = useState(clientesIniciais);
  const [termoBusca, setTermoBusca] = useState('');
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cnpj: '',
    email: '',
    senha: ''
  });
  const [clienteParaEditar, setClienteParaEditar] = useState<null | any>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Filtra clientes baseado no termo de busca
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    cliente.cnpj.includes(termoBusca) ||
    cliente.email.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const resetarFormulario = () => {
    setNovoCliente({ nome: '', cnpj: '', email: '', senha: '' });
    setClienteParaEditar(null);
    setModoEdicao(false);
  };

  const handleAdicionarCliente = () => {
    if (!novoCliente.nome || !novoCliente.cnpj || !novoCliente.email || (!modoEdicao && !novoCliente.senha)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (modoEdicao && clienteParaEditar) {
      // Atualizar cliente existente
      const clientesAtualizados = clientes.map(cliente => 
        cliente.id === clienteParaEditar.id 
          ? { ...cliente, nome: novoCliente.nome, cnpj: novoCliente.cnpj, email: novoCliente.email } 
          : cliente
      );
      setClientes(clientesAtualizados);
      toast.success(`Cliente ${novoCliente.nome} atualizado com sucesso`);
    } else {
      // Adicionar novo cliente
      const novoClienteCompleto = {
        id: Date.now().toString(),
        nome: novoCliente.nome,
        cnpj: novoCliente.cnpj,
        email: novoCliente.email,
        status: 'ativo'
      };
      setClientes([...clientes, novoClienteCompleto]);
      toast.success(`Cliente ${novoCliente.nome} adicionado com sucesso`);
    }
    
    setDialogAberto(false);
    resetarFormulario();
  };

  const handleEditarCliente = (cliente: any) => {
    setNovoCliente({
      nome: cliente.nome,
      cnpj: cliente.cnpj,
      email: cliente.email,
      senha: ''
    });
    setClienteParaEditar(cliente);
    setModoEdicao(true);
    setDialogAberto(true);
  };

  const handleAlterarStatus = (id: string, novoStatus: string) => {
    const clientesAtualizados = clientes.map(cliente => 
      cliente.id === id ? { ...cliente, status: novoStatus } : cliente
    );
    setClientes(clientesAtualizados);
    toast.success(`Status do cliente atualizado para ${novoStatus}`);
  };

  const handleResetarSenha = (cliente: any) => {
    // Simulando reset de senha
    toast.success(`E-mail de redefinição de senha enviado para ${cliente.email}`);
  };

  const handleExcluirCliente = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      const clientesAtualizados = clientes.filter(cliente => cliente.id !== id);
      setClientes(clientesAtualizados);
      toast.success('Cliente excluído com sucesso');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Gestão de Clientes</h2>
        
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
                    <label htmlFor="nome" className="text-sm font-medium">Nome da Empresa*</label>
                    <Input
                      id="nome"
                      value={novoCliente.nome}
                      onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="cnpj" className="text-sm font-medium">CNPJ*</label>
                    <Input
                      id="cnpj"
                      value={novoCliente.cnpj}
                      onChange={(e) => setNovoCliente({...novoCliente, cnpj: e.target.value})}
                      placeholder="00.000.000/0000-00"
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
                      <label htmlFor="senha" className="text-sm font-medium">Senha Inicial*</label>
                      <Input
                        id="senha"
                        type="password"
                        value={novoCliente.senha}
                        onChange={(e) => setNovoCliente({...novoCliente, senha: e.target.value})}
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
          <TableCaption>Lista de clientes cadastrados</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>{cliente.cnpj}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        cliente.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
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
                        onClick={() => handleAlterarStatus(
                          cliente.id, 
                          cliente.status === 'ativo' ? 'inativo' : 'ativo'
                        )}
                        title={cliente.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      >
                        <Shield className="h-4 w-4" />
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
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
