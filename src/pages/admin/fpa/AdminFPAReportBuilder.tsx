
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

const AdminFPAReportBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('executive');
  const [reportComponents, setReportComponents] = useState([
    { id: 1, type: 'header', title: 'Relatório Mensal de Performance', position: 1 },
    { id: 2, type: 'kpi-grid', title: 'KPIs Principais', position: 2 },
    { id: 3, type: 'chart', title: 'Gráfico de Receita', position: 3 },
    { id: 4, type: 'variance-table', title: 'Análise de Variação', position: 4 },
    { id: 5, type: 'text', title: 'Comentários Executivos', position: 5 }
  ]);

  // Mock report templates
  const reportTemplates = [
    {
      id: 'executive',
      name: 'Resumo Executivo',
      description: 'Visão de alto nível para executivos',
      components: ['header', 'kpi-grid', 'chart', 'insights'],
      frequency: 'Mensal'
    },
    {
      id: 'detailed',
      name: 'Análise Detalhada',
      description: 'Relatório completo com drill-down',
      components: ['header', 'variance-table', 'chart', 'assumptions', 'recommendations'],
      frequency: 'Mensal'
    },
    {
      id: 'variance',
      name: 'Foco em Variações',
      description: 'Análise específica de variações',
      components: ['header', 'variance-summary', 'variance-table', 'root-cause'],
      frequency: 'Sob demanda'
    },
    {
      id: 'forecast',
      name: 'Rolling Forecast',
      description: 'Atualização de previsões',
      components: ['header', 'forecast-chart', 'assumptions', 'scenarios'],
      frequency: 'Mensal'
    }
  ];

  // Mock chart library
  const chartLibrary = [
    {
      id: 1,
      name: 'Receita vs Orçamento',
      type: 'bar',
      category: 'Performance',
      preview: 'bar-chart-preview'
    },
    {
      id: 2,
      name: 'Margem EBITDA Trend',
      type: 'line',
      category: 'Tendência',
      preview: 'line-chart-preview'
    },
    {
      id: 3,
      name: 'Distribuição de Custos',
      type: 'pie',
      category: 'Composição',
      preview: 'pie-chart-preview'
    },
    {
      id: 4,
      name: 'Fluxo de Caixa',
      type: 'waterfall',
      category: 'Fluxo',
      preview: 'waterfall-chart-preview'
    }
  ];

  // Mock component types
  const componentTypes = [
    { id: 'header', name: 'Cabeçalho', icon: FileText, description: 'Título e informações básicas' },
    { id: 'kpi-grid', name: 'Grid de KPIs', icon: BarChart3, description: 'Cartões com métricas principais' },
    { id: 'chart', name: 'Gráfico', icon: PieChart, description: 'Visualizações de dados' },
    { id: 'table', name: 'Tabela', icon: Table, description: 'Dados tabulares' },
    { id: 'text', name: 'Texto', icon: FileText, description: 'Comentários e insights' },
    { id: 'image', name: 'Imagem', icon: Image, description: 'Gráficos e diagramas' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Construtor de Relatórios e Dashboards</h1>
          <p className="text-gray-600 mt-1">
            Interface arrastar e soltar para criar relatórios personalizados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Relatório
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Construtor</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
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
                          draggable
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Layout className="h-4 w-4 mr-1" />
                        Layout
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[600px] border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="space-y-4">
                      {reportComponents
                        .sort((a, b) => a.position - b.position)
                        .map((component) => (
                          <div
                            key={component.id}
                            className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow group"
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
                                <Button variant="ghost" size="sm">
                                  <Move className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Component Preview */}
                            <div className="bg-gray-50 rounded p-4 min-h-[120px] flex items-center justify-center">
                              <p className="text-gray-500 text-sm">
                                Preview: {component.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                        <Plus className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-blue-600 font-medium">Arraste componentes aqui</p>
                        <p className="text-sm text-gray-600">ou clique para adicionar</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Propriedades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="componentTitle">Título</Label>
                      <Input id="componentTitle" placeholder="Nome do componente" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label htmlFor="dataSource">Fonte de Dados</Label>
                      <select id="dataSource" className="w-full p-2 border rounded-md mt-1">
                        <option value="">Selecionar fonte...</option>
                        <option value="financial">Dados Financeiros</option>
                        <option value="operational">Dados Operacionais</option>
                        <option value="variance">Análise de Variação</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="chartType">Tipo de Visualização</Label>
                      <select id="chartType" className="w-full p-2 border rounded-md mt-1">
                        <option value="bar">Gráfico de Barras</option>
                        <option value="line">Gráfico de Linhas</option>
                        <option value="pie">Gráfico de Pizza</option>
                        <option value="table">Tabela</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="period">Período</Label>
                      <select id="period" className="w-full p-2 border rounded-md mt-1">
                        <option value="current">Período Atual</option>
                        <option value="ytd">Acumulado no Ano</option>
                        <option value="rolling">Rolling 12 Meses</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="style">Estilo</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button className="p-2 border rounded text-xs hover:bg-gray-50">
                          Padrão
                        </button>
                        <button className="p-2 border rounded text-xs hover:bg-gray-50">
                          Compacto
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Ações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar Componente
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Move className="h-4 w-4 mr-2" />
                      Reordenar
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Report Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequência:</span>
                      <span className="font-medium">{template.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Componentes:</span>
                      <span className="font-medium">{template.components.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                    >
                      {selectedTemplate === template.id ? "Selecionado" : "Usar Template"}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {/* Chart Library */}
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Gráficos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {chartLibrary.map((chart) => (
                  <div key={chart.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="w-full h-24 bg-gray-100 rounded mb-3 flex items-center justify-center">
                      {chart.type === 'bar' && <BarChart3 className="h-6 w-6 text-gray-400" />}
                      {chart.type === 'line' && <TrendingUp className="h-6 w-6 text-gray-400" />}
                      {chart.type === 'pie' && <PieChart className="h-6 w-6 text-gray-400" />}
                      {chart.type === 'waterfall' && <BarChart3 className="h-6 w-6 text-gray-400" />}
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">{chart.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{chart.category}</p>
                    
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        Usar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Performance Executiva - TechCorp", modified: "Hoje", client: "TechCorp" },
                  { name: "Análise Variação Março", modified: "2 dias atrás", client: "InnovateLab" },
                  { name: "Rolling Forecast Q2", modified: "1 semana atrás", client: "GreenTech" }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <p className="text-xs text-gray-600">{report.client} • {report.modified}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Report Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportName">Nome do Relatório</Label>
                    <Input id="reportName" placeholder="Ex: Relatório Mensal Performance" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="reportClient">Cliente</Label>
                    <select id="reportClient" className="w-full p-2 border rounded-md mt-1">
                      <option value="techcorp">TechCorp Ltda</option>
                      <option value="innovatelab">InnovateLab S.A.</option>
                      <option value="greentech">GreenTech Solutions</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reportFrequency">Frequência</Label>
                    <select id="reportFrequency" className="w-full p-2 border rounded-md mt-1">
                      <option value="monthly">Mensal</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="annual">Anual</option>
                      <option value="on-demand">Sob Demanda</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reportFormat">Formato de Saída</Label>
                    <select id="reportFormat" className="w-full p-2 border rounded-md mt-1">
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="powerpoint">PowerPoint</option>
                      <option value="web">Web Dashboard</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reportDescription">Descrição</Label>
                  <Textarea 
                    id="reportDescription" 
                    placeholder="Descreva o propósito e escopo deste relatório..."
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Configurações de Branding</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="logoPosition">Posição do Logo</Label>
                      <select id="logoPosition" className="w-full p-2 border rounded-md mt-1">
                        <option value="header">Cabeçalho</option>
                        <option value="footer">Rodapé</option>
                        <option value="both">Ambos</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="colorScheme">Esquema de Cores</Label>
                      <select id="colorScheme" className="w-full p-2 border rounded-md mt-1">
                        <option value="corporate">Corporativo</option>
                        <option value="modern">Moderno</option>
                        <option value="classic">Clássico</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="fontStyle">Estilo de Fonte</Label>
                      <select id="fontStyle" className="w-full p-2 border rounded-md mt-1">
                        <option value="professional">Profissional</option>
                        <option value="modern">Moderno</option>
                        <option value="classic">Clássico</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Configurações
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Template
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

export default AdminFPAReportBuilder;
