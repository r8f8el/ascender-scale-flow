
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Users, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  cnpj?: string;
  phone?: string;
  is_primary_contact: boolean;
  created_at: string;
  fpa_data?: {
    industry?: string;
    onboarding_completed: boolean;
    current_phase: number;
  };
}

const ClientManagementFixed = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    cnpj: '',
    phone: '',
    industry: ''
  });

  React.useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select(`
          *,
          fpa_clients (
            industry,
            onboarding_completed,
            current_phase
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedClients = data?.map(client => ({
        ...client,
        fpa_data: client.fpa_clients?.[0] || null
      })) || [];

      setClients(formattedClients);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', company: '', cnpj: '', phone: '', industry: '' });
  };

  const handleCreateClient = async () => {
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: "Erro",
        description: "Nome, email e empresa são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create auth user via signup (not admin API which requires service role)
      const tempPassword = 'Temp' + Math.random().toString(36).slice(-8) + '!1';
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            name: formData.name,
            company: formData.company
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Create client profile directly
      const { error: profileError } = await supabase
        .from('client_profiles')
        .upsert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          cnpj: formData.cnpj || null,
          phone: formData.phone || null,
          is_primary_contact: true
        });

      if (profileError) throw profileError;

      // Update FPA data if industry provided
      if (formData.industry) {
        await supabase
          .from('fpa_clients')
          .update({ industry: formData.industry })
          .eq('client_profile_id', authData.user.id);
      }

      toast({
        title: "Sucesso!",
        description: `Cliente ${formData.name} criado. Senha temporária: ${tempPassword}`
      });

      resetForm();
      setIsNewClientDialogOpen(false);
      await loadClients();
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro ao criar cliente",
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_profiles')
        .update({
          name: formData.name,
          company: formData.company,
          cnpj: formData.cnpj || null,
          phone: formData.phone || null
        })
        .eq('id', selectedClient.id);

      if (error) throw error;

      if (formData.industry) {
        await supabase
          .from('fpa_clients')
          .update({ industry: formData.industry })
          .eq('client_profile_id', selectedClient.id);
      }

      toast({ title: "Sucesso!", description: "Cliente atualizado" });
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      resetForm();
      await loadClients();
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cliente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) return;

    try {
      // Delete FPA data first
      await supabase.from('fpa_clients').delete().eq('client_profile_id', client.id);
      
      const { error } = await supabase
        .from('client_profiles')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Cliente excluído" });
      await loadClients();
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir cliente",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company || '',
      cnpj: client.cnpj || '',
      phone: client.phone || '',
      industry: client.fpa_data?.industry || ''
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (client: Client) => {
    setSelectedClient(client);
    setIsViewDialogOpen(true);
  };

  const filteredClients = clients.filter(client => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const ClientFormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label>Nome Completo *</Label>
        <Input
          placeholder="Nome do cliente"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      {!isEdit && (
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      )}
      <div>
        <Label>Empresa *</Label>
        <Input
          placeholder="Nome da empresa"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>
      <div>
        <Label>CNPJ</Label>
        <Input
          placeholder="XX.XXX.XXX/XXXX-XX"
          value={formData.cnpj}
          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
        />
      </div>
      <div>
        <Label>Telefone</Label>
        <Input
          placeholder="(11) 99999-9999"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <Label>Setor</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => setFormData({ ...formData, industry: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Tecnologia</SelectItem>
            <SelectItem value="finance">Financeiro</SelectItem>
            <SelectItem value="healthcare">Saúde</SelectItem>
            <SelectItem value="retail">Varejo</SelectItem>
            <SelectItem value="manufacturing">Manufatura</SelectItem>
            <SelectItem value="services">Serviços</SelectItem>
            <SelectItem value="other">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os clientes do sistema</p>
        </div>

        <Dialog open={isNewClientDialogOpen} onOpenChange={(open) => { setIsNewClientDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClientFormFields />
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateClient} disabled={isLoading} className="flex-1">
                {isLoading ? 'Criando...' : 'Criar Cliente'}
              </Button>
              <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando clientes...</p>
            </CardContent>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">
                {clients.length === 0 ? 'Comece criando seu primeiro cliente' : 'Tente ajustar os filtros de busca'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{client.name}</h3>
                        {client.is_primary_contact && (
                          <Badge variant="secondary">Principal</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{client.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.company}
                        {client.fpa_data?.industry && ` • ${client.fpa_data.industry}`}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>Desde {new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => openViewDialog(client)} title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(client)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClient(client)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setSelectedClient(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientFormFields isEdit />
          <div className="flex gap-2 pt-4">
            <Button onClick={handleEditClient} disabled={isLoading} className="flex-1">
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => { setIsViewDialogOpen(open); if (!open) setSelectedClient(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedClient.name}</h3>
                  <p className="text-muted-foreground">{selectedClient.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedClient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedClient.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium">{selectedClient.cnpj || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contato Principal</p>
                  <p className="font-medium">{selectedClient.is_primary_contact ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setor</p>
                  <p className="font-medium">{selectedClient.fpa_data?.industry || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente desde</p>
                  <p className="font-medium">{new Date(selectedClient.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagementFixed;
