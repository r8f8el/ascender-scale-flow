import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FolderOpen,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgProgress: number;
}

interface ProjectStatus {
  status: string;
  count: number;
}

interface ProjectPriority {
  priority: string;
  count: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const ProjectDashboard: React.FC = () => {
  const { logUserAction } = useActivityLogger();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    avgProgress: 0
  });
  const [statusData, setStatusData] = useState<ProjectStatus[]>([]);
  const [priorityData, setPriorityData] = useState<ProjectPriority[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    logUserAction('access_project_dashboard', 'Admin acessou dashboard de projetos');
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas de projetos
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('status, priority, budget, progress');

      if (projectsError) throw projectsError;

      // Carregar estatísticas de tarefas
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, due_date');

      if (tasksError) throw tasksError;

      // Calcular estatísticas
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'in_progress').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const avgProgress = projects.length > 0 
        ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
        : 0;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const overdueTasks = tasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        totalTasks,
        completedTasks,
        overdueTasks,
        avgProgress
      });

      // Dados para gráficos
      const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusLabels = {
        planning: 'Planejamento',
        in_progress: 'Em Progresso',
        completed: 'Concluído',
        on_hold: 'Em Espera'
      };

      setStatusData(
        Object.entries(statusCounts).map(([status, count]) => ({
          status: statusLabels[status as keyof typeof statusLabels] || status,
          count
        }))
      );

      const priorityCounts = projects.reduce((acc, project) => {
        acc[project.priority] = (acc[project.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priorityLabels = {
        high: 'Alta',
        medium: 'Média',
        low: 'Baixa'
      };

      setPriorityData(
        Object.entries(priorityCounts).map(([priority, count]) => ({
          priority: priorityLabels[priority as keyof typeof priorityLabels] || priority,
          count
        }))
      );

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Projetos</h2>
        <p className="text-muted-foreground">
          Visão geral dos projetos e tarefas da empresa
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalBudget.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total dos projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueTasks} atrasadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgProgress)}%</div>
            <Progress value={stats.avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Status</CardTitle>
            <CardDescription>
              Distribuição dos projetos por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projetos por Prioridade</CardTitle>
            <CardDescription>
              Distribuição dos projetos por nível de prioridade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ priority, percent }) => `${priority} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.overdueTasks > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-800">Tarefas Atrasadas</p>
                  <p className="text-sm text-orange-600">{stats.overdueTasks} tarefas precisam de atenção</p>
                </div>
                <Badge variant="destructive">{stats.overdueTasks}</Badge>
              </div>
            )}
            
            {stats.activeProjects === 0 && stats.totalProjects > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Nenhum Projeto Ativo</p>
                  <p className="text-sm text-yellow-600">Considere ativar alguns projetos</p>
                </div>
              </div>
            )}

            {stats.totalProjects === 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Começar</p>
                  <p className="text-sm text-blue-600">Crie seu primeiro projeto</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Próximas Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Revisão de Projetos</p>
                  <p className="text-xs text-muted-foreground">Agendar revisões semanais</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Relatórios</p>
                  <p className="text-xs text-muted-foreground">Gerar relatórios mensais</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;