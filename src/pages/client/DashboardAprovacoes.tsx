
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, User, Eye, FileText } from 'lucide-react';
import { useSolicitacaoPendentes, useCompanySolicitacoes } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { PaginaRevisao } from '@/components/aprovacoes/PaginaRevisao';
import { Solicitacao } from '@/types/aprovacoes';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';

const DashboardAprovacoes = () => {
  const { data: tarefasPendentes, isLoading } = useSolicitacaoPendentes(user?.id);
  const { data: companySolicitacoes } = useCompanySolicitacoes();
  const { data: companyAccess } = useCompanyAccess();
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);

  // Helper to find member name by ID
  const getMemberName = (memberId: string) => {
    const member = companyAccess?.companyMembers?.find(m => m.id === memberId);
    return member?.name || 'Colaborador';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando aprovações...</p>
      </div>
    );
  }

  if (selectedSolicitacao) {
    return (
      <PaginaRevisao
        solicitacao={selectedSolicitacao}
        onBack={() => setSelectedSolicitacao(null)}
      />
    );
  }

  const totalCompany = companySolicitacoes?.length || 0;
  const aprovadas = companySolicitacoes?.filter(s => s.status === 'Aprovado').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Aprovações</h1>
        <p className="text-muted-foreground">
          Gerencie as aprovações da sua equipe
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes para Mim</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {tarefasPendentes?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando sua aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total da Empresa</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {totalCompany}
            </div>
            <p className="text-xs text-muted-foreground">
              Solicitações da equipe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {aprovadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de aprovações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            Aguardando Sua Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tarefasPendentes && tarefasPendentes.length > 0 ? (
            <div className="space-y-4">
              {tarefasPendentes.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{solicitacao.titulo}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1" />
                        Solicitante: {getMemberName(solicitacao.solicitante_id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      Aguardando Aprovação
                    </Badge>
                    <Button onClick={() => setSelectedSolicitacao(solicitacao)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma tarefa pendente no momento
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Você está em dia com suas aprovações!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Company Requests */}
      {companySolicitacoes && companySolicitacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Solicitações Recentes da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companySolicitacoes.slice(0, 5).map((sol) => (
                <div key={sol.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{sol.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {getMemberName(sol.solicitante_id)} • {new Date(sol.data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={
                    sol.status === 'Aprovado' ? 'default' :
                    sol.status === 'Rejeitado' ? 'destructive' :
                    'secondary'
                  }>
                    {sol.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardAprovacoes;
