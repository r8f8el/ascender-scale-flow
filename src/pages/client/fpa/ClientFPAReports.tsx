
import React, { useState } from 'react';
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
  Target
} from 'lucide-react';

const ClientFPAReports = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock reports data
  const reports = [
    {
      id: 1,
      title: "Relatório Mensal de Performance - Março 2024",
      type: "Mensal",
      period: "Março 2024",
      date: "2024-03-31",
      status: "published",
      category: "Performance",
      description: "Análise completa de desempenho financeiro e operacional do período",
      insights: 8,
      pages: 24
    },
    {
      id: 2,
      title: "Análise de Variação Q1 2024",
      type: "Trimestral",
      period: "Q1 2024",
      date: "2024-03-28",
      status: "draft",
      category: "Análise",
      description: "Comparação detalhada entre realizado e previsto no primeiro trimestre",
      insights: 12,
      pages: 18
    },
    {
      id: 3,
      title: "Projeção Rolling Forecast - Abril a Setembro 2024",
      type: "Forecast",
      period: "Abr-Set 2024",
      date: "2024-03-25",
      status: "published",
      category: "Previsão",
      description: "Atualização das projeções com base nos resultados mais recentes",
      insights: 6,
      pages: 15
    },
    {
      id: 4,
      title: "Dashboard Executivo - Indicadores Chave",
      type: "Dashboard",
      period: "Março 2024",
      date: "2024-03-20",
      status: "published",
      category: "Dashboard",
      description: "Visão sintética dos principais KPIs e direcionadores",
      insights: 4,
      pages: 8
    },
    {
      id: 5,
      title: "Análise de Cenários - Investimento Marketing",
      type: "Cenários",
      period: "Março 2024",
      date: "2024-03-15",
      status: "published",
      category: "Cenários",
      description: "Simulação de diferentes cenários de investimento em marketing",
      insights: 10,
      pages: 20
    }
  ];

  const categories = [
    { name: "Performance", count: 12, icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
    { name: "Análise", count: 8, icon: BarChart3, color: "bg-green-100 text-green-700" },
    { name: "Previsão", count: 6, icon: Target, color: "bg-purple-100 text-purple-700" },
    { name: "Dashboard", count: 4, icon: PieChart, color: "bg-orange-100 text-orange-700" },
    { name: "Cenários", count: 5, icon: Target, color: "bg-pink-100 text-pink-700" }
  ];

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
      case 'Mensal': case 'Trimestral': return <Calendar className="h-4 w-4" />;
      case 'Forecast': return <TrendingUp className="h-4 w-4" />;
      case 'Dashboard': return <PieChart className="h-4 w-4" />;
      case 'Cenários': return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
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

        <TabsContent value="all" className="space-y-6">
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.count} relatórios</p>
                      </div>
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.period}
                        </span>
                        <span>{report.insights} insights</span>
                        <span>{report.pages} páginas</span>
                        <span>Gerado em {new Date(report.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
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
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div className="space-y-4">
            {filteredReports.slice(0, 3).map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.period}
                        </span>
                        <span>{report.insights} insights</span>
                        <span>{report.pages} páginas</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum relatório favoritado
              </h3>
              <p className="text-gray-600">
                Adicione relatórios aos favoritos para acesso rápido
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum relatório arquivado
              </h3>
              <p className="text-gray-600">
                Relatórios arquivados aparecerão aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientFPAReports;
