
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Edit,
  Eye,
  Settings,
  Plus,
  FileText,
  Upload
} from 'lucide-react';

interface Client {
  id: string;
  company_name: string;
  industry?: string;
  business_model?: string;
  current_phase: number;
  strategic_objectives?: string;
}

interface FPAClientDetailsProps {
  client: Client | null;
  periods: any[];
  reports: any[];
  uploads: any[];
}

const FPAClientDetails: React.FC<FPAClientDetailsProps> = ({
  client,
  periods,
  reports,
  uploads
}) => {
  if (!client) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Selecione um Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Selecione um cliente para ver os detalhes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Detalhes do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="periods">Períodos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Empresa</label>
                  <p className="font-medium">{client.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Setor</label>
                  <p className="font-medium">{client.industry || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Modelo de Negócio</label>
                  <p className="font-medium">{client.business_model || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fase Atual</label>
                  <p className="font-medium">Fase {client.current_phase}</p>
                </div>
              </div>
              
              {client.strategic_objectives && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Objetivos Estratégicos</label>
                  <p className="font-medium">{client.strategic_objectives}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="periods" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Períodos ({periods.length})</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Período
              </Button>
            </div>
            
            <div className="space-y-2">
              {periods.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum período cadastrado
                </p>
              ) : (
                periods.map((period) => (
                  <div key={period.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{period.period_name}</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(period.start_date).toLocaleDateString('pt-BR')} - {new Date(period.end_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={period.is_actual ? "default" : "outline"}>
                        {period.is_actual ? 'Real' : 'Planejado'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Relatórios ({reports.length})</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
            
            <div className="space-y-2">
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum relatório criado
                </p>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{report.title}</h5>
                      <p className="text-sm text-gray-600">
                        {report.report_type} - {report.period_covered}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'published' ? "default" : "outline"}>
                        {report.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="uploads" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Uploads ({uploads.length})</h4>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Novo Upload
              </Button>
            </div>
            
            <div className="space-y-2">
              {uploads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum arquivo enviado
                </p>
              ) : (
                uploads.map((upload) => (
                  <div key={upload.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{upload.file_name}</h5>
                      <p className="text-sm text-gray-600">
                        {upload.file_type} - {new Date(upload.created_at || '').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={upload.status === 'validated' ? "default" : "outline"}>
                        {upload.status === 'validated' ? 'Validado' : upload.status || 'Pendente'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FPAClientDetails;
