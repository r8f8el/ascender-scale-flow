
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Ticket, Clock, CheckCircle, AlertTriangle, Plus, History } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: string;
}

interface RecentTicket {
  id: string;
  number: string;
  title: string;
  status: string;
  created_at: string;
}

interface ClientDashboardModernProps {
  stats?: ClientStats;
  recentTickets?: RecentTicket[];
  clientName?: string;
}

export const ClientDashboardModern: React.FC<ClientDashboardModernProps> = ({
  stats = {
    totalTickets: 24,
    openTickets: 3,
    resolvedTickets: 21,
    averageResponseTime: '4 horas'
  },
  recentTickets = [],
  clientName = 'Cliente'
}) => {
  const resolutionRate = stats.totalTickets > 0 ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolvido':
      case 'fechado':
        return <Badge variant="default">Resolvido</Badge>;
      case 'aberto':
      case 'novo':
        return <Badge variant="destructive">Aberto</Badge>;
      case 'em andamento':
        return <Badge variant="secondary">Em Andamento</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {clientName}!</h1>
          <p className="text-muted-foreground">Aqui está um resumo dos seus chamados</p>
        </div>
        <Link to="/cliente/abrir-chamado">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Chamado
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Todos os seus chamados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando resolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={resolutionRate} className="flex-1" />
              <span className="text-xs text-muted-foreground">{resolutionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Tempo de resposta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Chamados Recentes</CardTitle>
          </div>
          <Link to="/cliente/chamados">
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTickets.length > 0 ? (
            <div className="space-y-3">
              {recentTickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-muted-foreground">#{ticket.number}</span>
                      <h4 className="font-medium">{ticket.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="rounded-full bg-muted p-3 mx-auto mb-4 w-fit">
                <Ticket className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Nenhum chamado encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Você ainda não possui chamados. Crie o seu primeiro!
              </p>
              <Link to="/cliente/abrir-chamado">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Abrir Primeiro Chamado
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
