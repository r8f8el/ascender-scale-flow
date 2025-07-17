
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  AlertCircle,
  Upload,
  MessageSquare,
  FileText,
  Activity
} from 'lucide-react';

const ClientFPADashboard = () => {
  // Mock data - in real implementation, this would come from the API
  const kpis = [
    {
      title: "Receita Atual",
      value: "R$ 2.850.000",
      change: "+12.5%",
      trend: "up",
      period: "vs mês anterior"
    },
    {
      title: "EBITDA",
      value: "R$ 425.000",
      change: "+8.2%",
      trend: "up",
      period: "vs mês anterior"
    },
    {
      title: "Margem EBITDA",
      value: "14.9%",
      change: "-0.3%",
      trend: "down",
      period: "vs mês anterior"
    },
    {
      title: "Fluxo de Caixa",
      value: "R$ 180.000",
      change: "+5.7%",
      trend: "up",
      period: "vs mês anterior"
    }
  ];

  const workflowStatus = {
    currentPhase: 4,
    phases: [
      { id: 1, name: "Onboarding", status: "completed" },
      { id: 2, name: "Agregação de Dados", status: "completed" },
      { id: 3, name: "Desenvolvimento do Modelo", status: "completed" },
      { id: 4, name: "Análise de Cenários", status: "active" },
      { id: 5, name: "Monitoramento", status: "pending" },
      { id: 6, name: "Relatórios e Assessoria", status: "pending" }
    ]
  };

  const healthScore = 78; // Mock health score

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard FP&A</h1>
          <p className="text-gray-600 mt-1">
            Visão integrada do seu planejamento financeiro e análise de cenários
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Fase 4: Análise de Cenários
        </Badge>
      </div>

      {/* Workflow Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Fluxo de Trabalho FP&A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            {workflowStatus.phases.map((phase) => (
              <div key={phase.id} className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium ${
                  phase.status === 'completed' ? 'bg-green-100 text-green-700' :
                  phase.status === 'active' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {phase.id}
                </div>
                <p className={`text-xs ${
                  phase.status === 'active' ? 'font-medium text-blue-700' : 'text-gray-600'
                }`}>
                  {phase.name}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Progress value={(workflowStatus.currentPhase / 6) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="flex items-center mt-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {kpi.period}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Saúde Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {healthScore}
              </div>
              <p className="text-sm text-gray-600 mb-4">Score de Saúde</p>
              <Progress value={healthScore} className="h-3 mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Liquidez Corrente</span>
                  <span className="text-green-600">Boa</span>
                </div>
                <div className="flex justify-between">
                  <span>Endividamento</span>
                  <span className="text-yellow-600">Atenção</span>
                </div>
                <div className="flex justify-between">
                  <span>Rentabilidade</span>
                  <span className="text-green-600">Excelente</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Variação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Receita</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">+2.5%</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Custos Operacionais</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">+5.2%</span>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Despesas Administrativas</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">-1.8%</span>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="border-t pt-2 mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Análise Completa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ações Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Upload className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Dados de Março Pendentes</p>
                  <p className="text-xs text-gray-600">Faça upload dos dados reais</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo Relatório Disponível</p>
                  <p className="text-xs text-gray-600">Relatório mensal de performance</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reunião de Revisão</p>
                  <p className="text-xs text-gray-600">Agendada para 15/04</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-16 flex flex-col gap-1">
          <Upload className="h-5 w-5" />
          <span className="text-sm">Cofre de Dados</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm">Cenários</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1">
          <FileText className="h-5 w-5" />
          <span className="text-sm">Relatórios</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm">Comunicação</span>
        </Button>
      </div>
    </div>
  );
};

export default ClientFPADashboard;
