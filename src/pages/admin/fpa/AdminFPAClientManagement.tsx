
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Search, 
  Plus,
  Eye,
  Edit,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react';

const AdminFPAClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock clients data with FP&A workflow status
  const clients = [
    {
      id: 1,
      name: "TechCorp Ltda",
      contact: "João Silva",
      email: "joao@techcorp.com",
      currentPhase: 4,
      totalPhases: 6,
      status: "active",
      nextAction: "Revisar cenários Q2",
      lastUpdate: "2024-03-20",
      consultant: "Ana Silva",
      priority: "high",
      revenue: 2850000,
      healthScore: 78
    },
    {
      id: 2,
      name: "InnovateLab S.A.",
      contact: "Maria Santos",
      email: "maria@innovatelab.com",
      currentPhase: 2,
      totalPhases: 6,
      status: "waiting_data",
      nextAction: "Upload dados março",
      lastUpdate: "2024-03-18",
      consultant: "Carlos Mendes",
      priority: "medium",
      revenue: 1200000,
      healthScore: 65
    },
    {
      id: 3,
      name: "GreenTech Solutions",
      contact: "Pedro Costa",
      email: "pedro@greentech.com",
      currentPhase: 6,
      totalPhases: 6,
      status: "review",
      nextAction: "Reunião de revisão",
      lastUpdate: "2024-03-19",
      consultant: "Ana Silva",
      priority: "high",
      revenue: 4200000,
      healthScore: 85
    },
    {
      id: 4,
      name: "StartupXYZ",
      contact: "Ana Oliveira",
      email: "ana@startupxyz.com",
      currentPhase: 1,
      totalPhases: 6,
      status: "onboarding",
      nextAction: "Completar onboarding",
      lastUpdate: "2024-03-15",
      consultant: "Carlos Mendes",
      priority: "low",
      revenue: 580000,
      healthScore: 52
    }
  ];

  const workflowPhases = [
    { id: 1, name: "Onboarding", description: "Alinhamento estratégico inicial" },
    { id: 2, name: "Dados", description: "Agregação e validação de dados" },
    { id: 3, name: "Modelo", description: "Desenvolvimento do modelo" },
    { id: 4, name: "Cenários", description: "Análise interativa de cenários" },
    { id: 5, name: "Monitoramento", description: "Análise de variação" },
    { id: 6, name: "Relatórios", description: "Assessoria contínua" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
      case 'waiting_data': return <Badge className="bg-yellow-100 text-yellow-700">Aguardando Dados</Badge>;
      case 'review': return <Badge className="bg-blue-100 text-blue-700">Em Revisão</Badge>;
      case 'onboarding': return <Badge className="bg-purple-100 text-purple-700">Onboarding</Badge>;
      case 'paused': return <Badge variant="outline">Pausado</Badge>;
      default: return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Média</Badge>;
      case 'low': return <Badge variant="outline">Baixa</Badge>;
      default: return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'waiting_data': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'review': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'onboarding': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes FP&A</h1>
          <p className="text-gray-600 mt-1">
            Painel de controle para gerenciar o fluxo de trabalho dos clientes
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+3 este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">75% do total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aguardando Ação</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-yellow-600">Requer atenção</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score Médio</p>
                <p className="text-2xl font-bold">72</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-purple-600">Saúde financeira</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="workflow">Por Fase</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          {filteredClients.filter(client => client.status === 'active').map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      {getStatusIcon(client.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.contact} • {client.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Fase Atual</p>
                        <p className="font-medium">
                          {workflowPhases.find(p => p.id === client.currentPhase)?.name}
                        </p>
                        <Progress 
                          value={(client.currentPhase / client.totalPhases) * 100} 
                          className="h-2 mt-1" 
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Receita</p>
                        <p className="font-medium">{formatCurrency(client.revenue)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Health Score</p>
                        <p className="font-medium">{client.healthScore}/100</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Consultor</p>
                        <p className="font-medium">{client.consultant}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Próxima ação: {client.nextAction}</span>
                      <span>•</span>
                      <span>Atualizado em {new Date(client.lastUpdate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(client.status)}
                      {getPriorityBadge(client.priority)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Relatórios
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          {workflowPhases.map((phase) => {
            const phaseClients = filteredClients.filter(client => client.currentPhase === phase.id);
            
            return (
              <Card key={phase.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span>Fase {phase.id}: {phase.name}</span>
                      <p className="text-sm text-gray-600 font-normal mt-1">{phase.description}</p>
                    </div>
                    <Badge variant="outline">{phaseClients.length} clientes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {phaseClients.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum cliente nesta fase</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {phaseClients.map((client) => (
                        <div key={client.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{client.name}</h4>
                            {getStatusBadge(client.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{client.contact}</p>
                          <p className="text-xs text-gray-500">{client.nextAction}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Button variant="outline" size="sm">Ver</Button>
                            <Button variant="outline" size="sm">Ação</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {filteredClients.filter(client => 
            client.status === 'waiting_data' || client.priority === 'high'
          ).map((client) => (
            <Card key={client.id} className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-600">{client.nextAction}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Última atualização: {new Date(client.lastUpdate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(client.priority)}
                    <Button variant="outline" size="sm">
                      Resolver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      {getStatusIcon(client.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.contact} • {client.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Fase Atual</p>
                        <p className="font-medium">
                          {workflowPhases.find(p => p.id === client.currentPhase)?.name}
                        </p>
                        <Progress 
                          value={(client.currentPhase / client.totalPhases) * 100} 
                          className="h-2 mt-1" 
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Receita</p>
                        <p className="font-medium">{formatCurrency(client.revenue)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Health Score</p>
                        <p className="font-medium">{client.healthScore}/100</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Consultor</p>
                        <p className="font-medium">{client.consultant}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Próxima ação: {client.nextAction}</span>
                      <span>•</span>
                      <span>Atualizado em {new Date(client.lastUpdate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(client.status)}
                      {getPriorityBadge(client.priority)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFPAClientManagement;
