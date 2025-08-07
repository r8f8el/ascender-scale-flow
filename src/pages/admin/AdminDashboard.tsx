
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, MessageSquare, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  // Query para estatísticas de colaboradores
  const { data: collaboratorsStats } = useQuery({
    queryKey: ['admin-collaborators-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborators')
        .select('id, is_active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        total: data?.length || 0,
        active: data?.filter(c => c.is_active)?.length || 0,
        inactive: data?.filter(c => !c.is_active)?.length || 0
      };
    }
  });

  // Query para estatísticas de projetos
  const { data: projectsStats } = useQuery({
    queryKey: ['admin-projects-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, status')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        total: data?.length || 0,
        active: data?.filter(p => p.status === 'active')?.length || 0,
        completed: data?.filter(p => p.status === 'completed')?.length || 0,
        pending: data?.filter(p => p.status === 'pending')?.length || 0
      };
    }
  });

  // Query para tickets recentes
  const { data: ticketsStats } = useQuery({
    queryKey: ['admin-tickets-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      return {
        total: data?.length || 0,
        thisWeek: data?.filter(t => new Date(t.created_at) >= lastWeek)?.length || 0,
        recent: data?.slice(0, 5) || []
      };
    }
  });

  // Query para documentos
  const { data: documentsStats } = useQuery({
    queryKey: ['admin-documents-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_documents')
        .select('id, uploaded_at')
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      
      return {
        total: data?.length || 0,
        thisMonth: data?.filter(d => new Date(d.uploaded_at) >= lastMonth)?.length || 0
      };
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-1">
          Visão geral das atividades e métricas da empresa
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaboratorsStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {collaboratorsStats?.total || 0} total ({collaboratorsStats?.inactive || 0} inativos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {projectsStats?.total || 0} total ({projectsStats?.completed || 0} concluídos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Chamados</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsStats?.thisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana ({ticketsStats?.total || 0} total)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsStats?.thisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              Este mês ({documentsStats?.total || 0} total)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seções Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Colaboradores Ativos</p>
                  <p className="text-sm text-gray-500">Membros da equipe trabalhando</p>
                </div>
                <Badge variant="secondary">{collaboratorsStats?.active || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Projetos em Andamento</p>
                  <p className="text-sm text-gray-500">Projetos ativos no sistema</p>
                </div>
                <Badge variant="secondary">{projectsStats?.active || 0}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chamados Semanais</p>
                  <p className="text-sm text-gray-500">Novos chamados esta semana</p>
                </div>
                <Badge variant="secondary">{ticketsStats?.thisWeek || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Sistema Funcionando Normalmente
                    </p>
                    <p className="text-xs text-yellow-700">
                      Todos os serviços estão operacionais
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Crescimento Positivo
                    </p>
                    <p className="text-xs text-green-700">
                      Aumento nas atividades desta semana
                    </p>
                  </div>
                </div>
              </div>

              {(collaboratorsStats?.inactive || 0) > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Colaboradores Inativos
                      </p>
                      <p className="text-xs text-blue-700">
                        {collaboratorsStats.inactive} colaboradores precisam de atenção
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
