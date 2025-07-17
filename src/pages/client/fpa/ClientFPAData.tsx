
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
  Database
} from 'lucide-react';

const ClientFPAData = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for uploaded files
  const uploadedFiles = [
    {
      id: 1,
      name: "Balancete_Marco_2024.xlsx",
      type: "Balancete",
      period: "Março 2024",
      status: "validated",
      uploadDate: "2024-03-15",
      size: "2.4 MB"
    },
    {
      id: 2,
      name: "Vendas_Q1_2024.csv",
      type: "Vendas",
      period: "Q1 2024",
      status: "processing",
      uploadDate: "2024-03-14",
      size: "1.8 MB"
    },
    {
      id: 3,
      name: "RH_Folha_Marco.xlsx",
      type: "Recursos Humanos",
      period: "Março 2024",
      status: "error",
      uploadDate: "2024-03-13",
      size: "890 KB"
    },
    {
      id: 4,
      name: "Fluxo_Caixa_Feb.xlsx",
      type: "Fluxo de Caixa",
      period: "Fevereiro 2024",
      status: "validated",
      uploadDate: "2024-02-28",
      size: "1.2 MB"
    }
  ];

  const dataRequirements = [
    {
      category: "Dados Financeiros",
      items: [
        { name: "Balancete Mensal", required: true, uploaded: true },
        { name: "Demonstração de Resultados", required: true, uploaded: true },
        { name: "Fluxo de Caixa", required: true, uploaded: false },
        { name: "Balanço Patrimonial", required: false, uploaded: true }
      ]
    },
    {
      category: "Dados Operacionais",
      items: [
        { name: "Vendas por Produto/Serviço", required: true, uploaded: true },
        { name: "Número de Clientes", required: true, uploaded: false },
        { name: "Dados de Produção", required: false, uploaded: false },
        { name: "Indicadores de Marketing", required: false, uploaded: true }
      ]
    },
    {
      category: "Recursos Humanos",
      items: [
        { name: "Folha de Pagamento", required: true, uploaded: true },
        { name: "Número de Funcionários", required: true, uploaded: true },
        { name: "Custos com Benefícios", required: false, uploaded: false }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cofre de Dados e Documentos</h1>
          <p className="text-gray-600 mt-1">
            Repositório seguro para todos os seus dados financeiros e operacionais
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Fazer Upload
        </Button>
      </div>

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
                  <Label htmlFor="period">Período</Label>
                  <Input id="period" placeholder="ex: Março 2024" />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Dados</Label>
                  <Input id="type" placeholder="ex: Balancete" />
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
              <CardTitle>Uploads Recentes</CardTitle>
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
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{file.type}</span>
                          <span>{file.period}</span>
                          <span>{file.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(file.status)}
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                    {category.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.uploaded ? 'bg-green-500' : item.required ? 'bg-red-500' : 'bg-gray-300'
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
                          {item.uploaded ? (
                            <Badge className="bg-green-100 text-green-700">Enviado</Badge>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-1" />
                              Enviar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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
                Histórico de Dados por Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Março 2024', 'Fevereiro 2024', 'Janeiro 2024', 'Dezembro 2023'].map((period) => (
                  <div key={period} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">{period}</h4>
                      <Badge variant="outline">
                        {period === 'Março 2024' ? 'Atual' : 'Histórico'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        <span>Balancete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        <span>Vendas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        <span>RH</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientFPAData;
