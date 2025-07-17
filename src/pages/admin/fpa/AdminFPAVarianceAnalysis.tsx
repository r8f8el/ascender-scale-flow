
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
  DollarSign,
  Plus
} from 'lucide-react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { useFPAVarianceAnalysis, useCreateFPAVarianceAnalysis, useUpdateFPAVarianceAnalysis } from '@/hooks/useFPAVarianceAnalysis';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import { useToast } from '@/hooks/use-toast';

const AdminFPAVarianceAnalysis = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [threshold, setThreshold] = useState(5);
  const { toast } = useToast();

  const { data: fpaClients = [] } = useFPAClients();
  const { data: periods = [] } = useFPAPeriods(selectedClient);
  const { data: varianceAnalysis = [], refetch: refetchVariance } = useFPAVarianceAnalysis(selectedClient, selectedPeriod);
  const { data: financialData = [] } = useFPAFinancialData(selectedClient, selectedPeriod);
  
  const createVarianceMutation = useCreateFPAVarianceAnalysis();
  const updateVarianceMutation = useUpdateFPAVarianceAnalysis();

  // Calculate variance analysis from financial data
  const calculateVarianceAnalysis = () => {
    if (!selectedClient || !selectedPeriod || financialData.length < 2) {
      toast({
        title: "Dados insuficientes",
        description: "Selecione um cliente e período com dados históricos para comparação.",
        variant: "destructive"
      });
      return;
    }

    // Get current and previous period data
    const currentData = financialData.find(d => d.period_id === selectedPeriod);
    const previousData = financialData.find(d => d.period_id !== selectedPeriod); // Simplified for demo

    if (!currentData || !previousData) {
      toast({
        title: "Dados não encontrados",
        description: "Não foi possível encontrar dados para comparação.",
        variant: "destructive"
      });
      return;
    }

    // Define metrics to analyze
    const metrics = [
      { key: 'revenue', name: 'Receita Operacional', planned: previousData.revenue || 0, actual: currentData.revenue || 0 },
      { key: 'ebitda', name: 'EBITDA', planned: previousData.ebitda || 0, actual: currentData.ebitda || 0 },
      { key: 'net_income', name: 'Resultado Líquido', planned: previousData.net_income || 0, actual: currentData.net_income || 0 },
      { key: 'operating_expenses', name: 'Despesas Operacionais', planned: previousData.operating_expenses || 0, actual: currentData.operating_expenses || 0 }
    ];

    // Create variance analysis for each metric
    metrics.forEach(metric => {
      const variance = metric.actual - metric.planned;
      const variancePercentage = metric.planned !== 0 ? (variance / metric.planned) * 100 : 0;

      if (Math.abs(variancePercentage) >= threshold) {
        createVarianceMutation.mutate({
          fpa_client_id: selectedClient,
          period_id: selectedPeriod,
          metric_name: metric.name,
          planned_value: metric.planned,
          actual_value: metric.actual,
          variance_amount: variance,
          variance_percentage: variancePercentage,
          analysis_comment: generateAnalysisComment(metric.name, variance, variancePercentage)
        });
      }
    });

    toast({
      title: "Análise gerada",
      description: "Análise de variação calculada com sucesso.",
    });

    refetchVariance();
  };

  const generateAnalysisComment = (metricName: string, variance: number, percentage: number) => {
    const isPositive = variance > 0;
    const absPercentage = Math.abs(percentage);
    
    if (metricName.includes('Receita') || metricName.includes('EBITDA') || metricName.includes('Resultado')) {
      return isPositive 
        ? `Performance superior ao planejado em ${absPercentage.toFixed(1)}%. Resultado positivo que merece análise das causas para replicação.`
        : `Performance inferior ao planejado em ${absPercentage.toFixed(1)}%. Necessária investigação das causas e plano de ação corretivo.`;
    } else {
      return isPositive
        ? `Aumento de ${absPercentage.toFixed(1)}% acima do planejado. Investigar causas do incremento nos custos/despesas.`
        : `Redução de ${absPercentage.toFixed(1)}% em relação ao planejado. Resultado positivo de controle de custos.`;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(Math.abs(value));
  };

  const formatPercent = (value: number) => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    return `${isNegative ? '-' : '+'}${absoluteValue.toFixed(1)}%`;
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage > 0) {
      return <Badge className="bg-green-100 text-green-700">Favorável</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700">Desfavorável</Badge>;
    }
  };

  const getImpactBadge = (percentage: number) => {
    const abs = Math.abs(percentage);
    if (abs >= 20) return <Badge variant="destructive">Alto</Badge>;
    if (abs >= 10) return <Badge className="bg-yellow-100 text-yellow-700">Médio</Badge>;
    return <Badge variant="outline">Baixo</Badge>;
  };

  // Calculate summary statistics
  const totalVariances = varianceAnalysis.length;
  const favorableVariances = varianceAnalysis.filter(v => v.variance_percentage > 0).length;
  const unfavorableVariances = varianceAnalysis.filter(v => v.variance_percentage < 0).length;
  const netImpact = varianceAnalysis.reduce((acc, v) => acc + (v.variance_amount || 0), 0);

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
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={calculateVarianceAnalysis}
            disabled={!selectedClient || !selectedPeriod}
          >
            <RefreshCw className="h-4 w-4" />
            Recalcular
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
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
              <Label htmlFor="client">Cliente</Label>
              <select 
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="">Selecione um cliente</option>
                {fpaClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="period">Período de Análise</Label>
              <select 
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
                disabled={!selectedClient}
              >
                <option value="">Selecione um período</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.period_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="threshold">Limite de Variação (%)</Label>
              <Input 
                id="threshold" 
                type="number" 
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-1" 
              />
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full"
                onClick={calculateVarianceAnalysis}
                disabled={!selectedClient || !selectedPeriod}
              >
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
                    <p className="text-2xl font-bold">{totalVariances}</p>
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
                    <p className="text-2xl font-bold text-green-600">{favorableVariances}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600">
                    {totalVariances > 0 ? Math.round((favorableVariances / totalVariances) * 100) : 0}% do total
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Desfavoráveis</p>
                    <p className="text-2xl font-bold text-red-600">{unfavorableVariances}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-red-600">
                    {totalVariances > 0 ? Math.round((unfavorableVariances / totalVariances) * 100) : 0}% do total
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Impacto Líquido</p>
                    <p className={`text-2xl font-bold ${netImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netImpact)}
                    </p>
                  </div>
                  <DollarSign className={`h-8 w-8 ${netImpact >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${netImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netImpact >= 0 ? 'Positivo' : 'Negativo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Variance Analysis Table */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada por Métrica</CardTitle>
            </CardHeader>
            <CardContent>
              {varianceAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma análise de variação encontrada.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Selecione um cliente e período para gerar a análise.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {varianceAnalysis.map((item, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(item.variance_percentage)}
                              <h3 className="text-lg font-semibold text-gray-900">{item.metric_name}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Planejado</p>
                                <p className="font-medium">{formatCurrency(item.planned_value)}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-600">Realizado</p>
                                <p className="font-medium">{formatCurrency(item.actual_value)}</p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-600">Variação</p>
                                <p className={`font-medium ${item.variance_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(item.variance_amount)}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-600">Variação %</p>
                                <p className={`font-medium ${item.variance_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPercent(item.variance_percentage)}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-600">Impacto</p>
                                {getImpactBadge(item.variance_percentage)}
                              </div>
                            </div>
                            
                            {item.analysis_comment && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-600 mb-1">Análise de Causa-Raiz:</p>
                                <p className="text-sm text-gray-800">{item.analysis_comment}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(item.variance_percentage)}
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
              )}
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
                {varianceAnalysis.filter(v => v.variance_percentage > 0).length > 0 && (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-1">Performance Positiva Identificada</h4>
                        <p className="text-sm text-green-700">
                          Foram identificadas {favorableVariances} variações favoráveis, 
                          representando {totalVariances > 0 ? Math.round((favorableVariances / totalVariances) * 100) : 0}% 
                          do total analisado. Recomenda-se investigar as causas para replicação.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {varianceAnalysis.filter(v => v.variance_percentage < -10).length > 0 && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Alerta de Performance</h4>
                        <p className="text-sm text-red-700">
                          Identificadas {varianceAnalysis.filter(v => v.variance_percentage < -10).length} variações 
                          significativamente desfavoráveis (acima de 10%). Ação corretiva imediata recomendada.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {varianceAnalysis.length === 0 && (
                  <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">Aguardando Análise</h4>
                        <p className="text-sm text-gray-700">
                          Selecione um cliente e período para gerar insights automáticos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    <Input 
                      id="reportTitle" 
                      defaultValue={`Análise de Variação - ${periods.find(p => p.id === selectedPeriod)?.period_name || 'Período'}`}
                      className="mt-1" 
                    />
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
