
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Calendar,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ProjectSkeleton } from '@/components/ui/skeletons/ProjectSkeleton';
import { FileSkeleton } from '@/components/ui/skeletons/FileSkeleton';
import { StatsSkeleton } from '@/components/ui/skeletons/StatsSkeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

const ClientArea = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useDashboardData();
  const { states } = useLoadingStates();
  const { retry } = useErrorHandler();

  const handleRefresh = () => {
    retry(refetch);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ativo':
        return 'default';
      case 'completed':
      case 'concluído':
        return 'secondary';
      case 'paused':
      case 'pausado':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isError && error) {
    return (
      <div className="p-6">
        <ErrorDisplay
          error={error as Error}
          context="dashboard"
          onRetry={handleRefresh}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Visão geral dos seus projetos e atividades
            {isRefetching && (
              <span className="ml-2 text-xs text-blue-600">Atualizando...</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.total_projects || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.active_projects || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.active_projects || 0}</div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.completed_projects || 0}</div>
              <p className="text-xs text-muted-foreground">
                Finalizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Recentes</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.recent_tickets.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projetos Recentes
            </CardTitle>
            <CardDescription>
              Seus projetos mais atualizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || states.projects ? (
              <ProjectSkeleton />
            ) : data?.projects && data.projects.length > 0 ? (
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progresso</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Atualizado em {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum projeto encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Arquivos Recentes
            </CardTitle>
            <CardDescription>
              Últimos arquivos enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || states.files ? (
              <FileSkeleton />
            ) : data?.recent_files && data.recent_files.length > 0 ? (
              <div className="space-y-3">
                {data.recent_files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3 p-2 border rounded">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum arquivo encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      {data?.recent_tickets && data.recent_tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Tickets Recentes
            </CardTitle>
            <CardDescription>
              Seus últimos chamados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.recent_tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{ticket.ticket_number}</Badge>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{ticket.title}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Abrir Chamado</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Documentos</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Cronograma</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Suporte</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientArea;
