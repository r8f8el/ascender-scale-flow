
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllSolicitacoes, useSolicitacaoPendentes } from '@/hooks/useSolicitacoes';
import { useAuth } from '@/contexts/AuthContext';
import { DetalheSolicitacaoDialog } from '@/components/aprovacoes/DetalheSolicitacaoDialog';
import { Solicitacao } from '@/types/aprovacoes';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SolicitacaoWithProfile extends Solicitacao {
  client_profiles: { name: string; email: string };
}

const AdminApprovals: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoWithProfile | null>(null);

  // Buscar todas as solicitações (para admins)
  const { data: allSolicitacoes = [], isLoading: loadingAll, refetch: refetchAll } = useAllSolicitacoes();
  
  // Buscar solicitações pendentes para o usuário atual
  const { data: pendingSolicitacoes = [], isLoading: loadingPending, refetch: refetchPending } = 
    useSolicitacaoPendentes(user?.id || '');

  console.log('Admin Approvals - All solicitacoes:', allSolicitacoes);
  console.log('Admin Approvals - Pending solicitacoes:', pendingSolicitacoes);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em Elaboração':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Pendente':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Aprovado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejeitado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Requer Ajuste':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Elaboração':
        return 'bg-blue-100 text-blue-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      case 'Requer Ajuste':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSolicitacoes = (allSolicitacoes as SolicitacaoWithProfile[]).filter(solicitacao => {
    const matchesSearch = solicitacao.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitacao.client_profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         solicitacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || solicitacao.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    refetchAll();
    refetchPending();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const SolicitacaoCard = ({ solicitacao }: { solicitacao: SolicitacaoWithProfile }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setSelectedSolicitacao(solicitacao)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{solicitacao.titulo}</h3>
            {solicitacao.periodo_referencia && (
              <p className="text-sm text-gray-600 mb-2">
                {solicitacao.periodo_referencia}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(solicitacao.status)}
            <Badge className={getStatusColor(solicitacao.status)}>
              {solicitacao.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="h-4 w-4" />
            <span>Solicitante: {solicitacao.client_profiles?.name || 'Nome não disponível'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Criado em: {formatDate(solicitacao.data_criacao)}</span>
          </div>

          {solicitacao.valor_solicitado && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Valor: R$ {Number(solicitacao.valor_solicitado).toLocaleString('pt-BR')}</span>
            </div>
          )}

          {solicitacao.aprovadores_necessarios && solicitacao.aprovadores_necessarios.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Aprovadores necessários:</p>
              <div className="flex flex-wrap gap-1">
                {solicitacao.aprovadores_necessarios.map((aprovador, index) => (
                  <Badge 
                    key={aprovador.id || index} 
                    variant={aprovador.aprovado ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {aprovador.name} {aprovador.aprovado ? '✓' : '⏳'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {solicitacao.descricao && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {solicitacao.descricao}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loadingAll && loadingPending) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Aprovações</h1>
          <p className="text-gray-600">
            Visualize e gerencie todas as solicitações de aprovação
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({filteredSolicitacoes.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes para Mim ({(pendingSolicitacoes as SolicitacaoWithProfile[]).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, solicitante ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Em Elaboração">Em Elaboração</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                <SelectItem value="Requer Ajuste">Requer Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de solicitações */}
          <div className="grid gap-4">
            {filteredSolicitacoes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma solicitação encontrada
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Tente ajustar os filtros para ver mais resultados'
                      : 'Ainda não há solicitações no sistema'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSolicitacoes.map((solicitacao) => (
                <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {(pendingSolicitacoes as SolicitacaoWithProfile[]).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma solicitação pendente
                  </h3>
                  <p className="text-gray-500">
                    Você não tem solicitações aguardando sua aprovação no momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              (pendingSolicitacoes as SolicitacaoWithProfile[]).map((solicitacao) => (
                <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedSolicitacao && (
        <DetalheSolicitacaoDialog
          solicitacao={selectedSolicitacao}
          open={!!selectedSolicitacao}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedSolicitacao(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminApprovals;
