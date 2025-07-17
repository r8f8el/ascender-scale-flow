
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  FileSpreadsheet,
  Link,
  Zap,
  Filter,
  BarChart3
} from 'lucide-react';

const AdminFPADataIntegration = () => {
  const [selectedClient, setSelectedClient] = useState('techcorp');

  // Mock data sources
  const dataSources = [
    {
      id: 1,
      name: "ERP Sistema Principal",
      type: "ERP",
      status: "connected",
      lastSync: "2024-03-20T10:30:00",
      integration: "API",
      client: "TechCorp Ltda",
      records: 15420,
      health: 95
    },
    {
      id: 2,
      name: "CRM Vendas",
      type: "CRM",
      status: "syncing",
      lastSync: "2024-03-20T09:45:00",
      integration: "Webhook",
      client: "TechCorp Ltda",
      records: 8750,
      health: 88
    },
    {
      id: 3,
      name: "Planilhas Financeiras",
      type: "Excel",
      status: "error",
      lastSync: "2024-03-19T16:20:00",
      integration: "Upload",
      client: "InnovateLab S.A.",
      records: 2340,
      health: 45
    },
    {
      id: 4,
      name: "Sistema RH",
      type: "HRIS",
      status: "connected",
      lastSync: "2024-03-20T08:00:00",
      integration: "API",
      client: "GreenTech Solutions",
      records: 1250,
      health: 92
    }
  ];

  // Mock data mapping
  const dataMappings = [
    {
      source: "ERP Sistema Principal",
      sourceField: "vendas_liquidas",
      targetField: "receita_operacional",
      transformation: "SUM(vendas_liquidas) GROUP BY mes",
      status: "mapped",
      confidence: 98
    },
    {
      source: "ERP Sistema Principal",
      sourceField: "custo_mercadorias",
      targetField: "custo_produtos_vendidos",
      transformation: "SUM(custo_mercadorias) GROUP BY mes",
      status: "mapped",
      confidence: 95
    },
    {
      source: "CRM Vendas",
      sourceField: "numero_leads",
      targetField: "leads_gerados",
      transformation: "COUNT(DISTINCT lead_id) GROUP BY mes",
      status: "review",
      confidence: 78
    },
    {
      source: "Sistema RH",
      sourceField: "total_funcionarios",
      targetField: "headcount",
      transformation: "COUNT(funcionarios_ativos) GROUP BY mes",
      status: "mapped",
      confidence: 100
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-700">Conectado</Badge>;
      case 'syncing': return <Badge className="bg-blue-100 text-blue-700">Sincronizando</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-700">Erro</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getMappingStatusBadge = (status: string) => {
    switch (status) {
      case 'mapped': return <Badge className="bg-green-100 text-green-700">Mapeado</Badge>;
      case 'review': return <Badge className="bg-yellow-100 text-yellow-700">Em Revisão</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-700">Erro</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integração de Dados</h1>
          <p className="text-gray-600 mt-1">
            Gerencie conexões e transformações de dados para os modelos FP&A
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fontes Conectadas</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">9 ativas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registros/Dia</p>
                <p className="text-2xl font-bold">45K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Volume médio</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualidade Média</p>
                <p className="text-2xl font-bold">89%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600">Excelente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sincronizações</p>
                <p className="text-2xl font-bold">24/7</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-purple-600">Tempo real</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Fontes de Dados</TabsTrigger>
          <TabsTrigger value="mapping">Mapeamento</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6">
          {/* Client Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtrar por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="client">Cliente</Label>
                  <select 
                    id="client"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">Todos os Clientes</option>
                    <option value="techcorp">TechCorp Ltda</option>
                    <option value="innovatelab">InnovateLab S.A.</option>
                    <option value="greentech">GreenTech Solutions</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Fonte</Label>
                  <select id="type" className="w-full p-2 border rounded-md">
                    <option value="all">Todos os Tipos</option>
                    <option value="erp">ERP</option>
                    <option value="crm">CRM</option>
                    <option value="excel">Excel/CSV</option>
                    <option value="api">API</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" className="w-full p-2 border rounded-md">
                    <option value="all">Todos os Status</option>
                    <option value="connected">Conectado</option>
                    <option value="error">Erro</option>
                    <option value="syncing">Sincronizando</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <div className="space-y-4">
            {dataSources.map((source) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(source.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                          <p className="text-sm text-gray-600">{source.client}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Tipo</p>
                          <p className="font-medium">{source.type}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Integração</p>
                          <p className="font-medium">{source.integration}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Registros</p>
                          <p className="font-medium">{source.records.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Qualidade</p>
                          <div className="flex items-center gap-2">
                            <Progress value={source.health} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{source.health}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Última Sync</p>
                          <p className="font-medium text-sm">{formatDate(source.lastSync)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(source.status)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <RefreshCw className="h-4 w-4" />
                          Sync
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Settings className="h-4 w-4" />
                          Config
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          {/* Data Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Mapeamento de Campos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataMappings.map((mapping, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{mapping.source}</h4>
                          {getMappingStatusBadge(mapping.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Campo Origem</p>
                            <p className="font-medium">{mapping.sourceField}</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-600">Campo Destino</p>
                            <p className="font-medium">{mapping.targetField}</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-600">Transformação</p>
                            <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                              {mapping.transformation}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Confiança:</span>
                          <span className="font-medium">{mapping.confidence}%</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Testar</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          {/* Data Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Validação de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Dados Válidos</h3>
                        <p className="text-2xl font-bold text-green-600">94.2%</p>
                        <p className="text-sm text-gray-600">42,340 registros</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Avisos</h3>
                        <p className="text-2xl font-bold text-yellow-600">4.8%</p>
                        <p className="text-sm text-gray-600">2,180 registros</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">Erros</h3>
                        <p className="text-2xl font-bold text-red-600">1.0%</p>
                        <p className="text-sm text-gray-600">450 registros</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Regras de Validação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span>Receita deve ser > 0</span>
                        <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span>Data deve estar no formato correto</span>
                        <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span>CNPJ deve ser válido</span>
                        <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoring Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volume de Dados (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Gráfico de Volume de Dados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latência de Sincronização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Gráfico de Latência</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status das Fontes em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(source.status)}
                      <span className="font-medium">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {source.records.toLocaleString()} registros
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(source.lastSync)}
                      </span>
                      {getStatusBadge(source.status)}
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

export default AdminFPADataIntegration;
