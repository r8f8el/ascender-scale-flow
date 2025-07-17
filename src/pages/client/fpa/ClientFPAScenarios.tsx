
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Save,
  Copy,
  RefreshCw,
  Target,
  DollarSign,
  Users,
  ShoppingCart,
  Briefcase
} from 'lucide-react';

const ClientFPAScenarios = () => {
  const [selectedScenario, setSelectedScenario] = useState('base');
  
  // Mock drivers state
  const [drivers, setDrivers] = useState({
    salesTeamSize: [25],
    marketingSpend: [50000],
    averageTicket: [2500],
    conversionRate: [15],
    operationalCosts: [180000]
  });

  // Mock scenarios
  const scenarios = [
    {
      id: 'conservative',
      name: 'Cenário Conservador',
      description: 'Crescimento moderado com foco em eficiência',
      revenue: 2650000,
      ebitda: 380000,
      margin: 14.3,
      cashFlow: 150000,
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'base',
      name: 'Cenário Base',
      description: 'Projeção realista baseada em tendências atuais',
      revenue: 2850000,
      ebitda: 425000,
      margin: 14.9,
      cashFlow: 180000,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'optimistic',
      name: 'Cenário Otimista',
      description: 'Crescimento acelerado com investimentos',
      revenue: 3200000,
      ebitda: 520000,
      margin: 16.2,
      cashFlow: 220000,
      color: 'bg-green-100 text-green-700'
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario) || scenarios[1];

  const updateDriver = (driverKey: string, value: number[]) => {
    setDrivers(prev => ({
      ...prev,
      [driverKey]: value
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cenários Interativos</h1>
          <p className="text-gray-600 mt-1">
            Explore diferentes cenários "what-if" ajustando os direcionadores de negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Cenário
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Comparar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Scenario Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cenários Predefinidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedScenario === scenario.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{scenario.name}</h4>
                    <Badge className={scenario.color}>
                      {scenario.id === 'conservative' ? 'Conservador' :
                       scenario.id === 'base' ? 'Base' : 'Otimista'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{scenario.description}</p>
                  <div className="mt-2 text-xs">
                    <div className="flex justify-between">
                      <span>Receita:</span>
                      <span className="font-medium">{formatCurrency(scenario.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button className="w-full mt-4" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Cenário
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Receita</p>
                    <p className="text-xl font-bold">{formatCurrency(currentScenario.revenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">EBITDA</p>
                    <p className="text-xl font-bold">{formatCurrency(currentScenario.ebitda)}</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Margem EBITDA</p>
                    <p className="text-xl font-bold">{currentScenario.margin}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-0.3%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Fluxo de Caixa</p>
                    <p className="text-xl font-bold">{formatCurrency(currentScenario.cashFlow)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+5.7%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drivers Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Direcionadores de Negócio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sales" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sales">Vendas</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="operations">Operações</TabsTrigger>
                  <TabsTrigger value="finance">Financeiro</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4" />
                          Tamanho da Equipe de Vendas: {drivers.salesTeamSize[0]} pessoas
                        </Label>
                        <Slider
                          value={drivers.salesTeamSize}
                          onValueChange={(value) => updateDriver('salesTeamSize', value)}
                          max={50}
                          min={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>10</span>
                          <span>50</span>
                        </div>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <ShoppingCart className="h-4 w-4" />
                          Ticket Médio: {formatCurrency(drivers.averageTicket[0])}
                        </Label>
                        <Slider
                          value={drivers.averageTicket}
                          onValueChange={(value) => updateDriver('averageTicket', value)}
                          max={5000}
                          min={1000}
                          step={100}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>R$ 1.000</span>
                          <span>R$ 5.000</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4" />
                          Taxa de Conversão: {drivers.conversionRate[0]}%
                        </Label>
                        <Slider
                          value={drivers.conversionRate}
                          onValueChange={(value) => updateDriver('conversionRate', value)}
                          max={30}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>5%</span>
                          <span>30%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Impacto Calculado</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <div>Receita Projetada: <span className="font-medium">{formatCurrency(currentScenario.revenue)}</span></div>
                          <div>Crescimento: <span className="font-medium text-green-600">+12.5%</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="marketing" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4" />
                          Investimento em Marketing: {formatCurrency(drivers.marketingSpend[0])}
                        </Label>
                        <Slider
                          value={drivers.marketingSpend}
                          onValueChange={(value) => updateDriver('marketingSpend', value)}
                          max={100000}
                          min={20000}
                          step={5000}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>R$ 20.000</span>
                          <span>R$ 100.000</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">ROI do Marketing</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <div>Retorno Estimado: <span className="font-medium">4.2x</span></div>
                        <div>Novos Clientes: <span className="font-medium">+28</span></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="operations" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Briefcase className="h-4 w-4" />
                          Custos Operacionais: {formatCurrency(drivers.operationalCosts[0])}
                        </Label>
                        <Slider
                          value={drivers.operationalCosts}
                          onValueChange={(value) => updateDriver('operationalCosts', value)}
                          max={300000}
                          min={100000}
                          step={10000}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>R$ 100.000</span>
                          <span>R$ 300.000</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Eficiência Operacional</h4>
                      <div className="text-sm text-yellow-800 space-y-1">
                        <div>Margem Bruta: <span className="font-medium">65.3%</span></div>
                        <div>Produtividade: <span className="font-medium">Alta</span></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="finance" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="capex">CAPEX Planejado</Label>
                        <Input id="capex" type="number" placeholder="150000" />
                      </div>
                      <div>
                        <Label htmlFor="working-capital">Capital de Giro Adicional</Label>
                        <Input id="working-capital" type="number" placeholder="50000" />
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Impacto no Fluxo de Caixa</h4>
                      <div className="text-sm text-purple-800 space-y-1">
                        <div>Caixa Livre: <span className="font-medium">{formatCurrency(currentScenario.cashFlow)}</span></div>
                        <div>Payback: <span className="font-medium">18 meses</span></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Scenario Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Cenários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Métrica</th>
                      <th className="text-center py-2">Conservador</th>
                      <th className="text-center py-2">Base</th>
                      <th className="text-center py-2">Otimista</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Receita</td>
                      <td className="text-center py-2">{formatCurrency(scenarios[0].revenue)}</td>
                      <td className="text-center py-2 font-medium">{formatCurrency(scenarios[1].revenue)}</td>
                      <td className="text-center py-2">{formatCurrency(scenarios[2].revenue)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">EBITDA</td>
                      <td className="text-center py-2">{formatCurrency(scenarios[0].ebitda)}</td>
                      <td className="text-center py-2 font-medium">{formatCurrency(scenarios[1].ebitda)}</td>
                      <td className="text-center py-2">{formatCurrency(scenarios[2].ebitda)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Margem EBITDA</td>
                      <td className="text-center py-2">{scenarios[0].margin}%</td>
                      <td className="text-center py-2 font-medium">{scenarios[1].margin}%</td>
                      <td className="text-center py-2">{scenarios[2].margin}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Fluxo de Caixa</td>
                      <td className="text-center py-2">{formatCurrency(scenarios[0].cashFlow)}</td>
                      <td className="text-center py-2 font-medium">{formatCurrency(scenarios[1].cashFlow)}</td>
                      <td className="text-center py-2">{formatCurrency(scenarios[2].cashFlow)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientFPAScenarios;
