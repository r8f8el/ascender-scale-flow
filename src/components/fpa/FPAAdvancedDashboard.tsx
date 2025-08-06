
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts';

interface FPAAdvancedDashboardProps {
  clientId: string;
}

const FPAAdvancedDashboard: React.FC<FPAAdvancedDashboardProps> = ({ clientId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Mock data - em produção viria da API
  const revenueData = [
    { month: 'Jan', actual: 120000, forecast: 115000, budget: 110000 },
    { month: 'Fev', actual: 132000, forecast: 125000, budget: 120000 },
    { month: 'Mar', actual: 145000, forecast: 140000, budget: 135000 },
    { month: 'Apr', actual: 158000, forecast: 155000, budget: 150000 },
    { month: 'Mai', actual: 171000, forecast: 165000, budget: 160000 },
    { month: 'Jun', actual: 185000, forecast: 180000, budget: 175000 }
  ];

  const expenseBreakdown = [
    { name: 'Salários', value: 45, color: '#8884d8' },
    { name: 'Marketing', value: 20, color: '#82ca9d' },
    { name: 'Operacional', value: 15, color: '#ffc658' },
    { name: 'Tecnologia', value: 12, color: '#ff7300' },
    { name: 'Outros', value: 8, color: '#00ff00' }
  ];

  const kpiData = [
    {
      title: 'Receita Atual',
      value: 'R$ 185.000',
      change: '+12.5%',
      trend: 'up' as const,
      prediction: 'R$ 195.000 (próximo mês)'
    },
    {
      title: 'Margem EBITDA',
      value: '28.5%',
      change: '+2.1%',
      trend: 'up' as const,
      prediction: '29.2% (próximo mês)'
    },
    {
      title: 'Burn Rate',
      value: 'R$ 45.000/mês',
      change: '-5.2%',
      trend: 'down' as const,
      prediction: 'R$ 42.000/mês (próximo mês)'
    },
    {
      title: 'Customer LTV',
      value: 'R$ 12.500',
      change: '+8.3%',
      trend: 'up' as const,
      prediction: 'R$ 13.200 (próximo mês)'
    }
  ];

  const insights = [
    {
      type: 'positive',
      title: 'Crescimento Sustentável',
      description: 'Receita crescendo 12% a.m. com melhoria na margem operacional.'
    },
    {
      type: 'warning',
      title: 'Atenção: Custos de Aquisição',
      description: 'CAC aumentou 15% no último trimestre. Revisar estratégia de marketing.'
    },
    {
      type: 'info',
      title: 'Oportunidade: Expansão',
      description: 'Cash flow positivo permite investimento em novos mercados.'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard FP&A Avançado</h1>
          <p className="text-gray-600">Analytics e previsões inteligentes</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Meses</SelectItem>
              <SelectItem value="6months">6 Meses</SelectItem>
              <SelectItem value="12months">12 Meses</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs com Previsões ML */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {kpi.value}
              </div>
              <div className="flex items-center mb-2">
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
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <span className="font-medium">Previsão IA:</span> {kpi.prediction}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Interativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend com Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Receita vs Previsão vs Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  name="Real"
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#82ca9d" 
                  strokeDasharray="5 5"
                  name="Previsão IA"
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#ffc658" 
                  strokeDasharray="10 5"
                  name="Orçamento"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'positive' 
                    ? 'bg-green-50 border-green-400' 
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {insight.description}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      insight.type === 'positive' 
                        ? 'default' 
                        : insight.type === 'warning'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {insight.type === 'positive' ? 'Positivo' : 
                     insight.type === 'warning' ? 'Atenção' : 'Info'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análise por Produto
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Análise por Região
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Análise Temporal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FPAAdvancedDashboard;
