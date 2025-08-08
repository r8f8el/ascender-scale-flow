
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calculator,
  Eye,
  Settings,
  Plus,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { toast } from 'sonner';

const ClientFPAScenarios = () => {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState('');
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);

  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  
  const currentClient = clients.find(client => 
    client.client_profile?.id === user?.id
  );

  // Dados mock para cenários interativos
  const scenarios = [
    {
      id: '1',
      name: 'Cenário Base 2024',
      description: 'Projeção conservadora baseada no histórico',
      type: 'base',
      status: 'ativo',
      created_at: '2024-01-15T10:00:00Z',
      assumptions: {
        receita_crescimento: 15,
        margem_bruta: 35,
        despesas_crescimento: 8,
        investimentos: 500000
      },
      results: {
        receita_anual: 12500000,
        lucro_liquido: 1875000,
        ebitda: 2750000,
        margem_ebitda: 22
      }
    },
    {
      id: '2',
      name: 'Cenário Otimista',
      description: 'Projeção com crescimento acelerado',
      type: 'otimista',
      status: 'ativo',
      created_at: '2024-01-20T14:30:00Z',
      assumptions: {
        receita_crescimento: 25,
        margem_bruta: 38,
        despesas_crescimento: 12,
        investimentos: 750000
      },
      results: {
        receita_anual: 15625000,
        lucro_liquido: 2968750,
        ebitda: 4218750,
        margem_ebitda: 27
      }
    },
    {
      id: '3',
      name: 'Cenário Pessimista',
      description: 'Projeção conservadora com desafios',
      type: 'pessimista',
      status: 'rascunho',
      created_at: '2024-01-25T09:15:00Z',
      assumptions: {
        receita_crescimento: 5,
        margem_bruta: 30,
        despesas_crescimento: 15,
        investimentos: 250000
      },
      results: {
        receita_anual: 10500000,
        lucro_liquido: 945000,
        ebitda: 1575000,
        margem_ebitda: 15
      }
    }
  ];

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'otimista':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'pessimista':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
      case 'rascunho':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Rascunho</Badge>;
      case 'arquivado':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Arquivado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
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

  const handleCreateScenario = () => {
    setIsCreatingScenario(true);
    // Simular criação de cenário
    setTimeout(() => {
      setIsCreatingScenario(false);
      toast.success('Novo cenário criado com sucesso!');
    }, 2000);
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando cenários...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cenários Interativos</h1>
          <p className="text-gray-600 mt-1">
            Explore diferentes cenários financeiros e suas projeções
          </p>
        </div>
        <Button onClick={handleCreateScenario} disabled={isCreatingScenario}>
          {isCreatingScenario ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cenário
            </>
          )}
        </Button>
      </div>

      {/* Resumo dos Cenários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Cenários Ativos</p>
                <p className="text-2xl font-bold">
                  {scenarios.filter(s => s.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Melhor Cenário</p>
                <p className="text-lg font-bold">
                  {Math.max(...scenarios.map(s => s.results.margem_ebitda))}%
                </p>
                <p className="text-xs text-gray-500">Margem EBITDA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Cenários</p>
                <p className="text-2xl font-bold">{scenarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cenários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getScenarioIcon(scenario.type)}
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                </div>
                {getStatusBadge(scenario.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Premissas */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Premissas Principais</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Crescimento Receita:</span>
                    <span className="font-medium">{scenario.assumptions.receita_crescimento}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margem Bruta:</span>
                    <span className="font-medium">{scenario.assumptions.margem_bruta}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crescimento Despesas:</span>
                    <span className="font-medium">{scenario.assumptions.despesas_crescimento}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investimentos:</span>
                    <span className="font-medium">{formatCurrency(scenario.assumptions.investimentos)}</span>
                  </div>
                </div>
              </div>

              {/* Resultados */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Projeções Financeiras</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-blue-50 rounded">
                    <span>Receita Anual:</span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(scenario.results.receita_anual)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span>EBITDA:</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(scenario.results.ebitda)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-purple-50 rounded">
                    <span>Lucro Líquido:</span>
                    <span className="font-bold text-purple-700">
                      {formatCurrency(scenario.results.lucro_liquido)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-orange-50 rounded">
                    <span>Margem EBITDA:</span>
                    <span className="font-bold text-orange-700">
                      {scenario.results.margem_ebitda}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparação de Cenários */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Cenários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="font-medium">Métrica</div>
            {scenarios.map(scenario => (
              <div key={scenario.id} className="font-medium text-center">
                {scenario.name}
              </div>
            ))}
            
            <div className="text-sm text-gray-600">Receita Anual</div>
            {scenarios.map(scenario => (
              <div key={`receita-${scenario.id}`} className="text-sm text-center">
                {formatCurrency(scenario.results.receita_anual)}
              </div>
            ))}
            
            <div className="text-sm text-gray-600">Margem EBITDA</div>
            {scenarios.map(scenario => (
              <div key={`ebitda-${scenario.id}`} className="text-sm text-center font-medium">
                {scenario.results.margem_ebitda}%
              </div>
            ))}
            
            <div className="text-sm text-gray-600">Lucro Líquido</div>
            {scenarios.map(scenario => (
              <div key={`lucro-${scenario.id}`} className="text-sm text-center">
                {formatCurrency(scenario.results.lucro_liquido)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientFPAScenarios;
