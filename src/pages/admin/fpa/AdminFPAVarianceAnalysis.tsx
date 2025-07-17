
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  FileText,
  Calculator,
  Eye,
  Edit,
  Save,
  RefreshCw,
  BarChart3,
  DollarSign
} from 'lucide-react';

const AdminFPAVarianceAnalysis = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-03');

  // Mock variance analysis data
  const varianceData = [
    {
      account: "Receita Operacional",
      category: "Receita",
      budgeted: 2850000,
      actual: 2920000,
      variance: 70000,
      variancePercent: 2.46,
      status: "favorable",
      rootCause: "Aumento no ticket médio e nova campanha de marketing",
      impact: "high",
      drillDown: [
        { item: "Vendas Produto A", budgeted: 1200000, actual: 1280000, variance: 80000 },
        { item: "Vendas Produto B", budgeted: 950000, actual: 940000, variance: -10000 },
        { item: "Serviços", budgeted: 700000, actual: 700000, variance: 0 }
      ]
    },
    {
      account: "Custos Operacionais",
      category: "Custo",
      budgeted: 1200000,
      actual: 1350000,
      variance: -150000,
      variancePercent: -12.5,
      status: "unfavorable",
      rootCause: "Aumento no custo de matéria-prima e horas extras",
      impact: "high",
      drillDown: [
        { item: "Matéria-prima", budgeted: 600000, actual: 720000, variance: -120000 },
        { item: "Mão de obra", budgeted: 400000, actual: 430000, variance: -30000 },
        { item: "Overhead", budgeted: 200000, actual: 200000, variance: 0 }
      ]
    },
    {
      account: "Despesas Administrativas",
      category: "Despesa",
      budgeted: 180000,
      actual: 175000,
      variance: 5000,
      variancePercent: 2.78,
      status: "favorable",
      rootCause: "Economia em viagens e redução de consultorias",
      impact: "low",
      drillDown: [
        { item: "Salários Admin", budgeted: 120000, actual: 120000, variance: 0 },
        { item: "Viagens", budgeted: 25000, actual: 20000, variance: 5000 },
        { item: "Consultorias", budgeted: 35000, actual: 35000, variance: 0 }
      ]
    },
    {
      account: "Marketing",
      category: "Despesa",
      budgeted: 50000,
      actual: 65000,
      variance: -15000,
      variancePercent: -30.0,
      status: "unfavorable",
      rootCause: "Investimento adicional em campanha digital",
      impact: "medium",
      drillDown: [
        { item: "Marketing Digital", budgeted: 30000, actual: 45000, variance: -15000 },
        { item: "Eventos", budgeted: 15000, actual: 15000, variance: 0 },
        { item: "Material", budgeted: 5000, actual: 5000, variance: 0 }
      ]
    }
  ];

  // Mock insight templates
  const insightTemplates = [
    {
      id: 1,
      trigger: "variance > 10%",
      template: "A variação de {variance_percent}% em {account} foi causada principalmente por {root_cause}. Recomendo {recommendation}.",
      category: "High Variance"
    },
    {
      id: 2,
      trigger: "favorable && impact == 'high'",
      template: "Excelente performance em {account} com ganho de {variance_amount}. Esta tendência positiva pode ser mantida através de {actions}.",
      category: "Positive Performance"
    },
    {
      id: 3,
      trigger: "unfavorable && category == 'Custo'",
      template: "O aumento de custos em {account} requer atenção imediata. Sugiro implementar {cost_control_measures}.",
      category: "Cost Control"
    }
  ];

  const periods = [
    { value: "2024-03", label: "Março 2024" },
    { value: "2024-02", label: "Fevereiro 2024" },
    { value: "2024-01", label: "Janeiro 2024" },
    { value: "2023-12", label: "Dezembro 2023" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'favorable': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'unfavorable': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'favorable': return <Badge className="bg-green-100 text-green-700">Favorável</Badge>;
      case 'unfavorable': return <Badge className="bg-red-100 text-red-700">Desfavorável</Badge>;
      default: return <Badge variant="outline">Neutro</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive">Alto</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Médio</Badge>;
      case 'low': return <Badge variant="outline">Baixo</Badge>;
      default: return <Badge variant="outline">-</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(absoluteValue);
    
    return isNegative ? `-${formatted}` : formatted;
  };

  const formatPercent = (value: number) => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    return `${isNegative ? '-' : '+'}${absoluteValue.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise de Variação Automatizada</h1>
          <p className="text-gray-600 mt-1">
            Geração automática de relatórios de variação com análise de causa-raiz
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Recalcular
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Seleção de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="period">Período de Análise</Label>
              <select 
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="client">Cliente</Label>
              <select id="client" className="w-full p-2 border rounded-md mt-1">
                <option value="techcorp">TechCorp Ltda</option>
                <option value="innovatelab">InnovateLab S.A.</option>
                <option value="greentech">GreenTech Solutions</option>
              </select>
            </div>
            <div>
              <Label htmlFor="threshold">Limite de Variação (%)</Label>
              <Input id="threshold" type="number" defaultValue="5" className="mt-1" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Análise de Variação</TabsTrigger>
          <TabsTrigger value="insights">Insights Automáticos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Variações Totais</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-600">Analisadas</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Favoráveis</p>
                    <p className="text-2xl font-bold text-green-600">8</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600">67% do total</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Desfavoráveis</p>
                    <p className="text-2xl font-bold text-red-600">4</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-red-600">33% do total</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Impacto Líquido</p>
                    <p className="text-2xl font-bold text-green-600">+R$ 45K</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600">Positivo</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Variance Analysis Table */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada por Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {varianceData.map((item, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(item.status)}
                            <h3 className="text-lg font-semibold text-gray-900">{item.account}</h3>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Orçado</p>
                              <p className="font-medium">{formatCurrency(item.budgeted)}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Realizado</p>
                              <p className="font-medium">{formatCurrency(item.actual)}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Variação</p>
                              <p className={`font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(item.variance)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Variação %</p>
                              <p className={`font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercent(item.variancePercent)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Impacto</p>
                              {getImpactBadge(item.impact)}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-600 mb-1">Análise de Causa-Raiz:</p>
                            <p className="text-sm text-gray-800">{item.rootCause}</p>
                          </div>
                          
                          {/* Drill-down */}
                          <div className="border-t pt-3">
                            <h4 className="font-medium text-sm mb-2">Detalhamento:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {item.drillDown.map((detail, idx) => (
                                <div key={idx} className="text-xs p-2 bg-white border rounded">
                                  <p className="font-medium">{detail.item}</p>
                                  <div className="flex justify-between mt-1">
                                    <span>Orçado: {formatCurrency(detail.budgeted)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Real: {formatCurrency(detail.actual)}</span>
                                  </div>
                                  <div className={`flex justify-between font-medium ${
                                    detail.variance >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    <span>Var: {formatCurrency(detail.variance)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(item.status)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              Detalhar
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Automated Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Insights Gerados Automaticamente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">Performance Positiva Identificada</h4>
                      <p className="text-sm text-green-700">
                        A receita operacional superou o orçamento em 2.46% (+R$ 70.000), principalmente devido ao aumento no ticket médio e ao sucesso da nova campanha de marketing digital. Esta tendência positiva sugere que os investimentos em marketing estão gerando o ROI esperado.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Alerta de Custo Elevado</h4>
                      <p className="text-sm text-red-700">
                        Os custos operacionais excederam o orçamento em 12.5% (-R$ 150.000), impulsionados principalmente pelo aumento no custo de matéria-prima (+R$ 120.000) e horas extras. Recomendo implementar controles de custo mais rigorosos e renegociar contratos com fornecedores.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Monitoramento de Marketing</h4>
                      <p className="text-sm text-yellow-700">
                        O investimento em marketing aumentou 30% (+R$ 15.000) acima do orçado. Embora tenha contribuído para o aumento da receita, é importante monitorar o ROI para garantir a sustentabilidade desta estratégia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insight Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Templates de Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{template.category}</h4>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Trigger:</strong> {template.trigger}
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-mono">{template.template}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Relatórios de Variação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportTitle">Título do Relatório</Label>
                    <Input id="reportTitle" defaultValue="Análise de Variação - Março 2024" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="reportType">Tipo de Relatório</Label>
                    <select id="reportType" className="w-full p-2 border rounded-md mt-1">
                      <option value="executive">Resumo Executivo</option>
                      <option value="detailed">Análise Detalhada</option>
                      <option value="variance-only">Apenas Variações Significativas</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="executiveSummary">Resumo Executivo</Label>
                  <Textarea 
                    id="executiveSummary" 
                    placeholder="Adicione comentários executivos sobre o desempenho do período..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="recommendations">Recomendações</Label>
                  <Textarea 
                    id="recommendations" 
                    placeholder="Liste as principais recomendações baseadas na análise..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Gerar PDF
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Gerar Excel
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Rascunho
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFPAVarianceAnalysis;
