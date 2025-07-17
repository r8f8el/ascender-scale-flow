
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  TrendingUp, 
  FileText,
  Search,
  Filter,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';
import FPAClientManager from '@/components/fpa/FPAClientManager';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAReports } from '@/hooks/useFPAReports';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';

const AdminFPAClientManagement = () => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: clients = [] } = useFPAClients();
  const { data: reports = [] } = useFPAReports();
  const { data: financialData = [] } = useFPAFinancialData();

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientReports = reports.filter(r => r.fpa_client_id === selectedClientId);
  const clientFinancialData = financialData.filter(f => f.fpa_client_id === selectedClientId);

  const getClientStats = () => {
    const activeClients = clients.filter(c => c.onboarding_completed).length;
    const onboardingClients = clients.filter(c => !c.onboarding_completed).length;
    const totalReports = reports.length;
    const thisMonthReports = reports.filter(r => 
      new Date(r.created_at).getMonth() === new Date().getMonth()
    ).length;

    return {
      activeClients,
      onboardingClients,
      totalReports,
      thisMonthReports
    };
  };

  const stats = getClientStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes FP&A</h1>
          <p className="text-gray-600 mt-1">
            Gerencie clientes, processos de onboarding e análises
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeClients}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Onboarding</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.onboardingClients}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Building className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Relatórios</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalReports}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-3xl font-bold text-purple-600">{stats.thisMonthReports}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-1">
          <FPAClientManager 
            onClientSelect={setSelectedClientId}
            selectedClientId={selectedClientId}
          />
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {selectedClient.company_name}
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="reports">Relatórios</TabsTrigger>
                    <TabsTrigger value="data">Dados</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Status do Cliente</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Onboarding:</span>
                              <Badge className={selectedClient.onboarding_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {selectedClient.onboarding_completed ? 'Completo' : 'Em Andamento'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Fase Atual:</span>
                              <Badge variant="outline">Fase {selectedClient.current_phase}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Setor:</span>
                              <span className="text-sm">{selectedClient.industry || 'Não definido'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Estatísticas</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Relatórios:</span>
                              <span className="text-sm font-medium">{clientReports.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Períodos:</span>
                              <span className="text-sm font-medium">{clientFinancialData.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Último Relatório:</span>
                              <span className="text-sm">
                                {clientReports[0] ? new Date(clientReports[0].created_at).toLocaleDateString('pt-BR') : 'Nenhum'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {selectedClient.strategic_objectives && (
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Objetivos Estratégicos</h4>
                          <p className="text-sm text-gray-600">{selectedClient.strategic_objectives}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="reports" className="space-y-4">
                    {clientReports.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum relatório encontrado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Nenhum relatório foi gerado para este cliente ainda
                        </p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Relatório
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {clientReports.map((report) => (
                          <Card key={report.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">{report.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {report.report_type} • {report.period_covered}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={report.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                    {report.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(report.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="data" className="space-y-4">
                    {clientFinancialData.length === 0 ? (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum dado financeiro
                        </h3>
                        <p className="text-gray-600">
                          Nenhum dado financeiro foi importado para este cliente
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {clientFinancialData.map((data) => (
                          <Card key={data.id}>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Receita</p>
                                  <p className="font-semibold">
                                    {data.revenue ? `R$ ${data.revenue.toLocaleString('pt-BR')}` : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">EBITDA</p>
                                  <p className="font-semibold">
                                    {data.ebitda ? `R$ ${data.ebitda.toLocaleString('pt-BR')}` : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Lucro Líquido</p>
                                  <p className="font-semibold">
                                    {data.net_income ? `R$ ${data.net_income.toLocaleString('pt-BR')}` : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Caixa</p>
                                  <p className="font-semibold">
                                    {data.cash_balance ? `R$ ${data.cash_balance.toLocaleString('pt-BR')}` : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações do Cliente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Frequência de Relatórios
                            </label>
                            <select className="w-full p-2 border rounded-md">
                              <option>Mensal</option>
                              <option>Trimestral</option>
                              <option>Anual</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Tipos de Análise
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                Análise de Variação
                              </label>
                              <label className="flex items-center">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                Projeções
                              </label>
                              <label className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                Cenários
                              </label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um cliente
                </h3>
                <p className="text-gray-600">
                  Escolha um cliente na lista ao lado para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFPAClientManagement;
