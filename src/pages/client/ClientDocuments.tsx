
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileManager } from '@/components/FileManager';
import { useApprovalFlow } from '@/hooks/useApprovalFlow';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare,
  Calendar,
  Users,
  ArrowRight
} from 'lucide-react';

export default function ClientDocuments() {
  const { requests, loading } = useApprovalFlow();
  
  const myPendingApprovals = requests.filter(r => r.status === 'pending').length;
  const myApprovedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus documentos e aprovações
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{myPendingApprovals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{myApprovedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
          <CardDescription>Principais funcionalidades disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Link to="/cliente/aprovacoes">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Fluxo de Aprovações
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cliente/tickets">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Tickets
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cliente/cronograma">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Cronograma
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cliente/equipe">
              <Button className="w-full justify-between" variant="outline">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Equipe
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* File Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Arquivos</CardTitle>
        </CardHeader>
        <CardContent>
          <FileManager />
        </CardContent>
      </Card>
    </div>
  );
}
