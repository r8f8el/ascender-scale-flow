
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ClientSchedule = () => {
  const { client } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  console.log('📅 ClientSchedule - Cliente:', client?.name);

  // Dados do cronograma com mais detalhes
  const projects = [
    {
      id: '1',
      title: 'Implementação Sistema FP&A',
      description: 'Implementação completa do sistema de Financial Planning & Analysis',
      status: 'em_andamento',
      progress: 65,
      start_date: '2024-01-15',
      end_date: '2024-04-30',
      responsible: 'Rafael Gontijo',
      phases: [
        {
          id: '1',
          name: 'Análise de Requisitos',
          start_date: '2024-01-15',
          end_date: '2024-01-30',
          status: 'concluido',
          progress: 100,
          description: 'Levantamento completo dos requisitos do sistema'
        },
        {
          id: '2',
          name: 'Configuração Inicial',
          start_date: '2024-02-01',
          end_date: '2024-02-15',
          status: 'em_andamento',
          progress: 80,
          description: 'Setup inicial do ambiente e configurações básicas'
        },
        {
          id: '3',
          name: 'Desenvolvimento Custom',
          start_date: '2024-02-16',
          end_date: '2024-03-30',
          status: 'em_andamento',
          progress: 40,
          description: 'Desenvolvimento de funcionalidades customizadas'
        },
        {
          id: '4',
          name: 'Testes e Validação',
          start_date: '2024-04-01',
          end_date: '2024-04-15',
          status: 'agendado',
          progress: 0,
          description: 'Testes completos e validação do sistema'
        },
        {
          id: '5',
          name: 'Go-live e Treinamento',
          start_date: '2024-04-16',
          end_date: '2024-04-30',
          status: 'agendado',
          progress: 0,
          description: 'Lançamento do sistema e treinamento dos usuários'
        }
      ]
    },
    {
      id: '2',
      title: 'Migração de Dados Históricos',
      description: 'Migração de dados financeiros dos últimos 3 anos',
      status: 'agendado',
      progress: 25,
      start_date: '2024-02-01',
      end_date: '2024-03-15',
      responsible: 'Ana Silva',
      phases: [
        {
          id: '1',
          name: 'Mapeamento de Dados',
          start_date: '2024-02-01',
          end_date: '2024-02-10',
          status: 'concluido',
          progress: 100,
          description: 'Identificação e mapeamento dos dados a serem migrados'
        },
        {
          id: '2',
          name: 'Extração e Limpeza',
          start_date: '2024-02-11',
          end_date: '2024-02-25',
          status: 'em_andamento',
          progress: 60,
          description: 'Extração e limpeza dos dados históricos'
        },
        {
          id: '3',
          name: 'Validação e Carga',
          start_date: '2024-02-26',
          end_date: '2024-03-15',
          status: 'agendado',
          progress: 0,
          description: 'Validação e carga final dos dados'
        }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return <Badge className="bg-blue-100 text-blue-700"><PlayCircle className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case 'agendado':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700"><Clock className="h-3 w-3 mr-1" />Agendado</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'pausado':
        return <Badge className="bg-yellow-100 text-yellow-700"><PauseCircle className="h-3 w-3 mr-1" />Pausado</Badge>;
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

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cronograma de Projetos</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe o progresso detalhado dos seus projetos
        </p>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Projetos Ativos</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'em_andamento').length}
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
                <p className="text-sm text-gray-600">Agendados</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'agendado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Progresso Médio</p>
                <p className="text-2xl font-bold">
                  {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Especialistas</p>
                <p className="text-2xl font-bold">
                  {new Set(projects.map(p => p.responsible)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Projetos */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <p className="text-gray-600 mt-1">{project.description}</p>
                </div>
                {getStatusBadge(project.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Período</p>
                    <p className="text-gray-600">
                      {formatDate(project.start_date)} - {formatDate(project.end_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Duração</p>
                    <p className="text-gray-600">
                      {calculateDuration(project.start_date, project.end_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Responsável</p>
                    <p className="text-gray-600">{project.responsible}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Restam</p>
                    <p className="text-gray-600">
                      {calculateDaysRemaining(project.end_date)} dias
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso Geral</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Fases do Projeto</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                >
                  {selectedProject === project.id ? 'Ocultar' : 'Ver'} Detalhes
                </Button>
              </div>

              {selectedProject === project.id && (
                <div className="space-y-4">
                  {project.phases.map((phase, index) => (
                    <div key={phase.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="font-medium">{phase.name}</h5>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                        </div>
                        {getStatusBadge(phase.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(phase.start_date)} - {formatDate(phase.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{calculateDuration(phase.start_date, phase.end_date)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs mb-1">
                        <span>Progresso da Fase</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <Progress value={phase.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cronograma disponível</h3>
            <p className="text-gray-600">
              Seus cronogramas de projeto aparecerão aqui quando forem criados pela equipe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientSchedule;
