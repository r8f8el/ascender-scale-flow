
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  List,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Target,
  Users
} from 'lucide-react';
import { GanttTask } from '@/hooks/useGanttTasks';
import { useResponsive } from '@/hooks/useResponsive';

interface GanttStatsProps {
  tasks: GanttTask[];
  isAdmin?: boolean;
}

export const GanttStats: React.FC<GanttStatsProps> = ({ tasks, isAdmin = false }) => {
  const isMobile = useResponsive();

  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.progress === 100).length;
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const notStarted = tasks.filter(t => t.progress === 0).length;
    const milestones = tasks.filter(t => t.is_milestone).length;
    const overdue = tasks.filter(t => {
      const endDate = new Date(t.end_date);
      const today = new Date();
      return endDate < today && t.progress < 100;
    }).length;

    const priorityCount = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
    };

    const averageProgress = total > 0 ? tasks.reduce((sum, task) => sum + task.progress, 0) / total : 0;

    const estimatedHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    const actualHours = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      milestones,
      overdue,
      priorityCount,
      averageProgress,
      estimatedHours,
      actualHours,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [tasks]);

  const statCards = [
    {
      title: 'Total de Tarefas',
      value: stats.total,
      icon: List,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Concluídas',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600 border-green-200',
      iconColor: 'text-green-600',
      progress: stats.completionRate
    },
    {
      title: 'Em Progresso',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Marcos',
      value: stats.milestones,
      icon: Target,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      iconColor: 'text-purple-600'
    }
  ];

  if (stats.overdue > 0) {
    statCards.push({
      title: 'Em Atraso',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600 border-red-200',
      iconColor: 'text-red-600'
    });
  }

  if (isMobile) {
    return (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          {statCards.slice(0, 4).map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.iconColor}`} />
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.title}</div>
              {stat.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={stat.progress} className="h-1" />
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.round(stat.progress)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            Progresso Médio: {Math.round(stats.averageProgress)}%
          </div>
          <Progress value={stats.averageProgress} className="mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className={`${stat.color} border transition-all duration-200 hover:shadow-md`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.progress !== undefined && (
                  <div className="mt-2">
                    <Progress value={stat.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(stat.progress)}% concluído
                    </p>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full bg-white/80`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {isAdmin && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Horas de Trabalho</p>
              <TrendingUp className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimadas:</span>
                <span className="font-medium">{stats.estimatedHours}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Realizadas:</span>
                <span className="font-medium">{stats.actualHours}h</span>
              </div>
              {stats.estimatedHours > 0 && (
                <div className="pt-2">
                  <Progress 
                    value={(stats.actualHours / stats.estimatedHours) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((stats.actualHours / stats.estimatedHours) * 100)}% utilizado
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Breakdown - Only show on larger screens */}
      {!isMobile && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Por Prioridade</p>
              <AlertTriangle className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="space-y-2">
              {Object.entries(stats.priorityCount).map(([priority, count]) => {
                const colors = {
                  low: 'bg-blue-500',
                  medium: 'bg-yellow-500',
                  high: 'bg-orange-500',
                  urgent: 'bg-red-500'
                };
                const labels = {
                  low: 'Baixa',
                  medium: 'Média',
                  high: 'Alta',
                  urgent: 'Urgente'
                };
                
                return count > 0 ? (
                  <div key={priority} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors[priority as keyof typeof colors]}`}></div>
                      <span className="text-gray-600">{labels[priority as keyof typeof labels]}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
