import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart
} from 'lucide-react';
import { useClientFPAReports } from '@/hooks/useFPAReports';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useAuth } from '@/contexts/AuthContext';

const ClientFPAReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();
  
  const { data: reports = [], isLoading } = useClientFPAReports();
  const { data: clients = [] } = useFPAClients();
  
  const currentClient = clients.find(client => {
    if (!client.client_profile || typeof client.client_profile !== 'object') {
      return false;
    }
    return 'id' in client.client_profile && client.client_profile.id === user?.id;
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.report_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.report_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'financial_summary':
        return <DollarSign className="h-4 w-4" />;
      case 'performance_analysis':
        return <TrendingUp className="h-4 w-4" />;
      case 'variance_report':
        return <BarChart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeName = (type: string) => {
    switch (type) {
      case 'financial_summary':
        return 'Resumo Financeiro';
      case 'performance_analysis':
        return 'Análise de Performance';
      case 'variance_report':
        return 'Relatório de Variação';
      case 'budget_review':
        return 'Revisão Orçamentária';
      default:
        return 'Relatório Personalizado';
    }
  };

  const renderReportContent = (report: any) => {
    if (!report.content || typeof report.content !== 'object') return null;
    
    const { financial_data, charts } = report.content;
    
    return (
      <div className="space-y-4">
        {financial_data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Receita', value: financial_data.revenue, color: 'text-blue-600' },
              { label: 'Lucro Bruto', value: financial_data.gross_profit, color: 'text-green-600' },
              { label: 'EBITDA', value: financial_data.ebitda, color: 'text-purple-600' },
              { label: 'Lucro Líquido', value: financial_data.net_income, color: 'text-orange-600' }
            ].map((metric, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className={`font-bold text-lg ${metric.color}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(metric.value || 0)}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {report.insights && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Insights</h4>
            <p className="text-blue-800">{report.insights}</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso FP&A não configurado</h1>
          <p className="text-gray-600 mb-4">
            Seu acesso ao módulo FP&A ainda não foi configurado pelo administrador.
          </p>
          <p className="text-gray-500 text-sm">
            Entre em contato com nossa equipe para ativar este serviço.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios FP&A</h1>
          <p className="text-gray-600 mt-1">
            Acesse seus relatórios financeiros e análises de performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Buscar relatórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" onClick={() => setFilterType('all')}>
            Todos
          </TabsTrigger>
          <TabsTrigger value="financial_summary" onClick={() => setFilterType('financial_summary')}>
            Resumo Financeiro
          </TabsTrigger>
          <TabsTrigger value="performance_analysis" onClick={() => setFilterType('performance_analysis')}>
            Performance
          </TabsTrigger>
          <TabsTrigger value="variance_report" onClick={() => setFilterType('variance_report')}>
            Variação
          </TabsTrigger>
          <TabsTrigger value="budget_review" onClick={() => setFilterType('budget_review')}>
            Orçamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum relatório encontrado' : 'Nenhum relatório disponível'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Tente ajustar os filtros ou termo de busca' 
                    : 'Seus relatórios aparecerão aqui quando estiverem prontos'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {getReportTypeIcon(report.report_type)}
                          {report.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <span>{getReportTypeName(report.report_type)}</span>
                          <span>•</span>
                          <span>{report.period_covered}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        Publicado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderReportContent(report)}
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(report.created_at || '').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="financial_summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.filter(r => r.report_type === 'financial_summary').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderReportContent(report)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance_analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.filter(r => r.report_type === 'performance_analysis').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderReportContent(report)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="variance_report">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.filter(r => r.report_type === 'variance_report').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderReportContent(report)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="budget_review">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.filter(r => r.report_type === 'budget_review').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderReportContent(report)}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientFPAReports;
