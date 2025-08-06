
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPAVarianceAnalysis } from '@/hooks/useFPAVarianceAnalysis';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Building,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import FPAClientSelector from '@/components/fpa/FPAClientSelector';

const AdminFPAVarianceAnalysis = () => {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isCreatingAnalysis, setIsCreatingAnalysis] = useState(false);
  const [newAnalysisData, setNewAnalysisData] = useState({
    metric_name: '',
    planned_value: 0,
    actual_value: 0,
    analysis_comment: ''
  });

  // Fixed hook calls - only pass clientId, not two parameters
  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  const { data: varianceAnalysis = [], isLoading: analysisLoading } = useFPAVarianceAnalysis(selectedClientId);
  const { data: financialData = [], isLoading: dataLoading } = useFPAFinancialData(selectedClientId);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const getVarianceIcon = (percentage: number) => {
    const absPercentage = Math.abs(percentage);
    if (absPercentage <= 5) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (absPercentage <= 15) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return percentage > 0 ? 
        <TrendingUp className="h-4 w-4 text-red-500" /> : 
        <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getVarianceBadge = (percentage: number) => {
    const absPercentage = Math.abs(percentage);
    if (absPercentage <= 5) {
      return <Badge className="bg-green-100 text-green-700">Dentro do esperado</Badge>;
    } else if (absPercentage <= 15) {
      return <Badge className="bg-yellow-100 text-yellow-700">Atenção</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700">Crítico</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise de Variância FP&A</h1>
          <p className="text-gray-600 mt-1">
            Compare dados planejados vs realizados e analise desvios
          </p>
        </div>
        {selectedClientId && (
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsCreatingAnalysis(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Análise
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
            placeholder="Selecione um cliente para análise de variância"
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
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Análises</p>
                      <p className="text-2xl font-bold">{varianceAnalysis.length}</p>
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

          {/* Variance Analysis List */}
          <Card>
            <CardHeader>
              <CardTitle>Análises de Variância</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando análises...</p>
                </div>
              ) : varianceAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma análise de variância criada ainda</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Crie sua primeira análise para comparar dados planejados vs realizados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {varianceAnalysis.map((analysis) => (
                    <div key={analysis.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            {getVarianceIcon(analysis.variance_percentage)}
                            {analysis.metric_name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            {getVarianceBadge(analysis.variance_percentage)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Planejado:</span>
                          <div className="font-medium">{formatCurrency(analysis.planned_value)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Realizado:</span>
                          <div className="font-medium">{formatCurrency(analysis.actual_value)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Variância:</span>
                          <div className={`font-medium ${analysis.variance_amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(analysis.variance_amount)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Percentual:</span>
                          <div className={`font-medium ${analysis.variance_percentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatPercentage(analysis.variance_percentage)}
                          </div>
                        </div>
                      </div>
                      
                      {analysis.analysis_comment && (
                        <div className="bg-gray-50 rounded p-3 mt-3">
                          <p className="text-sm text-gray-700">{analysis.analysis_comment}</p>
                        </div>
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
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um Cliente FP&A
            </h3>
            <p className="text-gray-600 mb-4">
              Escolha um cliente acima para realizar análises de variância
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

export default AdminFPAVarianceAnalysis;
