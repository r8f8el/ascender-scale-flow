
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileUp, Calendar, MessageSquare, CheckCircle, Clock, AlertCircle, TrendingUp, Ticket, FolderOpen, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface RecentActivity {
  id: string;
  type: 'ticket' | 'document' | 'project' | 'schedule' | 'message';
  description: string;
  created_at: string;
  user_name: string;
  client_name?: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  due_date: string;
  status: string;
  project_name?: string;
  client_name?: string;
  assigned_collaborator?: string;
}

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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [chartData, setChartData] = useState({
    ticketsByStatus: [],
    projectsByStatus: [],
    tasksByCollaborator: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadStats(),
      loadRecentActivity(),
      loadUpcomingTasks(),
      loadChartData()
    ]);
    setIsLoading(false);
  };

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
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Buscar tickets recentes
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, title, created_at, user_name')
        .order('created_at', { ascending: false })
        .limit(3);

      if (tickets) {
        tickets.forEach(ticket => {
          activities.push({
            id: ticket.id,
            type: 'ticket',
            description: `Novo chamado: ${ticket.title}`,
            created_at: ticket.created_at,
            user_name: ticket.user_name
          });
        });
      }

      // Buscar documentos recentes
      const { data: documents } = await supabase
        .from('documents')
        .select(`
          id, 
          filename, 
          created_at,
          user_id,
          client_profiles!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(2);

      if (documents) {
        documents.forEach(doc => {
          activities.push({
            id: doc.id,
            type: 'document',
            description: `Documento enviado: ${doc.filename}`,
            created_at: doc.created_at,
            user_name: (doc.client_profiles as any)?.name || 'Cliente',
            client_name: (doc.client_profiles as any)?.name
          });
        });
      }

      // Buscar projetos recentes
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id, 
          name, 
          created_at,
          admin_profiles!projects_created_by_fkey(name),
          client_profiles!projects_client_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(2);

      if (projects) {
        projects.forEach(project => {
          activities.push({
            id: project.id,
            type: 'project',
            description: `Novo projeto: ${project.name}`,
            created_at: project.created_at,
            user_name: (project.admin_profiles as any)?.name || 'Admin',
            client_name: (project.client_profiles as any)?.name
          });
        });
      }

      // Ordenar por data mais recente
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Erro ao carregar atividade recente:', error);
    }
  };

  const loadUpcomingTasks = async () => {
    try {
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          due_date,
          status,
          projects!inner(name, client_profiles!projects_client_id_fkey(name)),
          collaborators!tasks_assigned_to_fkey(name)
        `)
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(10);

      if (tasks) {
        const formattedTasks: UpcomingTask[] = tasks.map(task => ({
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          status: task.status,
          project_name: (task.projects as any)?.name,
          client_name: (task.projects as any)?.client_profiles?.name,
          assigned_collaborator: (task.collaborators as any)?.name
        }));
        setUpcomingTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Erro ao carregar próximas tarefas:', error);
    }
  };

  const loadChartData = async () => {
    try {
      // Tickets por status
      const { data: ticketStatuses } = await supabase
        .from('tickets')
        .select(`
          status_id,
          ticket_statuses(name, color)
        `);

      const ticketCounts = ticketStatuses?.reduce((acc: any, ticket: any) => {
        const statusName = ticket.ticket_statuses?.name || 'Outros';
        const color = ticket.ticket_statuses?.color || '#8884d8';
        acc[statusName] = (acc[statusName] || 0) + 1;
        if (!acc.colors) acc.colors = {};
        acc.colors[statusName] = color;
        return acc;
      }, {});

      const ticketsByStatus = Object.entries(ticketCounts || {})
        .filter(([key]) => key !== 'colors')
        .map(([name, value]) => ({
          name,
          value,
          color: ticketCounts.colors[name]
        }));

      // Projetos por status
      const { data: projects } = await supabase
        .from('projects')
        .select('status');

      const projectCounts = projects?.reduce((acc: any, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {});

      const projectsByStatus = Object.entries(projectCounts || {}).map(([name, value]) => ({
        name: name === 'planning' ? 'Planejamento' : 
              name === 'in_progress' ? 'Em Progresso' : 
              name === 'completed' ? 'Concluído' : 
              name === 'cancelled' ? 'Cancelado' : name,
        value
      }));

      // Tarefas por colaborador
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          status,
          collaborators!tasks_assigned_to_fkey(name)
        `)
        .not('assigned_to', 'is', null);

      const taskCounts = tasks?.reduce((acc: any, task) => {
        const collaboratorName = task.collaborators?.name || 'Não atribuído';
        if (!acc[collaboratorName]) {
          acc[collaboratorName] = { pending: 0, completed: 0, in_progress: 0 };
        }
        if (task.status === 'pending') acc[collaboratorName].pending++;
        else if (task.status === 'completed') acc[collaboratorName].completed++;
        else if (task.status === 'in_progress') acc[collaboratorName].in_progress++;
        return acc;
      }, {});

      const tasksByCollaborator = Object.entries(taskCounts || {}).map(([name, counts]: [string, any]) => ({
        name,
        pendentes: counts.pending,
        concluidas: counts.completed,
        em_progresso: counts.in_progress
      }));

      setChartData({
        ticketsByStatus,
        projectsByStatus,
        tasksByCollaborator
      });
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-medium">Visão Geral</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          title="Clientes" 
          value={stats.clients.toString()}
          description={`${stats.clients} clientes ativos`}
          icon={<Users className="h-8 w-8 text-blue-500" />}
          link="/admin/clientes"
        />
        <StatsCard 
          title="Projetos" 
          value={stats.projects.toString()}
          description={`${stats.completedProjects} concluídos`}
          icon={<FileUp className="h-8 w-8 text-green-500" />}
          link="/admin/projetos"
        />
        <StatsCard 
          title="Tarefas" 
          value={stats.tasks.toString()}
          description={`${stats.pendingTasks} pendentes`}
          icon={<MessageSquare className="h-8 w-8 text-purple-500" />}
          link="/admin/tarefas"
        />
        <StatsCard 
          title="Chamados" 
          value={stats.tickets.toString()}
          description="Sistema de suporte" 
          icon={<MessageSquare className="h-8 w-8 text-amber-500" />}
          link="/admin/chamados"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          title="Colaboradores" 
          value={stats.collaborators.toString()}
          description="Equipe ativa"
          icon={<Users className="h-8 w-8 text-indigo-500" />}
          link="/admin/colaboradores"
        />
        <StatsCard 
          title="Tarefas Atrasadas" 
          value={stats.overdueTasks.toString()}
          description="Precisam atenção"
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          link="/admin/tarefas"
        />
        <StatsCard 
          title="Projetos Concluídos" 
          value={stats.completedProjects.toString()}
          description="Este período"
          icon={<CheckCircle className="h-8 w-8 text-green-600" />}
          link="/admin/projetos"
        />
        <StatsCard 
          title="Taxa de Conclusão" 
          value={stats.projects > 0 ? Math.round((stats.completedProjects / stats.projects) * 100) + '%' : '0%'}
          description="Projetos finalizados"
          icon={<TrendingUp className="h-8 w-8 text-emerald-500" />}
          link="/admin/projetos"
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        {/* Gráfico de Chamados por Status */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Chamados por Status
            </CardTitle>
            <CardDescription>Distribuição atual dos chamados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.ticketsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.ticketsByStatus.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Projetos por Status */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Projetos por Status
            </CardTitle>
            <CardDescription>Status dos projetos em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.projectsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Tarefas por Colaborador */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tarefas por Colaborador
            </CardTitle>
            <CardDescription>Distribuição de trabalho da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.tasksByCollaborator}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pendentes" stackId="a" fill="#fbbf24" />
                <Bar dataKey="em_progresso" stackId="a" fill="#3b82f6" />
                <Bar dataKey="concluidas" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>Últimas ações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ActivityItem 
                    key={activity.id}
                    type={activity.type}
                    description={activity.description}
                    time={formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                    user={activity.user_name}
                    client={activity.client_name}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma atividade recente encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Próximos Vencimentos
            </CardTitle>
            <CardDescription>Entregas e tarefas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <TaskItem 
                    key={task.id}
                    client={task.client_name || task.project_name || 'N/A'}
                    task={task.title}
                    dueDate={new Date(task.due_date).toLocaleDateString('pt-BR')}
                    status={task.status}
                    collaborator={task.assigned_collaborator}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma tarefa com vencimento próximo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, description, icon, link }: { 
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
}) => {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (link) {
      return (
        <Link to={link} className="block">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
            </div>
            <div className="flex-shrink-0 ml-4">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
};

const ActivityItem = ({ type, description, time, user, client }: {
  type: 'ticket' | 'document' | 'project' | 'schedule' | 'message';
  description: string;
  time: string;
  user: string;
  client?: string;
}) => {
  const getIconByType = () => {
    switch (type) {
      case 'ticket': return <Ticket className="h-4 w-4" />;
      case 'document': return <FolderOpen className="h-4 w-4" />;
      case 'project': return <Zap className="h-4 w-4" />;
      case 'schedule': return <Calendar className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <FileUp className="h-4 w-4" />;
    }
  };

  const getStyleByType = () => {
    switch (type) {
      case 'ticket': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'document': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'project': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'schedule': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'message': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  return (
    <div className="flex items-start space-x-3 py-2 border-b border-border/50 last:border-0">
      <div className={`p-1.5 rounded-full flex-shrink-0 ${getStyleByType()}`}>
        {getIconByType()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 break-words">{description}</p>
        <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span>{time}</span>
          <span>•</span>
          <span className="truncate">{user}</span>
          {client && (
            <>
              <span>•</span>
              <span className="truncate font-medium">{client}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({ client, task, dueDate, status, collaborator }: {
  client: string;
  task: string;
  dueDate: string;
  status: string;
  collaborator?: string;
}) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = () => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 last:border-0 gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 break-words">{task}</p>
        <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span className="truncate">{client}</span>
          {collaborator && (
            <>
              <span>•</span>
              <span className="truncate">Atribuída: {collaborator}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-shrink-0">
        <span className="text-xs font-medium">{dueDate}</span>
        <span className={`text-xs px-2 py-1 rounded-full text-center ${getStatusClass()}`}>
          {getStatusLabel()}
        </span>
      </div>
    </div>
  );
};

export default AdminDashboard;
