
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileUp, Calendar, MessageSquare, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    tasks: 0,
    tickets: 0,
    collaborators: 0,
    pendingTasks: 0,
    completedProjects: 0,
    overdueTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Carregar estatísticas em paralelo
      const [
        clientsData,
        projectsData,
        tasksData,
        ticketsData,
        collaboratorsData,
        pendingTasksData,
        completedProjectsData,
        overdueTasksData
      ] = await Promise.all([
        supabase.from('client_profiles').select('id', { count: 'exact' }),
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('tasks').select('id', { count: 'exact' }),
        supabase.from('tickets').select('id', { count: 'exact' }),
        supabase.from('collaborators').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('tasks').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('tasks').select('id', { count: 'exact' }).lt('due_date', new Date().toISOString().split('T')[0]).neq('status', 'completed')
      ]);

      setStats({
        clients: clientsData.count || 0,
        projects: projectsData.count || 0,
        tasks: tasksData.count || 0,
        tickets: ticketsData.count || 0,
        collaborators: collaboratorsData.count || 0,
        pendingTasks: pendingTasksData.count || 0,
        completedProjects: completedProjectsData.count || 0,
        overdueTasks: overdueTasksData.count || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Visão Geral</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Clientes" 
          value={stats.clients.toString()}
          description={`${stats.clients} clientes ativos`}
          icon={<Users className="h-8 w-8 text-blue-500" />} 
        />
        <StatsCard 
          title="Projetos" 
          value={stats.projects.toString()}
          description={`${stats.completedProjects} concluídos`}
          icon={<FileUp className="h-8 w-8 text-green-500" />} 
        />
        <StatsCard 
          title="Tarefas" 
          value={stats.tasks.toString()}
          description={`${stats.pendingTasks} pendentes`}
          icon={<MessageSquare className="h-8 w-8 text-purple-500" />} 
        />
        <StatsCard 
          title="Chamados" 
          value={stats.tickets.toString()}
          description="Sistema de suporte" 
          icon={<MessageSquare className="h-8 w-8 text-amber-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Colaboradores" 
          value={stats.collaborators.toString()}
          description="Equipe ativa"
          icon={<Users className="h-8 w-8 text-indigo-500" />} 
        />
        <StatsCard 
          title="Tarefas Atrasadas" 
          value={stats.overdueTasks.toString()}
          description="Precisam atenção"
          icon={<AlertCircle className="h-8 w-8 text-red-500" />} 
        />
        <StatsCard 
          title="Projetos Concluídos" 
          value={stats.completedProjects.toString()}
          description="Este período"
          icon={<CheckCircle className="h-8 w-8 text-green-600" />} 
        />
        <StatsCard 
          title="Taxa de Conclusão" 
          value={stats.projects > 0 ? Math.round((stats.completedProjects / stats.projects) * 100) + '%' : '0%'}
          description="Projetos finalizados"
          icon={<TrendingUp className="h-8 w-8 text-emerald-500" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem 
                type="upload" 
                description="Relatório de Análise Q1 2025 enviado para Portobello" 
                time="Há 1 hora"
                user="Amanda Silva" 
              />
              <ActivityItem 
                type="client" 
                description="Novo cliente J.Assy cadastrado no sistema" 
                time="Há 3 horas"
                user="Ricardo Mendes" 
              />
              <ActivityItem 
                type="schedule" 
                description="Cronograma de Portobello atualizado" 
                time="Ontem, 14:25"
                user="Carla Santos" 
              />
              <ActivityItem 
                type="message" 
                description="Solicitação #458 foi respondida" 
                time="Ontem, 10:12"
                user="Ricardo Mendes" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
            <CardDescription>Entregas e tarefas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TaskItem 
                client="Portobello" 
                task="Entrega de Relatório Trimestral" 
                dueDate="18/05/2025"
                status="Pendente" 
              />
              <TaskItem 
                client="J.Assy" 
                task="Reunião de Apresentação" 
                dueDate="20/05/2025"
                status="Agendado" 
              />
              <TaskItem 
                client="Portobello" 
                task="Validação de Resultados" 
                dueDate="25/05/2025"
                status="Em Progresso" 
              />
              <TaskItem 
                client="J.Assy" 
                task="Entrega Final de Proposta" 
                dueDate="01/06/2025"
                status="Não Iniciado" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, description, icon }: { 
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityItem = ({ type, description, time, user }: {
  type: 'upload' | 'client' | 'schedule' | 'message';
  description: string;
  time: string;
  user: string;
}) => {
  const getIconByType = () => {
    switch (type) {
      case 'upload': return <FileUp className="h-4 w-4" />;
      case 'client': return <Users className="h-4 w-4" />;
      case 'schedule': return <Calendar className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="flex items-start space-x-3 py-2">
      <div className={`p-1.5 rounded-full 
        ${type === 'upload' ? 'bg-green-100 text-green-600' : ''}
        ${type === 'client' ? 'bg-blue-100 text-blue-600' : ''}
        ${type === 'schedule' ? 'bg-purple-100 text-purple-600' : ''}
        ${type === 'message' ? 'bg-amber-100 text-amber-600' : ''}
      `}>
        {getIconByType()}
      </div>
      <div>
        <p className="text-sm font-medium">{description}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{time}</span>
          <span>•</span>
          <span>{user}</span>
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({ client, task, dueDate, status }: {
  client: string;
  task: string;
  dueDate: string;
  status: 'Pendente' | 'Agendado' | 'Em Progresso' | 'Não Iniciado';
}) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Pendente': return 'bg-amber-100 text-amber-800';
      case 'Agendado': return 'bg-blue-100 text-blue-800';
      case 'Em Progresso': return 'bg-purple-100 text-purple-800';
      case 'Não Iniciado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{task}</p>
        <p className="text-xs text-muted-foreground">{client}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium">{dueDate}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass()}`}>{status}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
