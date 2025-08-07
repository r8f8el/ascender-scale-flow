
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calculator,
  Save,
  Copy,
  Play,
  RefreshCw,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

interface Scenario {
  id: string;
  name: string;
  type: 'optimistic' | 'pessimistic' | 'base';
  drivers: Record<string, number>;
  results: {
    revenue: number;
    ebitda: number;
    netIncome: number;
    cashFlow: number;
    margin: number;
  };
  created_at: string;
}

interface Driver {
  id: string;
  name: string;
  type: string;
  unit: string;
  current_value: number;
  min_value: number;
  max_value: number;
}

const FPAScenarioBuilder: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'Crescimento de Receita',
      type: 'revenue',
      unit: '%',
      current_value: 15,
      min_value: -20,
      max_value: 50
    },
    {
      id: '2', 
      name: 'Margem Bruta',
      type: 'cost',
      unit: '%',
      current_value: 35,
      min_value: 20,
      max_value: 60
    },
    {
      id: '3',
      name: 'Investimento em Marketing',
      type: 'operational',
      unit: '% receita',
      current_value: 8,
      min_value: 2,
      max_value: 20
    },
    {
      id: '4',
      name: 'Novas Contratações',
      type: 'headcount',
      unit: 'pessoas',
      current_value: 10,
      min_value: 0,
      max_value: 50
    }
  ]);

  const [currentValues, setCurrentValues] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Initialize current values from drivers
    const initialValues: Record<string, number> = {};
    drivers.forEach(driver => {
      initialValues[driver.id] = driver.current_value;
    });
    setCurrentValues(initialValues);
    
    // Create base scenario
    createScenario('Cenário Base', 'base', initialValues);
  }, []);

  const calculateResults = (driverValues: Record<string, number>) => {
    // Simplified financial model calculation
    const revenueGrowth = driverValues['1'] / 100;
    const grossMargin = driverValues['2'] / 100;
    const marketingSpend = driverValues['3'] / 100;
    const newHires = driverValues['4'];

    const baseRevenue = 10000000; // R$ 10M base
    const revenue = baseRevenue * (1 + revenueGrowth);
    const grossProfit = revenue * grossMargin;
    const marketingCost = revenue * marketingSpend;
    const hiringCost = newHires * 8000 * 12; // R$ 8k/month per person
    const operationalExpenses = marketingCost + hiringCost + 2000000; // Fixed costs
    
    const ebitda = grossProfit - operationalExpenses;
    const netIncome = ebitda * 0.75; // Simplified tax/interest
    const cashFlow = netIncome + 500000; // Add back depreciation
    const margin = (ebitda / revenue) * 100;

    return {
      revenue,
      ebitda,
      netIncome,
      cashFlow,
      margin
    };
  };

  const createScenario = (name: string, type: Scenario['type'], driverValues: Record<string, number>) => {
    const results = calculateResults(driverValues);
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name,
      type,
      drivers: { ...driverValues },
      results,
      created_at: new Date().toISOString()
    };

    setScenarios(prev => [...prev, newScenario]);
    setActiveScenario(newScenario);
    return newScenario;
  };

  const handleDriverChange = (driverId: string, value: number) => {
    setCurrentValues(prev => ({
      ...prev,
      [driverId]: value
    }));
  };

  const handleCalculateScenario = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const results = calculateResults(currentValues);
      if (activeScenario) {
        const updatedScenario = {
          ...activeScenario,
          drivers: { ...currentValues },
          results
        };
        setActiveScenario(updatedScenario);
        setScenarios(prev => prev.map(s => s.id === activeScenario.id ? updatedScenario : s));
      }
      setIsCalculating(false);
    }, 1000);
  };

  const handleSaveScenario = () => {
    const name = prompt('Nome do cenário:');
    if (name) {
      createScenario(name, 'base', currentValues);
      toast.success('Cenário salvo com sucesso!');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'optimistic': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'pessimistic': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  // Prepare chart data
  const chartData = scenarios.map(scenario => ({
    name: scenario.name,
    receita: scenario.results.revenue / 1000000,
    ebitda: scenario.results.ebitda / 1000000,
    lucroLiquido: scenario.results.netIncome / 1000000
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Análise de Cenários What-If</h3>
          <p className="text-gray-600">Explore diferentes cenários e veja o impacto nos resultados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveScenario}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Cenário
          </Button>
          <Button onClick={handleCalculateScenario} disabled={isCalculating}>
            {isCalculating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Calcular
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Direcionadores</CardTitle>
              <p className="text-sm text-gray-600">Ajuste os valores para ver o impacto</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {drivers.map(driver => (
                <div key={driver.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">{driver.name}</Label>
                    <Badge variant="secondary">
                      {currentValues[driver.id]?.toFixed(1) || driver.current_value} {driver.unit}
                    </Badge>
                  </div>
                  <Slider
                    value={[currentValues[driver.id] || driver.current_value]}
                    onValueChange={([value]) => handleDriverChange(driver.id, value)}
                    min={driver.min_value}
                    max={driver.max_value}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{driver.min_value}{driver.unit}</span>
                    <span>{driver.max_value}{driver.unit}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
              <TabsTrigger value="scenarios">Cenários Salvos</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              {activeScenario && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Receita</p>
                            <p className="font-bold">{formatCurrency(activeScenario.results.revenue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">EBITDA</p>
                            <p className="font-bold">{formatCurrency(activeScenario.results.ebitda)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Lucro Líquido</p>
                            <p className="font-bold">{formatCurrency(activeScenario.results.netIncome)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Margem EBITDA</p>
                            <p className="font-bold">{activeScenario.results.margin.toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Projetada</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{
                            name: 'Projetado',
                            receita: activeScenario.results.revenue / 1000000,
                            ebitda: activeScenario.results.ebitda / 1000000,
                            lucroLiquido: activeScenario.results.netIncome / 1000000
                          }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value}M`, '']} />
                            <Bar dataKey="receita" fill="#3B82F6" name="Receita" />
                            <Bar dataKey="ebitda" fill="#10B981" name="EBITDA" />
                            <Bar dataKey="lucroLiquido" fill="#8B5CF6" name="Lucro Líquido" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Cenários</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`R$ ${value}M`, '']} />
                          <Bar dataKey="receita" fill="#3B82F6" name="Receita" />
                          <Bar dataKey="ebitda" fill="#10B981" name="EBITDA" />
                          <Bar dataKey="lucroLiquido" fill="#8B5CF6" name="Lucro Líquido" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">Nenhum cenário para comparar</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios">
              <div className="space-y-4">
                {scenarios.map(scenario => (
                  <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getScenarioIcon(scenario.type)}
                          <div>
                            <h4 className="font-medium">{scenario.name}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(scenario.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">EBITDA</p>
                            <p className="font-bold">{formatCurrency(scenario.results.ebitda)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Margem</p>
                            <p className="font-bold">{scenario.results.margin.toFixed(1)}%</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setActiveScenario(scenario);
                              setCurrentValues(scenario.drivers);
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Carregar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FPAScenarioBuilder;
