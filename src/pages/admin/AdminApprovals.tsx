
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Filter,
  Search,
  Settings,
  Eye
} from 'lucide-react';
import { Solicitacao } from '@/types/aprovacoes';
import { ConfigurarFluxosDialog } from '@/components/admin/aprovacoes/ConfigurarFluxosDialog';
import { FiltrosAprovacaoDialog } from '@/components/admin/aprovacoes/FiltrosAprovacaoDialog';

interface FiltrosSolicitacao {
  status: string;
  periodo: string;
  solicitante: string;
  dataInicio: string;
  dataFim: string;
}

const AdminApprovals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<FiltrosSolicitacao>({
    status: '',
    periodo: '',
    solicitante: '',
    dataInicio: '',
    dataFim: ''
  });
  
  const { data: solicitacoes, isLoading } = useQuery({
    queryKey: ['admin-solicitacoes', filtros, searchTerm],
    queryFn: async () => {
      console.log('Fetching all solicitacoes for admin with filters:', filtros);
      
      let query = supabase
        .from('solicitacoes')
        .select(`
          *,
          client_profiles!solicitacoes_solicitante_id_fkey(name, email)
        `)
        .order('data_criacao', { ascending: false });

      // Aplicar filtros
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      if (filtros.dataInicio) {
        query = query.gte('data_criacao', filtros.dataInicio);
      }

      if (filtros.dataFim) {
        query = query.lte('data_criacao', filtros.dataFim + 'T23:59:59');
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching admin solicitacoes:', error);
        throw error;
      }
      
      let filteredData = data || [];

      // Filtrar por termo de busca
      if (searchTerm) {
        filteredData = filteredData.filter(solicitacao =>
          solicitacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          solicitacao.periodo_referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (solicitacao.client_profiles?.name && 
           solicitacao.client_profiles.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Filtrar por solicitante
      if (filtros.solicitante) {
        filteredData = filteredData.filter(solicitacao =>
          (solicitacao.client_profiles?.name && 
           solicitacao.client_profiles.name.toLowerCase().includes(filtros.solicitante.toLowerCase())) ||
          (solicitacao.client_profiles?.email && 
           solicitacao.client_profiles.email.toLowerCase().includes(filtros.solicitante.toLowerCase()))
        );
      }
      
      console.log('Admin solicitacoes fetched:', filteredData);
      return filteredData as (Solicitacao & { client_profiles: { name: string; email: string } })[];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Rejeitado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administração de Aprovações</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as solicitações de aprovação
          </p>
        </div>
        <ConfigurarFluxosDialog>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Fluxos
          </Button>
        </ConfigurarFluxosDialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitacoes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
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
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {solicitacoes?.filter(s => s.status === 'Aprovado').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {solicitacoes?.filter(s => s.status === 'Rejeitado').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar aprovações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <FiltrosAprovacaoDialog 
              currentFilters={filtros}
              onApplyFilters={setFiltros}
            >
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {Object.values(filtros).filter(v => v !== '').length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {Object.values(filtros).filter(v => v !== '').length}
                  </Badge>
                )}
              </Button>
            </FiltrosAprovacaoDialog>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Aprovações */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          {solicitacoes && solicitacoes.length > 0 ? (
            <div className="space-y-4">
              {solicitacoes.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(solicitacao.status)}
                    <div>
                      <h3 className="font-semibold">{solicitacao.titulo}</h3>
                      <p className="text-sm text-muted-foreground">
                        Período: {solicitacao.periodo_referencia} • Criado em {new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solicitante: {solicitacao.client_profiles?.name || 'Usuário não encontrado'} ({solicitacao.client_profiles?.email})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(solicitacao.status)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => console.log('Ver detalhes da solicitação:', solicitacao.id)}
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
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || Object.values(filtros).some(v => v !== '') 
                  ? 'Nenhuma solicitação encontrada para os filtros aplicados' 
                  : 'Nenhuma solicitação de aprovação encontrada'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApprovals;
