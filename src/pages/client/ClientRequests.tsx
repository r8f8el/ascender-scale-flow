import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Calendar,
  Upload,
  Download,
  AlertCircle,
  AlertTriangle,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadManager } from '@/hooks/useUploadManager';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RequestCardProps {
  request: {
    id: string;
    client_id: string;
    title: string;
    description: string;
    due_date: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    period_reference: string;
    category: string;
    file_path: string | null;
    filename: string | null;
    file_size: number | null;
    rejection_reason: string | null;
  };
  onSuccess: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onSuccess }) => {
  const { uploadFile, isUploading } = useUploadManager();
  const { client } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pendente
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Enviado (Avaliando)
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const handleDownload = async () => {
    if (!request.file_path || !request.filename) return;
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(request.file_path, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        const a = window.document.createElement('a');
        a.href = data.signedUrl;
        a.download = request.filename;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    }
  };

  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Selecione um arquivo primeiro.');
      return;
    }

    try {
      const result = await uploadFile(selectedFile, {
        bucket: 'documents',
        folder: `client-${request.client_id}/checklist`,
      });

      const { error } = await supabase
        .from('client_document_requests' as any)
        .update({
          status: 'submitted',
          file_path: result.path,
          filename: result.name,
          file_size: result.size,
          content_type: selectedFile.type,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', request.id);

      if (error) throw error;

      // Enviar notificação por e-mail para o administrador
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'document_submitted',
            data: {
              clientCompany: client?.company || 'Empresa Cliente',
              clientName: client?.name || 'Cliente',
              clientEmail: client?.email || '',
              documentTitle: request.title,
              periodReference: request.period_reference,
              filename: result.name,
              adminPanelUrl: `${window.location.origin}/admin/arquivos`
            }
          }
        });
      } catch (emailErr) {
        console.error('Erro ao disparar notificação de e-mail:', emailErr);
      }

      toast.success('Documento enviado com sucesso para a consultoria!');
      setSelectedFile(null);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao realizar upload do arquivo.');
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <Card className={`border-l-4 transition-all hover:shadow-md ${
      request.status === 'approved' ? 'border-l-green-500' :
      request.status === 'rejected' ? 'border-l-red-500' :
      request.status === 'submitted' ? 'border-l-blue-500' : 'border-l-yellow-500'
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
              {getStatusBadge(request.status)}
              {request.category && (
                <Badge variant="secondary" className="text-xs">
                  {request.category}
                </Badge>
              )}
            </div>
            {request.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{request.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
              {request.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className={new Date(request.due_date) < new Date() && request.status === 'pending' ? 'text-red-600 font-semibold' : ''}>
                    Prazo de entrega: {new Date(request.due_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            {request.status === 'rejected' && request.rejection_reason && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Necessário Ajuste:</span>
                  {request.rejection_reason}
                </div>
              </div>
            )}

            {request.filename && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-gray-700 truncate">{request.filename}</span>
                  <span className="text-xs text-gray-400">({formatSize(request.file_size)})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 px-2 text-blue-600 hover:text-blue-800 shrink-0">
                  <Download className="h-4 w-4 mr-1" /> Baixar
                </Button>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto shrink-0 self-end md:self-center">
            {(request.status === 'pending' || request.status === 'rejected') && (
              <form onSubmit={handleSubmitFile} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="relative">
                  <Input 
                    type="file" 
                    id={`file-input-${request.id}`}
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={isUploading}
                  />
                  <Label 
                    htmlFor={`file-input-${request.id}`}
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer ${
                      selectedFile ? 'border-blue-300 bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {selectedFile ? 'Trocar arquivo' : 'Selecionar arquivo'}
                  </Label>
                </div>
                
                {selectedFile && (
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-500 max-w-[120px] truncate self-center">
                      {selectedFile.name}
                    </span>
                    <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0" disabled={isUploading}>
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
                    </Button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ClientRequests = () => {
  const { client } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Load checklist requests
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['client-document-requests', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      const { data, error } = await supabase
        .from('client_document_requests' as any)
        .select('*')
        .eq('client_id', client.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!client?.id,
  });

  const filteredRequests = useMemo(() => {
    return requests.filter((req: any) => {
      const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (req.description && req.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, selectedStatus]);

  // Group requests by reference period
  const groupedRequests = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredRequests.forEach((req: any) => {
      const period = req.period_reference || 'Outros';
      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(req);
    });
    return groups;
  }, [filteredRequests]);

  const formatPeriod = (period: string) => {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) return period;
    const [year, month] = period.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  };

  const getStats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r: any) => r.status === 'pending' || r.status === 'rejected').length;
    const submitted = requests.filter((r: any) => r.status === 'submitted').length;
    const approved = requests.filter((r: any) => r.status === 'approved').length;
    return { total, pending, submitted, approved };
  }, [requests]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">Carregando solicitações de documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Solicitações de Documentos</h1>
        <p className="text-gray-600 mt-1">
          Acompanhe o checklist de documentos solicitados pela consultoria para o seu ciclo de planejamento financeiro.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-gray-500 font-medium">Total Solicitados</span>
            <span className="text-2xl font-bold mt-1 text-gray-900">{getStats.total}</span>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex flex-col justify-center border-l-4 border-l-yellow-500">
            <span className="text-xs text-gray-500 font-medium">Pendentes/Ajustes</span>
            <span className="text-2xl font-bold mt-1 text-yellow-600">{getStats.pending}</span>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex flex-col justify-center border-l-4 border-l-blue-500">
            <span className="text-xs text-gray-500 font-medium">Aguardando Avaliação</span>
            <span className="text-2xl font-bold mt-1 text-blue-600">{getStats.submitted}</span>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4 flex flex-col justify-center border-l-4 border-l-green-500">
            <span className="text-xs text-gray-500 font-medium">Aprovados</span>
            <span className="text-2xl font-bold mt-1 text-green-600">{getStats.approved}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedStatus === 'all' ? 'default' : 'outline'} 
            onClick={() => setSelectedStatus('all')}
            size="sm"
            className="h-10 text-xs sm:text-sm"
          >
            Todos
          </Button>
          <Button 
            variant={selectedStatus === 'pending' ? 'default' : 'outline'} 
            onClick={() => setSelectedStatus('pending')}
            size="sm"
            className="h-10 text-xs sm:text-sm bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 border-yellow-200"
          >
            Pendente
          </Button>
          <Button 
            variant={selectedStatus === 'submitted' ? 'default' : 'outline'} 
            onClick={() => setSelectedStatus('submitted')}
            size="sm"
            className="h-10 text-xs sm:text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
          >
            Enviado
          </Button>
          <Button 
            variant={selectedStatus === 'approved' ? 'default' : 'outline'} 
            onClick={() => setSelectedStatus('approved')}
            size="sm"
            className="h-10 text-xs sm:text-sm bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
          >
            Aprovado
          </Button>
        </div>
      </div>

      {/* Grouped Checklist */}
      <div className="space-y-8">
        {Object.keys(groupedRequests).length === 0 ? (
          <Card className="bg-white border border-dashed border-gray-300">
            <CardContent className="text-center py-16">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Tente reajustar seus filtros ou termo de busca para encontrar as solicitações correspondentes.' 
                  : 'Nenhuma pendência de documento no momento. Ótimo trabalho!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedRequests).map(([period, items]) => (
            <div key={period} className="space-y-4">
              <div className="border-b pb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Referência: {formatPeriod(period)}
                </h2>
                <Badge variant="outline" className="bg-gray-100 text-gray-600 font-semibold">
                  {items.length} {items.length === 1 ? 'documento' : 'documentos'}
                </Badge>
              </div>
              <div className="grid gap-4">
                {items.map((req) => (
                  <RequestCard key={req.id} request={req} onSuccess={refetch} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientRequests;
