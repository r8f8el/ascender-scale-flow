import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import { useAuth } from '@/contexts/AuthContext';
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
  Activity,
  Plus,
  Edit
} from 'lucide-react';

const ClientFPADashboardReal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  
  // Hooks para dados reais
  const { data: fpaClients = [], isLoading: clientsLoading } = useFPAClients();
  const currentClient = fpaClients.find(client => client.client_profile_id === user?.id);
  
  const { data: periods = [], isLoading: periodsLoading } = useFPAPeriods(currentClient?.id);
  const currentPeriod = periods.find(p => p.is_actual) || periods[0];
  
  const { 
    data: financialData, 
    isLoading: dataLoading, 
    refetch: refetchData 
  } = useFPAFinancialData(currentClient?.id, currentPeriod?.id);

  const [formData, setFormData] = useState({
    revenue: 0,
    cost_of_goods_sold: 0,
    operating_expenses: 0,
    depreciation: 0,
    financial_expenses: 0,
    current_assets: 0,
    non_current_assets: 0,
    current_liabilities: 0,
    non_current_liabilities: 0,
    equity: 0,
    operating_cash_flow: 0,
    investing_cash_flow: 0,
    financing_cash_flow: 0,
    cash_balance: 0
  });

  React.useEffect(() => {
    if (financialData && financialData.length > 0) {
      const data = financialData[0]; // Pegar o primeiro registro
      setFormData({
        revenue: data.revenue || 0,
        cost_of_goods_sold: data.cost_of_goods_sold || 0,
        operating_expenses: data.operating_expenses || 0,
        depreciation: data.depreciation || 0,
        financial_expenses: data.financial_expenses || 0,
        current_assets: data.current_assets || 0,
        non_current_assets: data.non_current_assets || 0,
        current_liabilities: data.current_liabilities || 0,
        non_current_liabilities: data.non_current_liabilities || 0,
        equity: data.equity || 0,
        operating_cash_flow: data.operating_cash_flow || 0,
        investing_cash_flow: data.investing_cash_flow || 0,
        financing_cash_flow: data.financing_cash_flow || 0,
        cash_balance: data.cash_balance || 0
      });
    }
  }, [financialData]);

  // Cálculos automáticos baseados nos dados reais
  const calculations = {
    grossProfit: formData.revenue - formData.cost_of_goods_sold,
    ebitda: formData.revenue - formData.cost_of_goods_sold - formData.operating_expenses,
    ebit: formData.revenue - formData.cost_of_goods_sold - formData.operating_expenses - formData.depreciation,
    netIncome: formData.revenue - formData.cost_of_goods_sold - formData.operating_expenses - formData.depreciation - formData.financial_expenses,
    totalAssets: formData.current_assets + formData.non_current_assets,
    totalLiabilities: formData.current_liabilities + formData.non_current_liabilities,
    netCashFlow: formData.operating_cash_flow + formData.investing_cash_flow + formData.financing_cash_flow,
    ebitdaMargin: formData.revenue > 0 ? ((formData.revenue - formData.cost_of_goods_sold - formData.operating_expenses) / formData.revenue) * 100 : 0
  };

  const handleSaveData = async () => {
    if (!currentClient?.id || !currentPeriod?.id) {
      toast({
        title: "Erro",
        description: "Cliente ou período não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se já existe dados para este período
      const { data: existingData } = await supabase
        .from('fpa_financial_data')
        .select('id')
        .eq('fpa_client_id', currentClient.id)
        .eq('period_id', currentPeriod.id)
        .single();

      const dataToSave = {
        fpa_client_id: currentClient.id,
        period_id: currentPeriod.id,
        ...formData,
        // Cálculos automáticos
        gross_profit: calculations.grossProfit,
        ebitda: calculations.ebitda,
        ebit: calculations.ebit,
        net_income: calculations.netIncome,
        total_assets: calculations.totalAssets,
        net_cash_flow: calculations.netCashFlow
      };

      if (existingData) {
        // Atualizar dados existentes
        const { error } = await supabase
          .from('fpa_financial_data')
          .update(dataToSave)
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        // Inserir novos dados
        const { error } = await supabase
          .from('fpa_financial_data')
          .insert([dataToSave]);

        if (error) throw error;
      }

      toast({
        title: "Dados salvos!",
        description: "Os dados financeiros foram atualizados com sucesso."
      });

      setIsEditing(false);
      refetchData();
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (clientsLoading || periodsLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sistema FP&A
          </h3>
          <p className="text-muted-foreground">
            Sua conta está sendo configurada pela equipe administrativa. Em breve você terá acesso aos seus relatórios financeiros.
          </p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    {
      title: "Receita",
      value: formatCurrency(formData.revenue),
      change: "+0.0%", // Pode ser calculado comparando com período anterior
      trend: "up" as const,
      period: "período atual"
    },
    {
      title: "EBITDA",
      value: formatCurrency(calculations.ebitda),
      change: "+0.0%",
      trend: "up" as const,
      period: "período atual"
    },
    {
      title: "Margem EBITDA",
      value: formatPercentage(calculations.ebitdaMargin),
      change: "+0.0%",
      trend: calculations.ebitdaMargin > 15 ? "up" : "down",
      period: "período atual"
    },
    {
      title: "Fluxo de Caixa",
      value: formatCurrency(calculations.netCashFlow),
      change: "+0.0%",
      trend: calculations.netCashFlow > 0 ? "up" : "down",
      period: "período atual"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard FP&A</h1>
          <p className="text-gray-600 mt-1">
            Dados financeiros em tempo real - {currentClient.company_name}
          </p>
          {currentPeriod && (
            <Badge variant="outline" className="mt-2">
              Período: {currentPeriod.period_name}
            </Badge>
          )}
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? 'Cancelar Edição' : 'Editar Dados'}
        </Button>
      </div>

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

      {/* Formulário de Dados Financeiros */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Dados Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DRE */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Demonstração de Resultados</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="revenue">Receita Total</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={formData.revenue}
                      onChange={(e) => setFormData({...formData, revenue: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost_of_goods_sold">Custo dos Produtos Vendidos</Label>
                    <Input
                      id="cost_of_goods_sold"
                      type="number"
                      value={formData.cost_of_goods_sold}
                      onChange={(e) => setFormData({...formData, cost_of_goods_sold: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating_expenses">Despesas Operacionais</Label>
                    <Input
                      id="operating_expenses"
                      type="number"
                      value={formData.operating_expenses}
                      onChange={(e) => setFormData({...formData, operating_expenses: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="depreciation">Depreciação</Label>
                    <Input
                      id="depreciation"
                      type="number"
                      value={formData.depreciation}
                      onChange={(e) => setFormData({...formData, depreciation: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="financial_expenses">Despesas Financeiras</Label>
                    <Input
                      id="financial_expenses"
                      type="number"
                      value={formData.financial_expenses}
                      onChange={(e) => setFormData({...formData, financial_expenses: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              {/* Balanço */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Balanço Patrimonial</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="current_assets">Ativo Circulante</Label>
                    <Input
                      id="current_assets"
                      type="number"
                      value={formData.current_assets}
                      onChange={(e) => setFormData({...formData, current_assets: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="non_current_assets">Ativo Não Circulante</Label>
                    <Input
                      id="non_current_assets"
                      type="number"
                      value={formData.non_current_assets}
                      onChange={(e) => setFormData({...formData, non_current_assets: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_liabilities">Passivo Circulante</Label>
                    <Input
                      id="current_liabilities"
                      type="number"
                      value={formData.current_liabilities}
                      onChange={(e) => setFormData({...formData, current_liabilities: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="non_current_liabilities">Passivo Não Circulante</Label>
                    <Input
                      id="non_current_liabilities"
                      type="number"
                      value={formData.non_current_liabilities}
                      onChange={(e) => setFormData({...formData, non_current_liabilities: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="equity">Patrimônio Líquido</Label>
                    <Input
                      id="equity"
                      type="number"
                      value={formData.equity}
                      onChange={(e) => setFormData({...formData, equity: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fluxo de Caixa */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Fluxo de Caixa</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="operating_cash_flow">Operacional</Label>
                  <Input
                    id="operating_cash_flow"
                    type="number"
                    value={formData.operating_cash_flow}
                    onChange={(e) => setFormData({...formData, operating_cash_flow: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="investing_cash_flow">Investimento</Label>
                  <Input
                    id="investing_cash_flow"
                    type="number"
                    value={formData.investing_cash_flow}
                    onChange={(e) => setFormData({...formData, investing_cash_flow: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="financing_cash_flow">Financiamento</Label>
                  <Input
                    id="financing_cash_flow"
                    type="number"
                    value={formData.financing_cash_flow}
                    onChange={(e) => setFormData({...formData, financing_cash_flow: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="cash_balance">Saldo Final</Label>
                  <Input
                    id="cash_balance"
                    type="number"
                    value={formData.cash_balance}
                    onChange={(e) => setFormData({...formData, cash_balance: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveData}>
                Salvar Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cálculos Automáticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Indicadores Calculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Lucro Bruto</span>
                <span className="font-medium">{formatCurrency(calculations.grossProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">EBITDA</span>
                <span className="font-medium">{formatCurrency(calculations.ebitda)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">EBIT</span>
                <span className="font-medium">{formatCurrency(calculations.ebit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Lucro Líquido</span>
                <span className="font-medium">{formatCurrency(calculations.netIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total de Ativos</span>
                <span className="font-medium">{formatCurrency(calculations.totalAssets)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Margens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Margem Bruta</span>
                <span className="font-medium">
                  {formatPercentage(formData.revenue > 0 ? (calculations.grossProfit / formData.revenue) * 100 : 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Margem EBITDA</span>
                <span className="font-medium">{formatPercentage(calculations.ebitdaMargin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Margem Líquida</span>
                <span className="font-medium">
                  {formatPercentage(formData.revenue > 0 ? (calculations.netIncome / formData.revenue) * 100 : 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Solicitar Análise
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientFPADashboardReal;