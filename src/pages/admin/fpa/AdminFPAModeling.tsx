
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Plus,
  Save,
  Copy,
  Play,
  Settings,
  TrendingUp,
  Calculator,
  Target,
  Layers,
  Code,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const AdminFPAModeling = () => {
  const [selectedModel, setSelectedModel] = useState('techcorp-model');

  // Mock financial models
  const models = [
    {
      id: 'techcorp-model',
      name: "Modelo TechCorp - Q1 2024",
      client: "TechCorp Ltda",
      status: "active",
      version: "v2.1",
      lastUpdate: "2024-03-20",
      horizon: "18 meses",
      drivers: 12,
      scenarios: 3
    },
    {
      id: 'innovate-model',
      name: "Modelo InnovateLab - 2024",
      client: "InnovateLab S.A.",
      status: "draft",
      version: "v1.0",
      lastUpdate: "2024-03-18",
      horizon: "12 meses",
      drivers: 8,
      scenarios: 2
    },
    {
      id: 'greentech-model',
      name: "Modelo GreenTech - Rolling",
      client: "GreenTech Solutions",
      status: "active",
      version: "v3.2",
      lastUpdate: "2024-03-19",
      horizon: "24 meses",
      drivers: 15,
      scenarios: 5
    }
  ];

  // Mock business drivers
  const businessDrivers = [
    {
      id: 1,
      name: "Tamanho da Equipe de Vendas",
      category: "Vendas",
      type: "integer",
      currentValue: 25,
      formula: "COUNT(vendedores_ativos)",
      impact: "Receita",
      weight: 0.85
    },
    {
      id: 2,
      name: "Ticket Médio",
      category: "Vendas",
      type: "currency",
      currentValue: 2500,
      formula: "AVG(valor_vendas)",
      impact: "Receita",
      weight: 0.75
    },
    {
      id: 3,
      name: "Taxa de Conversão",
      category: "Vendas",
      type: "percentage",
      currentValue: 15,
      formula: "vendas_fechadas / leads_qualificados * 100",
      impact: "Receita",
      weight: 0.90
    },
    {
      id: 4,
      name: "Investimento Marketing",
      category: "Marketing",
      type: "currency",
      currentValue: 50000,
      formula: "SUM(gastos_marketing_mensal)",
      impact: "Custo",
      weight: 0.60
    },
    {
      id: 5,
      name: "Custos Operacionais",
      category: "Operacional",
      type: "currency",
      currentValue: 180000,
      formula: "SUM(custos_fixos + custos_variaveis)",
      impact: "Custo",
      weight: 0.95
    }
  ];

  // Mock financial statements structure
  const financialStatements = {
    dre: [
      { item: "Receita Operacional Bruta", formula: "vendas_equipe * ticket_medio * conversao", category: "receita" },
      { item: "Deduções", formula: "receita_bruta * 0.12", category: "deducoes" },
      { item: "Receita Operacional Líquida", formula: "receita_bruta - deducoes", category: "receita" },
      { item: "Custo dos Produtos Vendidos", formula: "receita_liquida * margem_custo", category: "custo" },
      { item: "Lucro Bruto", formula: "receita_liquida - cpv", category: "lucro" },
      { item: "Despesas Operacionais", formula: "custos_operacionais + marketing", category: "despesa" },
      { item: "EBITDA", formula: "lucro_bruto - despesas_operacionais", category: "resultado" }
    ],
    balanco: [
      { item: "Ativo Circulante", formula: "caixa + contas_receber + estoque", category: "ativo" },
      { item: "Ativo Não Circulante", formula: "imobilizado + intangivel", category: "ativo" },
      { item: "Passivo Circulante", formula: "fornecedores + salarios + impostos", category: "passivo" },
      { item: "Patrimônio Líquido", formula: "capital_social + reservas + lucros_acumulados", category: "patrimonio" }
    ],
    fluxo: [
      { item: "Caixa Operacional", formula: "ebitda - impostos - capital_giro", category: "operacional" },
      { item: "Caixa Investimento", formula: "capex * -1", category: "investimento" },
      { item: "Caixa Financiamento", formula: "emprestimos - pagamento_dividendos", category: "financiamento" },
      { item: "Variação de Caixa", formula: "op + inv + fin", category: "resultado" }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
      case 'draft': return <Badge className="bg-yellow-100 text-yellow-700">Rascunho</Badge>;
      case 'archived': return <Badge variant="outline">Arquivado</Badge>;
      default: return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Receita': return 'text-green-600 bg-green-100';
      case 'Custo': return 'text-red-600 bg-red-100';
      case 'Margem': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Motor de Modelagem e Previsão</h1>
          <p className="text-gray-600 mt-1">
            Ambiente flexível para construir e gerenciar modelos financeiros baseados em direcionadores
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      {/* Model Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Modelos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedModel === model.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{model.name}</h4>
                  {getStatusBadge(model.status)}
                </div>
                <p className="text-sm text-gray-600 mb-3">{model.client}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>Versão: {model.version}</div>
                  <div>Horizonte: {model.horizon}</div>
                  <div>Direcionadores: {model.drivers}</div>
                  <div>Cenários: {model.scenarios}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="drivers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="drivers">Direcionadores</TabsTrigger>
          <TabsTrigger value="statements">Demonstrações</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="forecast">Rolling Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-6">
          {/* Business Drivers Management */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Direcionadores de Negócio</h2>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Direcionador
            </Button>
          </div>

          <div className="space-y-4">
            {businessDrivers.map((driver) => (
              <Card key={driver.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Calculator className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                          <p className="text-sm text-gray-600">Categoria: {driver.category}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Valor Atual</p>
                          <p className="font-medium text-lg">
                            {formatValue(driver.currentValue, driver.type)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Impacto</p>
                          <Badge className={`${getImpactColor(driver.impact)} text-xs`}>
                            {driver.impact}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Peso/Influência</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${driver.weight * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{Math.round(driver.weight * 100)}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Tipo</p>
                          <p className="font-medium capitalize">{driver.type}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Fórmula de Cálculo:</p>
                        <code className="text-sm font-mono text-gray-800">{driver.formula}</code>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        Testar
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          {/* Financial Statements Builder */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Demonstrações Financeiras Integradas</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualizar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DRE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demonstração de Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialStatements.dre.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{item.item}</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <code className="text-xs text-gray-600 bg-gray-100 p-1 rounded block">
                        {item.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Balanço */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Balanço Patrimonial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialStatements.balanco.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{item.item}</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <code className="text-xs text-gray-600 bg-gray-100 p-1 rounded block">
                        {item.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fluxo de Caixa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialStatements.fluxo.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{item.item}</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <code className="text-xs text-gray-600 bg-gray-100 p-1 rounded block">
                        {item.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Scenario Management */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Cenários de Análise</h2>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Cenário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-700">Cenário Conservador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-gray-600">Crescimento moderado com foco em eficiência</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Equipe Vendas:</span>
                      <span className="font-medium">22 pessoas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Marketing:</span>
                      <span className="font-medium">R$ 35.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Conversão:</span>
                      <span className="font-medium">12%</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Receita Projetada:</span>
                      <span className="text-red-600">R$ 2.65M</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Cenário Base</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-gray-600">Projeção realista baseada em tendências atuais</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Equipe Vendas:</span>
                      <span className="font-medium">25 pessoas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Marketing:</span>
                      <span className="font-medium">R$ 50.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Conversão:</span>
                      <span className="font-medium">15%</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Receita Projetada:</span>
                      <span className="text-blue-600">R$ 2.85M</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">Cenário Otimista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-gray-600">Crescimento acelerado com investimentos</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Equipe Vendas:</span>
                      <span className="font-medium">30 pessoas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Marketing:</span>
                      <span className="font-medium">R$ 75.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Conversão:</span>
                      <span className="font-medium">18%</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Receita Projetada:</span>
                      <span className="text-green-600">R$ 3.20M</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          {/* Rolling Forecast Management */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Rolling Forecast</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
              <Button className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Atualizar Forecast
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurações do Rolling Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="horizon">Horizonte de Previsão</Label>
                  <select id="horizon" className="w-full p-2 border rounded-md mt-1">
                    <option value="12">12 meses</option>
                    <option value="18" selected>18 meses</option>
                    <option value="24">24 meses</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="frequency">Frequência de Atualização</Label>
                  <select id="frequency" className="w-full p-2 border rounded-md mt-1">
                    <option value="monthly" selected>Mensal</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="autoUpdate">Atualização Automática</Label>
                  <select id="autoUpdate" className="w-full p-2 border rounded-md mt-1">
                    <option value="true" selected>Ativada</option>
                    <option value="false">Desativada</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Atualizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Atualização Abril 2024</h4>
                    <p className="text-sm text-gray-600">Adicionar período Outubro 2025, remover Março 2024</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">Programada</Badge>
                    <span className="text-sm text-gray-500">01/04/2024</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Calibração Direcionadores</h4>
                    <p className="text-sm text-gray-600">Ajustar direcionadores baseado nos dados reais de Março</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>
                    <span className="text-sm text-gray-500">05/04/2024</span>
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

export default AdminFPAModeling;
