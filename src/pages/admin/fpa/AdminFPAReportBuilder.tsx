
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Download, 
  Send,
  BarChart,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';
import { useFPAReports, useCreateFPAReport, useUpdateFPAReport } from '@/hooks/useFPAReports';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import FPAClientSelector from '@/components/fpa/FPAClientSelector';
import FPAPeriodSelector from '@/components/fpa/FPAPeriodSelector';

const AdminFPAReportBuilder = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    report_type: '',
    period_covered: '',
    insights: '',
    status: 'draft'
  });

  const { data: clients = [] } = useFPAClients();
  const { data: periods = [] } = useFPAPeriods(selectedClient);
  const { data: reports = [] } = useFPAReports(selectedClient);
  const { data: financialData = [] } = useFPAFinancialData(selectedClient, selectedPeriod);
  
  const createReport = useCreateFPAReport();
  const updateReport = useUpdateFPAReport();

  const handleCreateReport = async () => {
    if (!selectedClient || !selectedPeriod) return;
    
    const period = periods.find(p => p.id === selectedPeriod);
    const client = clients.find(c => c.id === selectedClient);
    
    if (!period || !client) return;

    const reportData = {
      fpa_client_id: selectedClient,
      title: reportForm.title || `Relatório ${client.company_name} - ${period.period_name}`,
      report_type: reportForm.report_type,
      period_covered: period.period_name,
      insights: reportForm.insights,
      status: reportForm.status,
      content: {
        client_id: selectedClient,
        period_id: selectedPeriod,
        financial_data: financialData[0] || {},
        generated_at: new Date().toISOString(),
        charts: generateChartData(financialData[0] || {})
      }
    };

    try {
      await createReport.mutateAsync(reportData);
      setIsCreating(false);
      setReportForm({
        title: '',
        report_type: '',
        period_covered: '',
        insights: '',
        status: 'draft'
      });
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const generateChartData = (data: any) => {
    if (!data || !data.revenue) return [];
    
    return [
      {
        name: 'Receita',
        value: data.revenue || 0,
        color: '#3B82F6'
      },
      {
        name: 'Custo dos Produtos Vendidos',
        value: data.cost_of_goods_sold || 0,
        color: '#EF4444'
      },
      {
        name: 'Lucro Bruto',
        value: data.gross_profit || 0,
        color: '#10B981'
      },
      {
        name: 'EBITDA',
        value: data.ebitda || 0,
        color: '#F59E0B'
      },
      {
        name: 'Lucro Líquido',
        value: data.net_income || 0,
        color: '#8B5CF6'
      }
    ];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700">Publicado</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-700">Em Revisão</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Construtor de Relatórios FP&A</h1>
          <p className="text-gray-600 mt-1">
            Crie e gerencie relatórios financeiros personalizados
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          disabled={!selectedClient || !selectedPeriod}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FPAClientSelector
          value={selectedClient}
          onChange={setSelectedClient}
          label="Cliente"
          placeholder="Selecione um cliente"
        />
        <FPAPeriodSelector
          clientId={selectedClient}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          label="Período"
          placeholder="Selecione um período"
        />
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título do Relatório</Label>
                  <Input
                    id="title"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="Digite o título do relatório"
                  />
                </div>
                <div>
                  <Label htmlFor="report_type">Tipo de Relatório</Label>
                  <Select 
                    value={reportForm.report_type} 
                    onValueChange={(value) => setReportForm({ ...reportForm, report_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial_summary">Resumo Financeiro</SelectItem>
                      <SelectItem value="performance_analysis">Análise de Performance</SelectItem>
                      <SelectItem value="variance_report">Relatório de Variação</SelectItem>
                      <SelectItem value="budget_review">Revisão Orçamentária</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="insights">Insights e Observações</Label>
                <Textarea
                  id="insights"
                  value={reportForm.insights}
                  onChange={(e) => setReportForm({ ...reportForm, insights: e.target.value })}
                  placeholder="Adicione insights e observações sobre o relatório"
                  rows={4}
                />
              </div>
              
              {financialData.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Prévia dos Dados Financeiros</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-sm text-gray-600">Receita</p>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(financialData[0]?.revenue || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-600">Lucro Bruto</p>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(financialData[0]?.gross_profit || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-sm text-gray-600">EBITDA</p>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(financialData[0]?.ebitda || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                      </div>
                      <p className="text-sm text-gray-600">Lucro Líquido</p>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(financialData[0]?.net_income || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateReport}
                  disabled={createReport.isPending || !reportForm.report_type}
                >
                  {createReport.isPending ? 'Criando...' : 'Criar Relatório'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="reports" className="w-full">
        <TabsList>
          <TabsTrigger value="reports">Relatórios Existentes</TabsTrigger>
          <TabsTrigger value="templates">Modelos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum relatório encontrado</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Selecione um cliente e período para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{report.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{report.report_type}</span>
                          <span>•</span>
                          <span>{report.period_covered}</span>
                          <span>•</span>
                          <span>{new Date(report.created_at || '').toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(report.status || 'draft')}
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Relatório Executivo',
                    description: 'Resumo executivo com principais métricas',
                    icon: <BarChart className="h-8 w-8" />
                  },
                  {
                    name: 'Análise de Variação',
                    description: 'Comparação entre realizado e planejado',
                    icon: <TrendingUp className="h-8 w-8" />
                  },
                  {
                    name: 'Dashboard Financeiro',
                    description: 'Painel completo de indicadores financeiros',
                    icon: <DollarSign className="h-8 w-8" />
                  }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3 text-blue-500">
                        {template.icon}
                      </div>
                      <h4 className="font-medium mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Usar Modelo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFPAReportBuilder;
