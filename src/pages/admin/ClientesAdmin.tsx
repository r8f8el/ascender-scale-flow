import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Trash2, Mail, Building, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateFPAClientFromProfile } from '@/hooks/useFPAClients';

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string | null;
  cnpj: string | null;
  is_primary_contact: boolean;
  created_at: string;
}

interface FPAClient {
  id: string;
  client_profile_id: string;
  company_name: string;
  onboarding_completed: boolean;
  current_phase: number;
  created_at: string;
}

const ClientesAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [fpaClients, setFpaClients] = useState<FPAClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createFPAClient = useCreateFPAClientFromProfile();

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFPAClients = async () => {
    try {
      const { data, error } = await supabase
        .from('fpa_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFpaClients(data || []);
    } catch (error) {
      console.error('Error fetching FPA clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchFPAClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateFPAClient = async (clientId: string) => {
    try {
      await createFPAClient.mutateAsync(clientId);
      fetchFPAClients(); // Refresh FPA clients list
    } catch (error) {
      console.error('Error creating FPA client:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isClientInFPA = (clientId: string) => {
    return fpaClients.some(fpaClient => fpaClient.client_profile_id === clientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie os clientes e suas informações (Geral e FP&A)
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Management */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos os Clientes ({filteredClients.length})</TabsTrigger>
          <TabsTrigger value="fpa">Clientes FP&A ({fpaClients.length})</TabsTrigger>
          <TabsTrigger value="general">Apenas Gerais ({filteredClients.filter(c => !isClientInFPA(c.id)).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {clients.length === 0 ? 'Nenhum cliente encontrado' : 'Nenhum cliente corresponde aos filtros'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{client.name}</h4>
                            {client.is_primary_contact && (
                              <Badge variant="secondary">Contato Principal</Badge>
                            )}
                            {isClientInFPA(client.id) && (
                              <Badge className="bg-blue-100 text-blue-700">FP&A</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{client.email}</span>
                            </div>
                            
                            {client.company && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{client.company}</span>
                              </div>
                            )}
                            
                            <span>Desde {formatDate(client.created_at)}</span>
                          </div>
                          
                          {client.cnpj && (
                            <div className="text-sm text-muted-foreground mt-1">
                              CNPJ: {client.cnpj}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!isClientInFPA(client.id) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateFPAClient(client.id)}
                            disabled={createFPAClient.isPending}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Adicionar ao FP&A
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fpa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes FP&A</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClients.filter(client => isClientInFPA(client.id)).map((client) => {
                  const fpaClient = fpaClients.find(fpa => fpa.client_profile_id === client.id);
                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{client.name}</h4>
                            <Badge className="bg-blue-100 text-blue-700">FP&A</Badge>
                            <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{client.email}</span>
                            {fpaClient && (
                              <span>Fase {fpaClient.current_phase}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Apenas Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClients.filter(client => !isClientInFPA(client.id)).map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{client.name}</h4>
                          {client.is_primary_contact && (
                            <Badge variant="secondary">Contato Principal</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          
                          {client.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{client.company}</span>
                            </div>
                          )}
                          
                          <span>Desde {formatDate(client.created_at)}</span>
                        </div>
                        
                        {client.cnpj && (
                          <div className="text-sm text-muted-foreground mt-1">
                            CNPJ: {client.cnpj}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCreateFPAClient(client.id)}
                        disabled={createFPAClient.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Adicionar ao FP&A
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientesAdmin;
