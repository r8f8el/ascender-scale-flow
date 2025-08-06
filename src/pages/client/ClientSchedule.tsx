
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  Users,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

const ClientSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  console.log('📅 ClientSchedule: Componente carregado');

  // Dados mockados do cronograma
  const scheduleItems = [
    {
      id: '1',
      title: 'Análise Financeira Inicial',
      description: 'Revisão completa dos dados financeiros e setup inicial do projeto',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      status: 'completed',
      responsible: 'Rafael Gontijo',
      phase: 'Fase 1 - Setup',
      progress: 100
    },
    {
      id: '2',
      title: 'Implementação Dashboard FP&A',
      description: 'Desenvolvimento e configuração do dashboard de análise financeira',
      startDate: '2024-01-26',
      endDate: '2024-02-10',
      status: 'in_progress',
      responsible: 'Ana Silva',
      phase: 'Fase 2 - Desenvolvimento',
      progress: 65
    },
    {
      id: '3',
      title: 'Treinamento da Equipe',
      description: 'Sessões de treinamento para utilização das ferramentas',
      startDate: '2024-02-11',
      endDate: '2024-02-20',
      status: 'pending',
      responsible: 'Mariana Costa',
      phase: 'Fase 3 - Implementação',
      progress: 0
    },
    {
      id: '4',
      title: 'Entrega Final e Documentação',
      description: 'Finalização do projeto e entrega da documentação completa',
      startDate: '2024-02-21',
      endDate: '2024-02-28',
      status: 'pending',
      responsible: 'Daniel Ascalate',
      phase: 'Fase 4 - Entrega',
      progress: 0
    }
  ];

  const filteredItems = scheduleItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700"><Play className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'delayed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Atrasado</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cronograma do Projeto</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe o andamento das atividades do seu projeto
        </p>
      </div>

      {/* Estatísticas do Cronograma */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Concluído</p>
                <p className="text-2xl font-bold">
                  {scheduleItems.filter(item => item.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold">
                  {scheduleItems.filter(item => item.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pendente</p>
                <p className="text-2xl font-bold">
                  {scheduleItems.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Atividades</p>
                <p className="text-2xl font-bold">{scheduleItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="delayed">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Atividades do Cronograma */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    {getStatusBadge(item.status)}
                    <Badge variant="outline">{item.phase}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  
                  {/* Informações da atividade */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Início: {new Date(item.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Fim: {new Date(item.endDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Responsável: {item.responsible}</span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(item.progress)}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Não há atividades programadas no momento'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientSchedule;
