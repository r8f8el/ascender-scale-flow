import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Check, 
  X, 
  FileText, 
  Calendar,
  AlertTriangle,
  FolderOpen,
  Loader2,
  Filter,
  CheckSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ChecklistManagerProps {
  clientId?: string;
}

const ChecklistManager: React.FC<ChecklistManagerProps> = ({ clientId }) => {
  const [selectedClient, setSelectedClient] = useState<string>(clientId || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Create single request form state
  const [newRequest, setNewRequest] = useState({
    clientId: '',
    title: '',
    description: '',
    dueDate: '',
    periodReference: '',
    category: 'Contábil'
  });

  // Bulk request state
  const [bulkRequest, setBulkRequest] = useState({
    clientId: '',
    periodReference: '',
    dueDate: '',
    items: {
      balancete: true,
      dre: true,
      extratos: true,
      folha: false
    }
  });

  const categories = ['Contábil', 'Fiscal', 'RH', 'Financeiro', 'Outros'];

  // Load clients
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['admin-checklist-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, company')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Load requests
  const { data: requests = [], isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['admin-document-requests', selectedClient, selectedPeriod, selectedStatus, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('client_document_requests' as any)
        .select(`
          *,
          client_profiles (
            name,
            company
          )
        `);

      if (selectedClient && selectedClient !== 'all') {
        query = query.eq('client_id', selectedClient);
      }
      if (selectedPeriod && selectedPeriod !== 'all') {
        query = query.eq('period_reference', selectedPeriod);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query.order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Filter list by term locally for quick search
  const filteredRequests = useMemo(() => {
    return requests.filter((req: any) => {
      const clientName = req.client_profiles?.name || '';
      const clientCompany = req.client_profiles?.company || '';
      const title = req.title || '';
      const description = req.description || '';
      
      const searchLower = searchTerm.toLowerCase();
      return clientName.toLowerCase().includes(searchLower) ||
             clientCompany.toLowerCase().includes(searchLower) ||
             title.toLowerCase().includes(searchLower) ||
             description.toLowerCase().includes(searchLower);
    });
  }, [requests, searchTerm]);

  // Unique reference periods list for filter dropdown
  const uniquePeriods = useMemo(() => {
    const periods = new Set<string>();
    requests.forEach((req: any) => {
      if (req.period_reference) periods.add(req.period_reference);
    });
    return Array.from(periods).sort().reverse();
  }, [requests]);

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.clientId || !newRequest.title || !newRequest.periodReference || !newRequest.dueDate) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const { error } = await supabase
        .from('client_document_requests' as any)
        .insert({
          client_id: newRequest.clientId,
          title: newRequest.title,
          description: newRequest.description,
          due_date: newRequest.dueDate,
          period_reference: newRequest.periodReference,
          category: newRequest.category,
          status: 'pending'
        } as any);

      if (error) throw error;

      toast.success('Solicitação criada com sucesso!');
      setIsCreateOpen(false);
      setNewRequest({
        clientId: '',
        title: '',
        description: '',
        dueDate: '',
        periodReference: '',
        category: 'Contábil'
      });
      refetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao criar solicitação: ' + err.message);
    }
  };

  const handleCreateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRequest.clientId || !bulkRequest.periodReference || !bulkRequest.dueDate) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    const requestsToInsert = [];
    if (bulkRequest.items.balancete) {
      requestsToInsert.push({
        client_id: bulkRequest.clientId,
        title: 'Balancete de Verificação',
        description: 'Enviar o balancete completo do período em formato PDF ou Excel contendo as contas de ativo, passivo, receitas e despesas.',
        due_date: bulkRequest.dueDate,
        period_reference: bulkRequest.periodReference,
        category: 'Contábil'
      });
    }
    if (bulkRequest.items.dre) {
      requestsToInsert.push({
        client_id: bulkRequest.clientId,
        title: 'Demonstração de Resultados (DRE)',
        description: 'DRE gerencial detalhada do período com quebra por centro de custo, se disponível.',
        due_date: bulkRequest.dueDate,
        period_reference: bulkRequest.periodReference,
        category: 'Financeiro'
      });
    }
    if (bulkRequest.items.extratos) {
      requestsToInsert.push({
        client_id: bulkRequest.clientId,
        title: 'Extratos Bancários Consolidados',
        description: 'Extratos das contas bancárias em formato PDF ou OFX abrangendo do primeiro ao último dia do mês de referência.',
        due_date: bulkRequest.dueDate,
        period_reference: bulkRequest.periodReference,
        category: 'Financeiro'
      });
    }
    if (bulkRequest.items.folha) {
      requestsToInsert.push({
        client_id: bulkRequest.clientId,
        title: 'Relatório de Folha de Pagamento',
        description: 'Resumo da folha de pagamento, encargos sociais e provisões do mês de referência.',
        due_date: bulkRequest.dueDate,
        period_reference: bulkRequest.periodReference,
        category: 'RH'
      });
    }

    if (requestsToInsert.length === 0) {
      toast.error('Selecione pelo menos um documento para solicitar.');
      return;
    }

    try {
      const { error } = await supabase
        .from('client_document_requests' as any)
        .insert(requestsToInsert as any);

      if (error) throw error;

      toast.success(`${requestsToInsert.length} solicitações criadas com sucesso!`);
      setIsBulkOpen(false);
      setBulkRequest({
        clientId: '',
        periodReference: '',
        dueDate: '',
        items: { balancete: true, dre: true, extratos: true, folha: false }
      });
      refetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao criar lote de solicitações: ' + err.message);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('client_document_requests' as any)
        .update({ status: 'approved', rejection_reason: null } as any)
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Documento aprovado e adicionado à base!');
      refetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao aprovar documento: ' + err.message);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId || !rejectionReason.trim()) {
      toast.error('Digite a justificativa para a rejeição.');
      return;
    }

    try {
      const { error } = await supabase
        .from('client_document_requests' as any)
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason
        } as any)
        .eq('id', rejectingRequestId);

      if (error) throw error;

      toast.success('Solicitação marcada como rejeitada. O cliente será avisado no portal.');
      setIsRejectOpen(false);
      setRejectingRequestId(null);
      setRejectionReason('');
      refetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao rejeitar documento: ' + err.message);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Deseja realmente remover esta solicitação de documento?')) return;

    try {
      const { error } = await supabase
        .from('client_document_requests' as any)
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Solicitação removida.');
      refetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao remover solicitação: ' + err.message);
    }
  };

  const handleDownload = async (file_path: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(file_path, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        const a = window.document.createElement('a');
        a.href = data.signedUrl;
        a.download = filename;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const formatPeriod = (period: string) => {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) return period;
    const [year, month] = period.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Enviado</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Checklist de Documentos</h3>
          <p className="text-gray-600 text-sm">
            Solicite arquivos de fechamento para os clientes e avalie as entregas periódicas.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsBulkOpen(true)} variant="outline" className="flex-1 sm:flex-none border-blue-200 text-blue-700 hover:bg-blue-50">
            <CheckSquare className="h-4 w-4 mr-2" /> Solicitação Padrão
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company || c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                {uniquePeriods.map((p) => (
                  <SelectItem key={p} value={p}>
                    {formatPeriod(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="submitted">Enviado</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Checklist Table */}
      <Card>
        <CardContent className="p-0">
          {isLoadingRequests ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-500 text-sm">Carregando checklist...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold text-gray-700">Nenhuma solicitação encontrada</p>
              <p className="text-xs mt-1">Experimente remover filtros ou criar uma nova solicitação.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase border-b">
                  <tr>
                    <th className="px-6 py-4">Cliente / Empresa</th>
                    <th className="px-6 py-4">Documento / Categoria</th>
                    <th className="px-6 py-4">Ref. / Vencimento</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{req.client_profiles?.company || 'Sem empresa'}</div>
                        <div className="text-xs text-gray-500">{req.client_profiles?.name}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-semibold text-gray-900">{req.title}</div>
                        {req.description && (
                          <div className="text-xs text-gray-500 truncate" title={req.description}>
                            {req.description}
                          </div>
                        )}
                        <div className="mt-1">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase font-medium bg-gray-50 text-gray-500">
                            {req.category || 'Contábil'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{formatPeriod(req.period_reference)}</div>
                        {req.due_date && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(req.due_date).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                        {req.status === 'rejected' && req.rejection_reason && (
                          <div className="text-[10px] text-red-600 max-w-[120px] truncate mt-1" title={req.rejection_reason}>
                            Motivo: {req.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {req.file_path && req.filename && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDownload(req.file_path, req.filename)}
                              title={`Baixar ${req.filename} (${formatSize(req.file_size)})`}
                              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {req.status === 'submitted' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleApprove(req.id)}
                                title="Aprovar Documento"
                                className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setRejectingRequestId(req.id);
                                  setIsRejectOpen(true);
                                }}
                                title="Rejeitar Documento"
                                className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(req.id)}
                            title="Remover Solicitação"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Create Single Request */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Solicitar Documento</DialogTitle>
            <DialogDescription>
              Crie uma solicitação de upload de arquivo para um cliente específico.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSingle} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="create-client">Cliente *</Label>
              <Select 
                value={newRequest.clientId} 
                onValueChange={(val) => setNewRequest(prev => ({ ...prev, clientId: val }))}
              >
                <SelectTrigger id="create-client">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-title">Nome do Documento *</Label>
              <Input
                id="create-title"
                placeholder="Ex: Balancete de Verificação"
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-desc">Descrição / Instruções</Label>
              <Textarea
                id="create-desc"
                placeholder="Instruções para o cliente sobre como obter ou estruturar este arquivo..."
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-period">Ref. (AAAA-MM) *</Label>
                <Input
                  id="create-period"
                  placeholder="Ex: 2026-06"
                  value={newRequest.periodReference}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, periodReference: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-due">Data Limite *</Label>
                <Input
                  id="create-due"
                  type="date"
                  value={newRequest.dueDate}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-category">Categoria</Label>
              <Select 
                value={newRequest.category} 
                onValueChange={(val) => setNewRequest(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger id="create-category">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Solicitar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Bulk Request Standard */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Solicitações de Fechamento Mensal</DialogTitle>
            <DialogDescription>
              Crie em lote os pedidos dos arquivos de fechamento padrão para um cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBulk} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="bulk-client">Cliente *</Label>
              <Select 
                value={bulkRequest.clientId} 
                onValueChange={(val) => setBulkRequest(prev => ({ ...prev, clientId: val }))}
              >
                <SelectTrigger id="bulk-client">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bulk-period">Ref. (AAAA-MM) *</Label>
                <Input
                  id="bulk-period"
                  placeholder="Ex: 2026-06"
                  value={bulkRequest.periodReference}
                  onChange={(e) => setBulkRequest(prev => ({ ...prev, periodReference: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bulk-due">Data Limite *</Label>
                <Input
                  id="bulk-due"
                  type="date"
                  value={bulkRequest.dueDate}
                  onChange={(e) => setBulkRequest(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
              <Label className="font-semibold block mb-2 text-gray-800">Checklist Padrão</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-normal text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkRequest.items.balancete}
                    onChange={(e) => setBulkRequest(prev => ({
                      ...prev,
                      items: { ...prev.items, balancete: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Balancete de Verificação (Contábil)
                </label>
                <label className="flex items-center gap-2 text-sm font-normal text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkRequest.items.dre}
                    onChange={(e) => setBulkRequest(prev => ({
                      ...prev,
                      items: { ...prev.items, dre: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  DRE Gerencial (Financeiro)
                </label>
                <label className="flex items-center gap-2 text-sm font-normal text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkRequest.items.extratos}
                    onChange={(e) => setBulkRequest(prev => ({
                      ...prev,
                      items: { ...prev.items, extratos: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Extratos Bancários Consolidados (Financeiro)
                </label>
                <label className="flex items-center gap-2 text-sm font-normal text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkRequest.items.folha}
                    onChange={(e) => setBulkRequest(prev => ({
                      ...prev,
                      items: { ...prev.items, folha: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Resumo da Folha de Pagamento (RH)
                </label>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsBulkOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Solicitar Lote</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Reject submission */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rejeitar Envio de Documento</DialogTitle>
            <DialogDescription>
              Explique ao cliente o motivo da rejeição para orientá-lo no envio do arquivo correto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason">Motivo da Rejeição *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Ex: Balancete incompleto, falta incluir as folhas das contas de resultado..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsRejectOpen(false);
                setRejectingRequestId(null);
                setRejectionReason('');
              }}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Rejeitar Documento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecklistManager;
