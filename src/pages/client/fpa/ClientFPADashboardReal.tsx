
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import { useFPAReports } from '@/hooks/useFPAReports';
import { useFPAVarianceAnalysis } from '@/hooks/useFPAVarianceAnalysis';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Building,
  Target,
  Activity,
  Download,
  LineChart as LineChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClientFPADashboardReal = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Get current user's FPA client data
  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  const currentClient = clients[0]; // Assuming first client for current user
  
  const { data: financialData = [], isLoading: dataLoading } = useFPAFinancialData(currentClient?.id);
  const { data: reports = [], isLoading: reportsLoading } = useFPAReports(currentClient?.id);
  const { data: varianceAnalysis = [], isLoading: varianceLoading } = useFPAVarianceAnalysis(currentClient?.id);
  const { data: periods = [], isLoading: periodsLoading } = useFPAPeriods(currentClient?.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  // Prepare chart data
  const chartData = financialData.slice(0, 6).map((data, index) => {
    const periodData = Array.isArray(data.period) ? data.period[0] : data.period;
    return {
      period: periodData?.period_name || `Período ${index + 1}`,
      revenue: data.revenue || 0,
      ebitda: data.ebitda || 0,
      netIncome: data.net_income || 0
    };
  }).reverse();

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cliente FP&A encontrado
          </h3>
          <p className="text-gray-600">
            Entre em contato com seu consultor para configurar sua conta FP&A
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard FP&A</h1>
          <p className="text-gray-600 mt-1">
            Análise Financeira para {currentClient.company_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Todos os períodos</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.period_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">
                  {financialData.length > 0 ? formatCurrency(financialData[0].revenue || 0) : formatCurrency(0)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5.2% vs período anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">EBITDA</p>
                <p className="text-2xl font-bold">
                  {financialData.length > 0 ? formatCurrency(financialData[0].ebitda || 0) : formatCurrency(0)}
                </p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -2.1% vs período anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold">
                  {financialData.length > 0 ? formatCurrency(financialData[0].net_income || 0) : formatCurrency(0)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3.8% vs período anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Margem EBITDA</p>
                <p className="text-2xl font-bold">
                  {financialData.length > 0 && financialData[0].revenue ? 
                    formatPercentage((financialData[0].ebitda || 0) / financialData[0].revenue * 100) : 
                    '0%'
                  }
                </p>
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Dentro da meta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="variance">Análise</TabsTrigger>
          <TabsTrigger value="forecast">Previsões</TabsTrigger>
          <TabsTrigger value="periods">Períodos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Performance Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Receita" />
                      <Line type="monotone" dataKey="ebitda" stroke="#10B981" strokeWidth={2} name="EBITDA" />
                      <Line type="monotone" dataKey="netIncome" stroke="#8B5CF6" strokeWidth={2} name="Lucro Líquido" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Dados financeiros em preparação</p>
                  <p className="text-sm text-gray-400">Seu consultor está organizando as informações</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Financial Data - Read Only */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Financeiros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando dados...</p>
                </div>
              ) : financialData.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Dados financeiros em preparação</p>
                  <p className="text-sm text-gray-400">Aguardando análise do consultor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {financialData.slice(0, 3).map((data) => {
                    const periodData = Array.isArray(data.period) ? data.period[0] : data.period;
                    const periodName = periodData?.period_name || 'N/A';
                    const isActual = periodData?.is_actual || false;
                    
                    return (
                      <div key={data.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">
                            Período: {periodName}
                          </h4>
                          <Badge variant={isActual ? "default" : "outline"}>
                            {isActual ? 'Atual' : 'Histórico'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Receita:</span>
                            <div className="font-medium">{formatCurrency(data.revenue || 0)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">EBITDA:</span>
                            <div className="font-medium">{formatCurrency(data.ebitda || 0)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Lucro Líquido:</span>
                            <div className="font-medium">{formatCurrency(data.net_income || 0)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seus Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando relatórios...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum relatório disponível</p>
                  <p className="text-sm text-gray-400">Novos relatórios aparecerão aqui quando estiverem prontos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600">{report.period_covered}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {report.status === 'published' ? 'Disponível' : 'Em análise'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50">
                          <Download className="h-4 w-4" />
                          Baixar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {varianceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando análises...</p>
                </div>
              ) : varianceAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Análise de performance em preparação</p>
                  <p className="text-sm text-gray-400">Seu consultor está preparando os relatórios</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {varianceAnalysis.slice(0, 5).map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-900">{analysis.metric_name}</h4>
                        <p className="text-sm text-gray-600">
                          Variação: {formatPercentage(analysis.variance_percentage)}
                        </p>
                        {analysis.analysis_comment && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{analysis.analysis_comment}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {Math.abs(analysis.variance_percentage) <= 5 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className={`text-sm font-medium ${analysis.variance_amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(analysis.variance_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Previsões Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LineChartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Previsões em Desenvolvimento
                </h3>
                <p className="text-gray-600">
                  Seu consultor está preparando as projeções financeiras personalizadas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Períodos Analisados</CardTitle>
            </CardHeader>
            <CardContent>
              {periodsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando períodos...</p>
                </div>
              ) : periods.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Configuração de períodos em andamento</p>
                  <p className="text-sm text-gray-400">Seu consultor está definindo os períodos de análise</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {periods.map((period) => (
                    <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-900">{period.period_name}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(period.start_date).toLocaleDateString('pt-BR')} - {new Date(period.end_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={period.is_actual ? "default" : "outline"}>
                          {period.is_actual ? 'Atual' : 'Histórico'}
                        </Badge>
                        <Badge variant="secondary">
                          {period.period_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientFPADashboardReal;
