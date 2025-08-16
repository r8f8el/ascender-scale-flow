
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ticket, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  averageResolutionTime: string;
  activeClients: number;
  monthlyGrowth: number;
}

interface AdminDashboardModernProps {
  stats?: DashboardStats;
}

export const AdminDashboardModern: React.FC<AdminDashboardModernProps> = ({ 
  stats = {
    totalTickets: 2847,
    resolvedTickets: 2543,
    pendingTickets: 304,
    averageResolutionTime: '2.3 dias',
    activeClients: 156,
    monthlyGrowth: 12
  }
}) => {
  const resolutionRate = Math.round((stats.resolvedTickets / stats.totalTickets) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do sistema de tickets</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{stats.monthlyGrowth}% este mês
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyGrowth}% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={resolutionRate} className="flex-1" />
              <span className="text-xs text-muted-foreground">{resolutionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingTickets}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              Resolução de tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{stats.activeClients}</div>
            <p className="text-sm text-muted-foreground">
              Clientes com tickets ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Taxa de Resolução</span>
              <Badge variant="default">{resolutionRate}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Crescimento</span>
              <Badge variant="secondary">+{stats.monthlyGrowth}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tempo Médio</span>
              <Badge variant="outline">{stats.averageResolutionTime}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
