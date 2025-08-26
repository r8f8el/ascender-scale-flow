
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  FileText, 
  FolderOpen, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { useCompanyDashboard } from '@/hooks/useCompanyDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CompanyDashboard = () => {
  const { data: dashboardData, isLoading, error } = useCompanyDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600">
            Não foi possível carregar os dados da empresa. Tente novamente mais tarde.
          </p>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
          <p className="text-gray-600 mb-4">
            Você ainda não está associado a uma empresa ou não tem acesso aos dados.
          </p>
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Solicitar Acesso
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'planning': { label: 'Planejamento', color: 'bg-blue-100 text-blue-700' },
      'in_progress': { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700' },
      'completed': { label: 'Concluído', color: 'bg-green-100 text-green-700' },
      'on_hold': { label: 'Pausado', color: 'bg-gray-100 text-gray-700' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-700' };
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header da Empresa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dashboardData.company_name}
            </h1>
            <p className="text-gray-600">Dashboard da Empresa</p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Projetos</p>
                <p className="text-2xl font-bold">{dashboardData.projects?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Documentos</p>
                <p className="text-2xl font-bold">{dashboardData.documents?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Membros</p>
                <p className="text-2xl font-bold">{dashboardData.team_members?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Convites Pendentes</p>
                <p className="text-2xl font-bold">{dashboardData.pending_invitations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projetos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projetos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.projects && dashboardData.projects.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(project.status)}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <TrendingUp className="h-3 w-3" />
                          {project.progress}%
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(project.start_date), 'dd/MM', { locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum projeto encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.documents && dashboardData.documents.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{doc.filename}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(doc.uploaded_at), 'dd/MM', { locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum documento encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Membros da Equipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipe ({dashboardData.team_members?.length || 0} membros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.team_members && dashboardData.team_members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.team_members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.is_primary_contact && (
                        <Badge className="text-xs bg-blue-100 text-blue-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    {member.hierarchy_level && (
                      <p className="text-xs text-gray-500">{member.hierarchy_level}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro encontrado</p>
            </div>
          )}

          {/* Convites Pendentes */}
          {dashboardData.pending_invitations && dashboardData.pending_invitations.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3">
                Convites Pendentes ({dashboardData.pending_invitations.length})
              </h4>
              <div className="space-y-2">
                {dashboardData.pending_invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">{invitation.name}</p>
                      <p className="text-sm text-gray-600">{invitation.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(invitation.invited_at), 'dd/MM', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDashboard;
