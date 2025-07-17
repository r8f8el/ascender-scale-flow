
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  File, 
  Check, 
  Clock, 
  AlertTriangle,
  Download,
  Search,
  Filter,
  Calendar,
  FileSpreadsheet,
  Database,
  Plus
} from 'lucide-react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPADataUploads } from '@/hooks/useFPADataUploads';
import FPAClientSelector from '@/components/fpa/FPAClientSelector';

const AdminFPADataIntegration = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('');

  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  const { data: uploads = [], isLoading: uploadsLoading } = useFPADataUploads(selectedClientId);

  const dataRequirements = [
    {
      category: "Dados Financeiros",
      items: [
        { name: "Balancete Mensal", required: true, type: "balance_sheet" },
        { name: "Demonstração de Resultados", required: true, type: "income_statement" },
        { name: "Fluxo de Caixa", required: true, type: "cash_flow" },
        { name: "Balanço Patrimonial", required: false, type: "balance_sheet" }
      ]
    },
    {
      category: "Dados Operacionais",
      items: [
        { name: "Vendas por Produto/Serviço", required: true, type: "operational" },
        { name: "Número de Clientes", required: true, type: "operational" },
        { name: "Dados de Produção", required: false, type: "operational" },
        { name: "Indicadores de Marketing", required: false, type: "operational" }
      ]
    },
    {
      category: "Recursos Humanos",
      items: [
        { name: "Folha de Pagamento", required: true, type: "operational" },
        { name: "Número de Funcionários", required: true, type: "operational" },
        { name: "Custos com Benefícios", required: false, type: "operational" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <Check className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated': return <Badge className="bg-green-100 text-green-700">Validado</Badge>;
      case 'processing': return <Badge className="bg-yellow-100 text-yellow-700">Processando</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-700">Erro</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const filteredUploads = uploads.filter(upload => 
    upload.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integração de Dados FP&A</h1>
          <p className="text-gray-600 mt-1">
            Gerencie uploads e validação de dados financeiros dos clientes
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Upload
        </Button>
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FPAClientSelector
              value={selectedClientId}
              onChange={setSelectedClientId}
              label="Cliente FP&A"
              placeholder="Selecione um cliente para gerenciar dados"
            />
            <div>
              <Label htmlFor="period">Período de Dados</Label>
              <Input 
                id="period"
                placeholder="Ex: Janeiro 2024, Q1 2024"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClientId ? (
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload de Dados</TabsTrigger>
            <TabsTrigger value="requirements">Requisitos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload de Novos Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Arraste arquivos ou clique para fazer upload
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Suporte para Excel (.xlsx), CSV (.csv) e PDF
                  </p>
                  <Button>
                    Selecionar Arquivos
                  </Button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="period-upload">Período</Label>
                    <Input 
                      id="period-upload" 
                      placeholder="ex: Março 2024"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Dados</Label>
                    <select 
                      id="type"
                      value={selectedDataType}
                      onChange={(e) => setSelectedDataType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="balance_sheet">Balancete</option>
                      <option value="income_statement">DRE</option>
                      <option value="cash_flow">Fluxo de Caixa</option>
                      <option value="operational">Operacional</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" placeholder="Descrição opcional" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Uploads do Cliente</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input 
                      placeholder="Buscar arquivos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {uploadsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando uploads...</p>
                  </div>
                ) : filteredUploads.length === 0 ? (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum arquivo foi enviado ainda</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm ? 'Nenhum arquivo encontrado com esse termo' : 'Faça o primeiro upload de dados'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUploads.map((upload) => (
                      <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(upload.status || 'pending')}
                          <div>
                            <h4 className="font-medium text-gray-900">{upload.file_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{upload.file_type}</span>
                              <span>{new Date(upload.created_at || '').toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(upload.status || 'pending')}
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            {/* Data Requirements */}
            <div className="space-y-6">
              {dataRequirements.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, index) => {
                        const isUploaded = uploads.some(upload => upload.file_type === item.type);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                isUploaded ? 'bg-green-500' : item.required ? 'bg-red-500' : 'bg-gray-300'
                              }`} />
                              <div>
                                <span className="font-medium">{item.name}</span>
                                {item.required && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isUploaded ? (
                                <Badge className="bg-green-100 text-green-700">Enviado</Badge>
                              ) : (
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-1" />
                                  Enviar
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Data History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico de Uploads por Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploads.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum histórico de dados disponível</p>
                    <p className="text-gray-400 text-sm mt-1">
                      O histórico aparecerá aqui conforme os dados forem enviados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group uploads by period/date */}
                    {Object.entries(
                      uploads.reduce((acc, upload) => {
                        const date = new Date(upload.created_at || '').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(upload);
                        return acc;
                      }, {} as Record<string, typeof uploads>)
                    ).map(([period, periodUploads]) => (
                      <div key={period} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900 capitalize">{period}</h4>
                          <Badge variant="outline">
                            {periodUploads.length} arquivo{periodUploads.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {periodUploads.map((upload) => (
                            <div key={upload.id} className="flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                              <span>{upload.file_type}</span>
                              {getStatusIcon(upload.status || 'pending')}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um Cliente FP&A
            </h3>
            <p className="text-gray-600 mb-4">
              Escolha um cliente acima para visualizar e gerenciar seus dados financeiros
            </p>
            {clientsLoading ? (
              <p className="text-gray-500">Carregando clientes...</p>
            ) : clients.length === 0 ? (
              <p className="text-gray-500">Nenhum cliente FP&A encontrado. Crie um cliente primeiro.</p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFPADataIntegration;
