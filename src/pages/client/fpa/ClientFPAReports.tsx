import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  TrendingUp,
  BarChart3,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientFPAReports } from '@/hooks/useFPAReports';
import { useFPAClients } from '@/hooks/useFPAClients';

const ClientFPAReports = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const { data: reports = [], isLoading } = useClientFPAReports();
  const { data: clients = [] } = useFPAClients();
  
  const currentClient = clients.find(client => {
    if (!client.client_profile) return false;
    if (typeof client.client_profile !== 'object') return false;
    if (!('id' in client.client_profile)) return false;
    return (client.client_profile as { id: string }).id === user?.id;
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.report_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.report_type === filterType;
    return matchesSearch && matchesType;
  });

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <TrendingUp className="h-5 w-5" />;
      case 'analysis':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleViewReport = (reportId: string) => {
    // Implementar visualização do relatório
    console.log('Visualizando relatório:', reportId);
  };

  const handleDownloadReport = (reportId: string) => {
    // Implementar download do relatório
    console.log('Fazendo download do relatório:', reportId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios FP&A</h1>
        <p className="text-gray-600 mt-1">
          Acesse seus relatórios e análises financeiras
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar relatórios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="analysis">Análise</SelectItem>
                <SelectItem value="variance">Variação</SelectItem>
                <SelectItem value="forecast">Projeção</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <div className="grid gap-6">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Seus relatórios aparecerão aqui quando estiverem prontos'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getReportIcon(report.report_type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.period_covered}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {report.report_type}
                        </Badge>
                        <span>
                          {new Date(report.created_at || '').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {report.insights && (
                        <p className="text-gray-700 mb-4">{report.insights}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientFPAReports;
