
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Share,
  Bookmark,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const ClientFPAReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('fpa_reports')
        .select(`
          *,
          fpa_client:fpa_clients!inner(
            id,
            company_name,
            client_profile_id
          )
        `)
        .eq('fpa_client.client_profile_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar relatórios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge className="bg-green-100 text-green-700">Publicado</Badge>;
      case 'draft': return <Badge className="bg-yellow-100 text-yellow-700">Rascunho</Badge>;
      case 'archived': return <Badge variant="outline">Arquivado</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'executive': return <TrendingUp className="h-4 w-4" />;
      case 'detailed': return <BarChart3 className="h-4 w-4" />;
      case 'variance': return <Target className="h-4 w-4" />;
      case 'forecast': return <PieChart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      // Aqui você implementaria a lógica para gerar e baixar o PDF
      toast({
        title: "Download iniciado",
        description: "O relatório está sendo preparado para download"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao baixar relatório",
        variant: "destructive"
      });
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReportsByTab = () => {
    switch (selectedTab) {
      case 'recent':
        return filteredReports.slice(0, 5);
      case 'favorites':
        return []; // Implementar sistema de favoritos
      case 'archived':
        return filteredReports.filter(r => r.status === 'archived');
      default:
        return filteredReports;
    }
  };

  const reportsByTab = getReportsByTab();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Acesse todos os relatórios e análises gerados pela consultoria FP&A
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          Favoritos
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Todos ({reports.length})</TabsTrigger>
            <TabsTrigger value="recent">Recentes</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="archived">Arquivados</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
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

        <TabsContent value={selectedTab} className="space-y-6">
          {reportsByTab.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTab === 'all' ? 'Nenhum relatório encontrado' : 
                   selectedTab === 'recent' ? 'Nenhum relatório recente' :
                   selectedTab === 'favorites' ? 'Nenhum relatório favoritado' :
                   'Nenhum relatório arquivado'}
                </h3>
                <p className="text-gray-600">
                  {selectedTab === 'all' 
                    ? 'Ainda não há relatórios disponíveis para sua empresa'
                    : 'Relatórios aparecerão aqui conforme forem adicionados'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reportsByTab.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(report.report_type)}
                            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {report.insights || 'Relatório de análise financeira'}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {report.period_covered}
                          </span>
                          <span className="capitalize">{report.report_type}</span>
                          <span>{report.fpa_client?.company_name}</span>
                          <span>
                            Gerado em {new Date(report.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => downloadReport(report.id)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Share className="h-4 w-4" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Relatórios</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => 
                      new Date(r.created_at).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Executivos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.report_type === 'executive').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Análises</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.report_type === 'detailed').length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientFPAReports;
