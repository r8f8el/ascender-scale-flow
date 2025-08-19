
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, User, Eye } from 'lucide-react';
import { useSolicitacoes } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { CriarSolicitacaoDialog } from '@/components/aprovacoes/CriarSolicitacaoDialog';
import { DetalheSolicitacaoDialog } from '@/components/aprovacoes/DetalheSolicitacaoDialog';
import { Solicitacao } from '@/types/aprovacoes';

const MinhasSolicitacoes = () => {
  const { user } = useAuth();
  const { data: solicitacoes, isLoading, error } = useSolicitacoes(user?.id);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);

  // Debug logs
  console.log('MinhasSolicitacoes - User ID:', user?.id);
  console.log('MinhasSolicitacoes - Solicitacoes data:', solicitacoes);
  console.log('MinhasSolicitacoes - Loading:', isLoading);
  console.log('MinhasSolicitacoes - Error:', error);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'Rejeitado':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'Pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'Requer Ajuste':
        return <Badge className="bg-orange-100 text-orange-800">Requer Ajuste</Badge>;
      case 'Em Elaboração':
        return <Badge className="bg-gray-100 text-gray-800">Em Elaboração</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleViewDetails = (solicitacao: any) => {
    // Convert the raw solicitacao data to match Solicitacao interface
    const formattedSolicitacao: Solicitacao = {
      ...solicitacao,
      tipo_solicitacao: solicitacao.tipo_solicitacao || 'Geral', // Provide default if missing
    };
    setSelectedSolicitacao(formattedSolicitacao);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar solicitações</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Solicitações</h1>
          <p className="text-muted-foreground">
            Gerencie suas solicitações de aprovação
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Criar Nova Solicitação
        </Button>
      </div>

      {/* Debug Card - remover após teste */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-1">
            <p>User ID: {user?.id || 'No user ID'}</p>
            <p>Loading: {isLoading ? 'true' : 'false'}</p>
            <p>Data length: {solicitacoes?.length || 0}</p>
            <p>Data type: {typeof solicitacoes}</p>
            <p>Is array: {Array.isArray(solicitacoes) ? 'true' : 'false'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitacoes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {solicitacoes?.filter(s => s.status === 'Pendente').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {solicitacoes?.filter(s => s.status === 'Aprovado').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requer Ajuste</CardTitle>
            <User className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {solicitacoes?.filter(s => s.status === 'Requer Ajuste').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          {solicitacoes && solicitacoes.length > 0 ? (
            <div className="space-y-4">
              {solicitacoes.map((solicitacao, index) => (
                <div
                  key={solicitacao.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{solicitacao.titulo || 'Título não disponível'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Período: {solicitacao.periodo_referencia || 'Não informado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {solicitacao.data_criacao ? 
                        new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR') : 
                        'Data não disponível'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(solicitacao.status || 'Em Elaboração')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(solicitacao)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Você ainda não criou nenhuma solicitação
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primera Solicitação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CriarSolicitacaoDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedSolicitacao && (
        <DetalheSolicitacaoDialog
          solicitacao={selectedSolicitacao}
          open={!!selectedSolicitacao}
          onOpenChange={() => setSelectedSolicitacao(null)}
        />
      )}
    </div>
  );
};

export default MinhasSolicitacoes;
