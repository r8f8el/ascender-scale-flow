
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Award,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

export const ApprovalReports = () => {
  const [periodFilter, setPeriodFilter] = useState('3months');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const performanceMetrics = {
    totalProcessed: 240,
    inAnalysis: 180,
    approved: 156,
    rejected: 24
  };

  const averageTimeByLevel = [
    { level: 'Gerente', time: 1.8, color: 'bg-blue-500' },
    { level: 'Diretor', time: 3.2, color: 'bg-green-500' },
    { level: 'CFO', time: 2.1, color: 'bg-purple-500' }
  ];

  const topBottlenecks = [
    { department: 'Diretoria', avgTime: '5.2 dias', impact: 'alto' },
    { department: 'TI', avgTime: '4.1 dias', impact: 'médio' },
    { department: 'Financeiro', avgTime: '3.8 dias', impact: 'baixo' }
  ];

  const fastestApprovers = [
    { name: 'João Silva', avgTime: '1.2d', efficiency: 95 },
    { name: 'Maria Costa', avgTime: '1.8d', efficiency: 88 },
    { name: 'Pedro Santos', avgTime: '2.1d', efficiency: 82 }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'alto': return 'bg-red-100 text-red-800';
      case 'médio': return 'bg-yellow-100 text-yellow-800';
      case 'baixo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Período e Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                <SelectItem value="ti">TI</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="rh">RH</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance do Processo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Aprovações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Funil de Aprovações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Solicitado:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-full" />
                  </div>
                  <span className="text-sm font-medium">{performanceMetrics.totalProcessed}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Em análise:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(performanceMetrics.inAnalysis / performanceMetrics.totalProcessed) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{performanceMetrics.inAnalysis}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Aprovado:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(performanceMetrics.approved / performanceMetrics.totalProcessed) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{performanceMetrics.approved}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Rejeitado:</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(performanceMetrics.rejected / performanceMetrics.totalProcessed) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{performanceMetrics.rejected}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tempo Médio por Nível */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tempo Médio por Nível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {averageTimeByLevel.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.level}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.time / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.time} dias</span>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total:</span>
                  <Badge variant="outline" className="text-orange-600">
                    7.1 dias
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gargalos e Melhores Aprovadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gargalos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Top Gargalos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{index + 1}. {bottleneck.department}</p>
                    <p className="text-sm text-muted-foreground">({bottleneck.avgTime})</p>
                  </div>
                  <Badge className={getImpactColor(bottleneck.impact)}>
                    {bottleneck.impact}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aprovadores Mais Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Aprovadores Mais Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fastestApprovers.map((approver, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{index + 1}. {approver.name}</p>
                    <p className="text-sm text-muted-foreground">Tempo médio: {approver.avgTime}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {approver.efficiency}% eficiência
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs de Monitoramento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            KPIs de Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <p className="text-sm text-muted-foreground">Compliance com SLAs</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12%</div>
              <p className="text-sm text-muted-foreground">Taxa de Rejeição</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">R$ 2.1M</div>
              <p className="text-sm text-muted-foreground">ROI do Processo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
