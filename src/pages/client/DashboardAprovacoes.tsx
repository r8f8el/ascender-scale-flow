
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, User, Eye } from 'lucide-react';
import { useSolicitacaoPendentes } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { PaginaRevisao } from '@/components/aprovacoes/PaginaRevisao';
import { Solicitacao } from '@/types/aprovacoes';

const DashboardAprovacoes = () => {
  const { user } = useAuth();
  const { data: tarefasPendentes, isLoading } = useSolicitacaoPendentes(user?.id || '');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando aprovações...</p>
        </div>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Aprovações</h1>
        <p className="text-muted-foreground">
          Gerencie suas tarefas de aprovação
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {tarefasPendentes?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Solicitações aguardando sua aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas por Mim</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              0
            </div>
            <p className="text-xs text-muted-foreground">
              Total de aprovações realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tarefas Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            Tarefas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tarefasPendentes && tarefasPendentes.length > 0 ? (
            <div className="space-y-4">
              {tarefasPendentes.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{solicitacao.titulo}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1" />
                        Solicitante: {solicitacao.solicitante_id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Recebido em: {new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Aguardando Aprovação
                    </Badge>
                    <Button
                      onClick={() => setSelectedSolicitacao(solicitacao)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
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
    </div>
  );
};

export default DashboardAprovacoes;
