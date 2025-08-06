import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAReports } from '@/hooks/useFPAReports';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  BarChart3,
  TrendingUp,
  Calendar,
  Building,
  Eye,
  Save
} from 'lucide-react';
import FPAClientSelector from '@/components/fpa/FPAClientSelector';

const AdminFPAReportBuilder = () => {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [newReportData, setNewReportData] = useState({
    title: '',
    report_type: 'monthly',
    period_covered: '',
    insights: '',
    content: {}
  });

  // Fixed hook calls - only pass clientId, not two parameters
  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  const { data: reports = [], isLoading: reportsLoading } = useFPAReports(selectedClientId);
  const { data: financialData = [], isLoading: dataLoading } = useFPAFinancialData(selectedClientId);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Construtor de Relatórios FP&A</h1>
          <p className="text-gray-600 mt-1">
            Crie e gerencie relatórios personalizados para análise financeira
          </p>
        </div>
        {selectedClientId && (
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsCreatingReport(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Relatório
          </Button>
        )}
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <FPAClientSelector
            value={selectedClientId}
            onChange={setSelectedClientId}
            label="Cliente FP&A"
            placeholder="Selecione um cliente para criar relatórios"
          />
        </CardContent>
      </Card>

      {selectedClientId ? (
        <div className="space-y-6">
          {/* Client Summary */}
          {selectedClient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="text-lg font-bold">{selectedClient.company_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Relatórios</p>
                      <p className="text-2xl font-bold">{reports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Datasets</p>
                      <p className="text-2xl font-bold">{financialData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando relatórios...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum relatório criado ainda</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Crie seu primeiro relatório personalizado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{report.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {report.period_covered}
                            </span>
                            <Badge variant="outline">{report.report_type}</Badge>
                            <Badge variant={report.status === 'published' ? 'default' : 'secondary'}>
                              {report.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {report.insights && (
                        <p className="text-sm text-gray-600 mt-2">{report.insights}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um Cliente FP&A
            </h3>
            <p className="text-gray-600 mb-4">
              Escolha um cliente acima para criar e gerenciar relatórios personalizados
            </p>
            {clientsLoading ? (
              <p className="text-gray-500">Carregando clientes...</p>
            ) : clients.length === 0 ? (
              <p className="text-gray-500">Nenhum cliente FP&A encontrado.</p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFPAReportBuilder;
