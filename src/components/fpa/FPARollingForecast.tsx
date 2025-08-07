
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

interface ForecastPeriod {
  period: string;
  type: 'actual' | 'forecast';
  revenue: number;
  ebitda: number;
  netIncome: number;
  cashFlow: number;
  confidence: number;
}

const FPARollingForecast: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [forecastHorizon, setForecastHorizon] = useState('18');
  const [updateFrequency, setUpdateFrequency] = useState('monthly');
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock forecast data - in real implementation, this would come from the financial model
  const [forecastData, setForecastData] = useState<ForecastPeriod[]>([
    { period: 'Jan 2024', type: 'actual', revenue: 2100000, ebitda: 462000, netIncome: 315000, cashFlow: 380000, confidence: 100 },
    { period: 'Fev 2024', type: 'actual', revenue: 2250000, ebitda: 495000, netIncome: 337500, cashFlow: 405000, confidence: 100 },
    { period: 'Mar 2024', type: 'actual', revenue: 2180000, ebitda: 479600, netIncome: 327000, cashFlow: 392000, confidence: 100 },
    { period: 'Abr 2024', type: 'forecast', revenue: 2350000, ebitda: 517000, netIncome: 352500, cashFlow: 420000, confidence: 95 },
    { period: 'Mai 2024', type: 'forecast', revenue: 2420000, ebitda: 532400, netIncome: 363000, cashFlow: 435000, confidence: 90 },
    { period: 'Jun 2024', type: 'forecast', revenue: 2380000, ebitda: 523600, netIncome: 357000, cashFlow: 428000, confidence: 88 },
    { period: 'Jul 2024', type: 'forecast', revenue: 2500000, ebitda: 550000, netIncome: 375000, cashFlow: 450000, confidence: 85 },
    { period: 'Ago 2024', type: 'forecast', revenue: 2580000, ebitda: 567600, netIncome: 387000, cashFlow: 464000, confidence: 82 },
    { period: 'Set 2024', type: 'forecast', revenue: 2650000, ebitda: 583000, netIncome: 397500, cashFlow: 477000, confidence: 80 },
    { period: 'Out 2024', type: 'forecast', revenue: 2720000, ebitda: 598400, netIncome: 408000, cashFlow: 490000, confidence: 78 },
    { period: 'Nov 2024', type: 'forecast', revenue: 2800000, ebitda: 616000, netIncome: 420000, cashFlow: 504000, confidence: 75 },
    { period: 'Dez 2024', type: 'forecast', revenue: 2900000, ebitda: 638000, netIncome: 435000, cashFlow: 522000, confidence: 72 }
  ]);

  const handleUpdateForecast = () => {
    setIsUpdating(true);
    setTimeout(() => {
      // Simulate rolling the forecast forward
      const newForecastData = [...forecastData];
      // Add new period and remove oldest
      newForecastData.push({
        period: 'Jan 2025',
        type: 'forecast',
        revenue: 3000000,
        ebitda: 660000,
        netIncome: 450000,
        cashFlow: 540000,
        confidence: 70
      });
      setForecastData(newForecastData);
      setIsUpdating(false);
    }, 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const actualPeriods = forecastData.filter(p => p.type === 'actual');
  const forecastPeriods = forecastData.filter(p => p.type === 'forecast');
  
  const totalForecastRevenue = forecastPeriods.reduce((sum, p) => sum + p.revenue, 0);
  const avgConfidence = forecastPeriods.reduce((sum, p) => sum + p.confidence, 0) / forecastPeriods.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Rolling Forecast</h3>
          <p className="text-gray-600">Previsão contínua atualizada periodicamente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUpdateForecast} disabled={isUpdating}>
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar Previsão
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium">Horizonte de Previsão</h4>
            </div>
            <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 meses</SelectItem>
                <SelectItem value="18">18 meses</SelectItem>
                <SelectItem value="24">24 meses</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-green-600" />
              <h4 className="font-medium">Frequência de Atualização</h4>
            </div>
            <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium">Confiança Média</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={avgConfidence > 85 ? "default" : avgConfidence > 70 ? "secondary" : "destructive"}>
                {avgConfidence.toFixed(0)}%
              </Badge>
              {avgConfidence < 75 && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Receita Prevista (12M)</p>
                <p className="font-bold">{formatCurrency(totalForecastRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Crescimento Médio</p>
                <p className="font-bold">+8.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Margem EBITDA</p>
                <p className="font-bold">22.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Períodos Atuais</p>
                <p className="font-bold">{actualPeriods.length} de {forecastData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="profitability">Rentabilidade</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="confidence">Confiança</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
              <p className="text-sm text-gray-600">Dados reais vs. previsão</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      strokeDasharray="0"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability">
          <Card>
            <CardHeader>
              <CardTitle>EBITDA e Lucro Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="ebitda" fill="#10B981" name="EBITDA" />
                    <Bar dataKey="netIncome" fill="#8B5CF6" name="Lucro Líquido" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area 
                      type="monotone" 
                      dataKey="cashFlow" 
                      stroke="#F59E0B" 
                      fill="#FEF3C7" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence">
          <Card>
            <CardHeader>
              <CardTitle>Nível de Confiança da Previsão</CardTitle>
              <p className="text-sm text-gray-600">
                A confiança diminui com o tempo devido à incerteza crescente
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastPeriods}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Confiança']} />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Período</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-right p-2">Receita</th>
                  <th className="text-right p-2">EBITDA</th>
                  <th className="text-right p-2">Lucro Líquido</th>
                  <th className="text-right p-2">Fluxo de Caixa</th>
                  <th className="text-center p-2">Confiança</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((period, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{period.period}</td>
                    <td className="p-2">
                      <Badge variant={period.type === 'actual' ? "default" : "secondary"}>
                        {period.type === 'actual' ? 'Real' : 'Previsão'}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">{formatCurrency(period.revenue)}</td>
                    <td className="p-2 text-right">{formatCurrency(period.ebitda)}</td>
                    <td className="p-2 text-right">{formatCurrency(period.netIncome)}</td>
                    <td className="p-2 text-right">{formatCurrency(period.cashFlow)}</td>
                    <td className="p-2 text-center">
                      {period.type === 'actual' ? (
                        <Badge variant="default">100%</Badge>
                      ) : (
                        <Badge variant={period.confidence > 85 ? "default" : period.confidence > 70 ? "secondary" : "destructive"}>
                          {period.confidence}%
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FPARollingForecast;
