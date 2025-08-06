
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ClientSchedule = () => {
  const { client } = useAuth();

  console.log('📅 ClientSchedule - Cliente:', client?.name);

  // Dados mockados para demonstração
  const scheduleData = [
    {
      id: '1',
      project_title: 'Implementação Sistema ERP',
      phase: 'Análise de Requisitos',
      start_date: '2024-01-15',
      end_date: '2024-01-30',
      status: 'em_andamento',
      responsible: 'João Silva',
      description: 'Levantamento e documentação dos requisitos do sistema'
    },
    {
      id: '2',
      project_title: 'Migração de Dados',
      phase: 'Preparação',
      start_date: '2024-02-01',
      end_date: '2024-02-15',
      status: 'agendado',
      responsible: 'Maria Santos',
      description: 'Preparação da estrutura para migração dos dados legados'
    },
    {
      id: '3',
      project_title: 'Treinamento de Usuários',
      phase: 'Capacitação',
      start_date: '2024-03-01',
      end_date: '2024-03-10',
      status: 'agendado',
      responsible: 'Pedro Costa',
      description: 'Treinamento dos usuários finais no novo sistema'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return <Badge className="bg-blue-100 text-blue-700">Em Andamento</Badge>;
      case 'agendado':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Agendado</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-700">Concluído</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dias`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cronograma de Projetos</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe o andamento e prazos dos seus projetos
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Projetos Ativos</p>
                <p className="text-2xl font-bold">
                  {scheduleData.filter(item => item.status === 'em_andamento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Próximos Marcos</p>
                <p className="text-2xl font-bold">
                  {scheduleData.filter(item => item.status === 'agendado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Responsáveis</p>
                <p className="text-2xl font-bold">
                  {new Set(scheduleData.map(item => item.responsible)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {scheduleData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cronograma disponível</h3>
              <p className="text-gray-600">
                Seus cronogramas de projeto aparecerão aqui quando forem criados pela equipe.
              </p>
            </CardContent>
          </Card>
        ) : (
          scheduleData.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.project_title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Fase: {item.phase}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{item.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Período</p>
                      <p className="text-gray-600">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Duração</p>
                      <p className="text-gray-600">
                        {calculateDuration(item.start_date, item.end_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Responsável</p>
                      <p className="text-gray-600">{item.responsible}</p>
                    </div>
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

export default ClientSchedule;
