
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useUpdateFPAClient } from '@/hooks/useFPAClients';
import { useCreateFPAPeriod } from '@/hooks/useFPAPeriods';
import { useCreateFPAReport } from '@/hooks/useFPAReports';
import FPAExcelUploader from './FPAExcelUploader';
import { 
  Building, 
  Edit,
  Eye,
  Settings,
  Plus,
  FileText,
  Upload,
  Calendar as CalendarIcon
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
  const updateClient = useUpdateFPAClient();
  const createPeriod = useCreateFPAPeriod();
  const createReport = useCreateFPAReport();

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  // Edit form
  const [industry, setIndustry] = useState<string>('');
  const [businessModel, setBusinessModel] = useState<string>('');
  const [strategicObjectives, setStrategicObjectives] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<number>(1);

  // Period form
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isActual, setIsActual] = useState<boolean>(false);

  // Report form
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportType, setReportType] = useState<string>('desempenho');
  const [periodCovered, setPeriodCovered] = useState<string>('');

  useEffect(() => {
    if (client) {
      setIndustry(client.industry || '');
      setBusinessModel(client.business_model || '');
      setStrategicObjectives(client.strategic_objectives || '');
      setCurrentPhase(client.current_phase || 1);
    }
  }, [client]);

  const formatDate = (d?: Date) => d ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10) : '';

  const handleEditSubmit = () => {
    if (!client) return;
    updateClient.mutate({
      id: client.id,
      industry,
      business_model: businessModel,
      strategic_objectives: strategicObjectives,
      current_phase: Number(currentPhase)
    });
    setEditOpen(false);
  };

  const handleCreatePeriod = () => {
    if (!client || !startDate || !endDate) return;
    createPeriod.mutate({
      fpa_client_id: client.id,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      period_type: periodType,
      is_actual: isActual
    });
    setPeriodOpen(false);
  };

  const handleCreateReport = () => {
    if (!client || !reportTitle || !reportType || !periodCovered) return;
    createReport.mutate({
      fpa_client_id: client.id,
      title: reportTitle,
      report_type: reportType,
      period_covered: periodCovered,
      content: {},
      status: 'draft'
    });
    setReportOpen(false);
  };
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
                <Button size="sm" onClick={() => setEditOpen(true)}>
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
              <Button size="sm" onClick={() => setPeriodOpen(true)}>
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
              <Button size="sm" onClick={() => setReportOpen(true)}>
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
              <Button size="sm" onClick={() => setShowUploader((v) => !v)}>
                <Upload className="h-4 w-4 mr-2" />
                {showUploader ? 'Ocultar Importador' : 'Importar Excel'}
              </Button>
            </div>
            {showUploader && (
              <div className="border rounded-lg p-3">
                <FPAExcelUploader clientId={client.id} />
              </div>
            )}
            
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

          {/* Dialog: Editar Cliente */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Setor</Label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Ex: Varejo" />
                </div>
                <div className="grid gap-2">
                  <Label>Modelo de Negócio</Label>
                  <Input value={businessModel} onChange={(e) => setBusinessModel(e.target.value)} placeholder="Ex: SaaS" />
                </div>
                <div className="grid gap-2">
                  <Label>Objetivos Estratégicos</Label>
                  <Input value={strategicObjectives} onChange={(e) => setStrategicObjectives(e.target.value)} placeholder="Ex: Crescer 20% a/a" />
                </div>
                <div className="grid gap-2">
                  <Label>Fase Atual</Label>
                  <Input type="number" min={1} value={currentPhase} onChange={(e) => setCurrentPhase(Number(e.target.value))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button onClick={handleEditSubmit}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Novo Período */}
          <Dialog open={periodOpen} onOpenChange={setPeriodOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Período</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Tipo de Período</Label>
                  <Select value={periodType} onValueChange={(v) => setPeriodType(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start", !startDate && "text-muted-foreground")}> 
                        {startDate ? startDate.toLocaleDateString('pt-BR') : 'Escolha a data de início'}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start", !endDate && "text-muted-foreground")}> 
                        {endDate ? endDate.toLocaleDateString('pt-BR') : 'Escolha a data de fim'}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center justify-between">
                  <Label>É Real?</Label>
                  <Switch checked={isActual} onCheckedChange={setIsActual} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPeriodOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreatePeriod}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Novo Relatório */}
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Relatório</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Título</Label>
                  <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Ex: Desempenho Mensal" />
                </div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Input value={reportType} onChange={(e) => setReportType(e.target.value)} placeholder="Ex: desempenho, caixa, lucro" />
                </div>
                <div className="grid gap-2">
                  <Label>Período Coberto</Label>
                  <Input value={periodCovered} onChange={(e) => setPeriodCovered(e.target.value)} placeholder="Ex: Jan/2025" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReportOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateReport}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

      </CardContent>
    </Card>
  );
};

export default FPAClientDetails;
