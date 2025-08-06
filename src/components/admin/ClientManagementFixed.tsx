
import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  cnpj?: string;
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
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    company: '',
    cnpj: '',
    industry: '',
    phone: ''
  });

  // Carregar clientes
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
        fpa_data: client.fpa_clients?.[0] || {
          industry: null,
          onboarding_completed: false,
          current_phase: 1
        }
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

  const handleCreateClient = async () => {
    if (!newClientData.name || !newClientData.email || !newClientData.company) {
      toast({
        title: "Erro",
        description: "Nome, email e empresa são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newClientData.email,
        password: Math.random().toString(36).slice(-8), // Senha temporária
        email_confirm: true,
        user_metadata: {
          name: newClientData.name,
          company: newClientData.company
        }
      });

      if (authError) throw authError;

      // O profile será criado automaticamente via trigger
      // Aguardar um momento para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar dados adicionais se necessário
      if (newClientData.cnpj || newClientData.industry) {
        const { error: updateError } = await supabase
          .from('client_profiles')
          .update({
            cnpj: newClientData.cnpj || null
          })
          .eq('id', authData.user.id);

        if (updateError) console.error('Erro ao atualizar profile:', updateError);

        // Atualizar dados FPA se necessário
        if (newClientData.industry) {
          const { error: fpaError } = await supabase
            .from('fpa_clients')
            .update({
              industry: newClientData.industry
            })
            .eq('client_profile_id', authData.user.id);

          if (fpaError) console.error('Erro ao atualizar FPA:', fpaError);
        }
      }

      toast({
        title: "Sucesso!",
        description: `Cliente ${newClientData.name} criado com sucesso`
      });

      // Limpar formulário e fechar dialog
      setNewClientData({
        name: '',
        email: '',
        company: '',
        cnpj: '',
        industry: '',
        phone: ''
      });
      setIsNewClientDialogOpen(false);

      // Recarregar lista
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'fpa' && client.fpa_data?.onboarding_completed) ||
      (selectedFilter === 'pending' && !client.fpa_data?.onboarding_completed);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Clientes</h1>
          <p className="text-gray-600">Gerencie todos os clientes do sistema</p>
        </div>

        <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Nome do cliente"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  placeholder="Nome da empresa"
                  value={newClientData.company}
                  onChange={(e) => setNewClientData({...newClientData, company: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  value={newClientData.cnpj}
                  onChange={(e) => setNewClientData({...newClientData, cnpj: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="industry">Setor</Label>
                <Select 
                  value={newClientData.industry} 
                  onValueChange={(value) => setNewClientData({...newClientData, industry: value})}
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

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateClient} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Criando...' : 'Criar Cliente'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewClientDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            <SelectItem value="fpa">FP&A Completo</SelectItem>
            <SelectItem value="pending">Pendente Setup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando clientes...</p>
            </CardContent>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-500">
                {clients.length === 0 
                  ? 'Comece criando seu primeiro cliente'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        {client.is_primary_contact && (
                          <Badge variant="secondary">Principal</Badge>
                        )}
                        <Badge 
                          variant={client.fpa_data?.onboarding_completed ? "default" : "outline"}
                        >
                          {client.fpa_data?.onboarding_completed ? 'FP&A Ativo' : 'Setup Pendente'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{client.email}</p>
                      <p className="text-sm text-gray-500">
                        {client.company}
                        {client.fpa_data?.industry && ` • ${client.fpa_data.industry}`}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                        <span>Cliente desde {new Date(client.created_at).toLocaleDateString()}</span>
                        {client.fpa_data?.current_phase && (
                          <span>Fase FP&A: {client.fpa_data.current_phase}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientManagementFixed;
