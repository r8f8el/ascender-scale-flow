
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApprovalFlow } from '@/hooks/useApprovalFlow';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  FileText, 
  MessageSquare,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { requests, loading } = useApprovalFlow();

  const pendingApprovals = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalRequests = requests.length;

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral das atividades e aprovações
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Todas as solicitações
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Principais funcionalidades do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/aprovacoes">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Fluxo de Aprovações
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/tickets">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Tickets
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/clientes">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/arquivos">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Arquivos
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Approval Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitações Recentes</CardTitle>
            <CardDescription>Últimas solicitações de aprovação</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma solicitação ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                    <div className="flex-shrink-0">
                      {request.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                      {request.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {request.status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{request.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Por {request.requested_by_name}
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/admin/aprovacoes">
                  <Button variant="ghost" className="w-full mt-2">
                    Ver todas as solicitações
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
