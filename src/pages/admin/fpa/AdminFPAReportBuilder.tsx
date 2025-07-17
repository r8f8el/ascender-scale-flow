
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  BarChart3,
  TrendingUp,
  FileText,
  Image,
  Table,
  Layout,
  Save,
  Eye,
  Copy,
  Download,
  Plus,
  Trash2,
  Move,
  Settings
} from 'lucide-react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import FPAClientSelector from '@/components/fpa/FPAClientSelector';
import FPAPeriodSelector from '@/components/fpa/FPAPeriodSelector';

const AdminFPAReportBuilder = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState('executive');
  const [reportComponents, setReportComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: clients = [] } = useFPAClients();
  const { data: periods = [] } = useFPAPeriods(selectedClient);
  const { data: financialData = [] } = useFPAFinancialData(selectedClient, selectedPeriod);
  const { toast } = useToast();

  const componentTypes = [
    { 
      id: 'header', 
      name: 'Cabeçalho', 
      icon: FileText, 
      description: 'Título e informações básicas do relatório',
      config: { title: '', subtitle: '', period: '' }
    },
    { 
      id: 'kpi-grid', 
      name: 'Grid de KPIs', 
      icon: BarChart3, 
      description: 'Cartões com métricas principais',
      config: { metrics: ['revenue', 'ebitda', 'net_income', 'cash_balance'] }
    },
    { 
      id: 'revenue-chart', 
      name: 'Gráfico de Receita', 
      icon: PieChart, 
      description: 'Evolução da receita',
      config: { chartType: 'line', period: 'monthly' }
    },
    { 
      id: 'variance-table', 
      name: 'Tabela de Variações', 
      icon: Table, 
      description: 'Análise de variações vs orçamento',
      config: { showPercentage: true, highlightVariances: true }
    },
    { 
      id: 'cash-flow', 
      name: 'Fluxo de Caixa', 
      icon: TrendingUp, 
      description: 'Análise do fluxo de caixa',
      config: { periods: 12, showProjection: true }
    },
    { 
      id: 'insights', 
      name: 'Insights e Comentários', 
      icon: FileText, 
      description: 'Análises e comentários executivos',
      config: { autoGenerate: true, includeRecommendations: true }
    }
  ];

  const addComponent = (componentType: any) => {
    const newComponent = {
      id: Date.now(),
      type: componentType.id,
      title: componentType.name,
      config: { ...componentType.config },
      position: reportComponents.length + 1
    };
    setReportComponents([...reportComponents, newComponent]);
  };

  const removeComponent = (componentId: number) => {
    setReportComponents(reportComponents.filter(c => c.id !== componentId));
  };

  const updateComponent = (componentId: number, updates: any) => {
    setReportComponents(reportComponents.map(c => 
      c.id === componentId ? { ...c, ...updates } : c
    ));
  };

  const generateReport = async () => {
    if (!selectedClient || !selectedPeriod || !reportTitle) {
      toast({
        title: "Erro",
        description: "Selecione um cliente, período e título para o relatório",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const reportContent = {
        components: reportComponents,
        client_id: selectedClient,
        period_id: selectedPeriod,
        financial_data: financialData,
        generated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('fpa_reports')
        .insert({
          fpa_client_id: selectedClient,
          title: reportTitle,
          report_type: reportType,
          period_covered: selectedPeriod,
          content: reportContent,
          insights: reportDescription,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso!"
      });

      // Reset form
      setReportTitle('');
      setReportDescription('');
      setReportComponents([]);
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getComponentIcon = (type: string) => {
    const component = componentTypes.find(c => c.id === type);
    if (component) {
      const IconComponent = component.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Layout className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Construtor de Relatórios FP&A</h1>
          <p className="text-gray-600 mt-1">
            Crie relatórios personalizados com dados reais dos clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button 
            onClick={generateReport} 
            disabled={isGenerating || !selectedClient || !selectedPeriod}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </div>
      </div>

      {/* Client and Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FPAClientSelector 
              value={selectedClient}
              onChange={setSelectedClient}
            />
            <FPAPeriodSelector 
              clientId={selectedClient}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportTitle">Título do Relatório</Label>
              <Input 
                id="reportTitle"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Ex: Relatório Mensal - Janeiro 2024"
              />
            </div>
            <div>
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <select 
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="executive">Executivo</option>
                <option value="detailed">Detalhado</option>
                <option value="variance">Análise de Variações</option>
                <option value="forecast">Projeções</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="reportDescription">Descrição/Insights</Label>
            <Textarea 
              id="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Descreva os principais insights e objetivos do relatório..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Component Palette */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Componentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {componentTypes.map((component) => {
                  const IconComponent = component.icon;
                  return (
                    <div
                      key={component.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => addComponent(component)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">{component.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{component.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Canvas do Relatório</CardTitle>
                <Badge variant="outline">
                  {reportComponents.length} componentes
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[600px] border-2 border-dashed border-gray-300 rounded-lg p-4">
                {reportComponents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Plus className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium mb-2">Adicione componentes ao relatório</p>
                    <p className="text-sm">Clique nos componentes à esquerda para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportComponents
                      .sort((a, b) => a.position - b.position)
                      .map((component) => (
                        <div
                          key={component.id}
                          className={`p-4 border rounded-lg bg-white hover:shadow-md transition-shadow group cursor-pointer ${
                            selectedComponent?.id === component.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedComponent(component)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              {getComponentIcon(component.type)}
                              <span className="font-medium">{component.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {component.type}
                              </Badge>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedComponent(component);
                                }}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeComponent(component.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded p-4 min-h-[120px] flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-gray-600 font-medium mb-2">{component.title}</p>
                              <p className="text-sm text-gray-500">
                                {component.type === 'kpi-grid' && 'Métricas: Receita, EBITDA, Lucro'}
                                {component.type === 'revenue-chart' && 'Gráfico de linha - Receita'}
                                {component.type === 'variance-table' && 'Tabela de variações'}
                                {component.type === 'cash-flow' && 'Fluxo de caixa operacional'}
                                {component.type === 'insights' && 'Comentários executivos'}
                                {component.type === 'header' && 'Cabeçalho do relatório'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedComponent ? 'Propriedades' : 'Selecione um Componente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedComponent ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="componentTitle">Título</Label>
                    <Input 
                      id="componentTitle"
                      value={selectedComponent.title}
                      onChange={(e) => updateComponent(selectedComponent.id, { title: e.target.value })}
                      placeholder="Nome do componente"
                    />
                  </div>
                  
                  {selectedComponent.type === 'kpi-grid' && (
                    <div>
                      <Label>Métricas</Label>
                      <div className="space-y-2 mt-2">
                        {['revenue', 'ebitda', 'net_income', 'cash_balance'].map(metric => (
                          <label key={metric} className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              checked={selectedComponent.config.metrics.includes(metric)}
                              onChange={(e) => {
                                const metrics = e.target.checked
                                  ? [...selectedComponent.config.metrics, metric]
                                  : selectedComponent.config.metrics.filter((m: string) => m !== metric);
                                updateComponent(selectedComponent.id, { 
                                  config: { ...selectedComponent.config, metrics }
                                });
                              }}
                            />
                            <span className="text-sm capitalize">{metric.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedComponent.type === 'revenue-chart' && (
                    <div>
                      <Label htmlFor="chartType">Tipo de Gráfico</Label>
                      <select 
                        id="chartType"
                        value={selectedComponent.config.chartType}
                        onChange={(e) => updateComponent(selectedComponent.id, { 
                          config: { ...selectedComponent.config, chartType: e.target.value }
                        })}
                        className="w-full p-2 border rounded-md mt-1"
                      >
                        <option value="line">Linha</option>
                        <option value="bar">Barras</option>
                        <option value="area">Área</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => removeComponent(selectedComponent.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Componente
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Clique em um componente no canvas para editar suas propriedades
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminFPAReportBuilder;
