import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Settings,
  Calculator,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { toast } from 'sonner';

const ClientFPAScenarios = () => {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [newScenarioName, setNewScenarioName] = useState('');
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);

  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  
  const currentClient = clients.find(client => {
    return client.client_profile?.id === user?.id;
  });

  const scenarios = [
    {
      id: 'base',
      name: 'Cenário Base',
      description: 'Projeção baseada nos dados históricos',
      revenue: 2850000,
      growth: 12.5,
      status: 'active'
    },
    {
      id: 'optimistic',
      name: 'Cenário Otimista',
      description: 'Projeção com crescimento acelerado',
      revenue: 3420000,
      growth: 25.8,
      status: 'draft'
    },
    {
      id: 'conservative',
      name: 'Cenário Conservador',
      description: 'Projeção com crescimento moderado',
      revenue: 2280000,
      growth: 5.2,
      status: 'draft'
    }
  ];

  const handleCreateScenario = async () => {
    if (!newScenarioName.trim()) {
      toast.error('Digite um nome para o cenário');
      return;
    }

    setIsCreatingScenario(true);
    try {
      // Simular criação de cenário
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cenário criado com sucesso!');
      setNewScenarioName('');
    } catch (error) {
      toast.error('Erro ao criar cenário');
    } finally {
      setIsCreatingScenario(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Configuração FP&A Necessária</h3>
        <p className="text-gray-600">
          Complete o onboarding FP&A para acessar a análise de cenários.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análise de Cenários</h1>
        <p className="text-gray-600 mt-1">
          Compare diferentes projeções e cenários financeiros
        </p>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Criar Novo Cenário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Novo Cenário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="scenario-name">Nome do Cenário</Label>
                  <Input
                    id="scenario-name"
                    placeholder="Ex: Cenário Pessimista"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateScenario}
                    disabled={isCreatingScenario || !newScenarioName.trim()}
                  >
                    {isCreatingScenario ? 'Criando...' : 'Criar Cenário'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Cenários */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`cursor-pointer transition-all ${
                  selectedScenario === scenario.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <Badge variant={scenario.status === 'active' ? 'default' : 'secondary'}>
                      {scenario.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Receita Projetada</span>
                      <span className="font-semibold">{formatCurrency(scenario.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Crescimento</span>
                      <div className="flex items-center gap-1">
                        {scenario.growth > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-semibold ${
                          scenario.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {scenario.growth > 0 ? '+' : ''}{scenario.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calculator className="h-4 w-4 mr-1" />
                        Calcular
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparação de Cenários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="text-center p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{scenario.name}</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency(scenario.revenue)}
                      </div>
                      <div className={`text-sm ${
                        scenario.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {scenario.growth > 0 ? '+' : ''}{scenario.growth}% crescimento
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de comparação será implementado aqui</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Principais Métricas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Maior Receita:</span>
                        <span className="font-medium">Cenário Otimista</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Menor Risco:</span>
                        <span className="font-medium">Cenário Conservador</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recomendado:</span>
                        <span className="font-medium">Cenário Base</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Análise de Risco</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Probabilidade Alta:</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Probabilidade Média:</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Probabilidade Baixa:</span>
                        <span className="font-medium">35%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientFPAScenarios;
