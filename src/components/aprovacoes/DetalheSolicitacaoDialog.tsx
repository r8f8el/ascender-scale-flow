
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Clock } from 'lucide-react';
import { Solicitacao } from '@/types/aprovacoes';
import { useAnexos, useHistoricoAprovacao } from '@/hooks/useSolicitacoes';

interface DetalheSolicitacaoDialogProps {
  solicitacao: Solicitacao;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DetalheSolicitacaoDialog: React.FC<DetalheSolicitacaoDialogProps> = ({
  solicitacao,
  open,
  onOpenChange
}) => {
  const { data: anexos } = useAnexos(solicitacao.id);
  const { data: historico } = useHistoricoAprovacao(solicitacao.id);

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

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'Criação':
        return '📝';
      case 'Aprovação':
        return '✅';
      case 'Rejeição':
        return '❌';
      case 'Solicitação de Ajuste':
        return '🔄';
      default:
        return '📋';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {solicitacao.titulo}
            {getStatusBadge(solicitacao.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detalhes da Solicitação */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Solicitação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Título</label>
                  <p className="mt-1">{solicitacao.titulo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Período de Referência</label>
                  <p className="mt-1">{solicitacao.periodo_referencia}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Descrição</label>
                  <p className="mt-1 whitespace-pre-wrap">{solicitacao.descricao}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="mt-1">
                      {new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Última Modificação</label>
                    <p className="mt-1">
                      {new Date(solicitacao.data_ultima_modificacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentos Anexados */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos Anexados</CardTitle>
              </CardHeader>
              <CardContent>
                {anexos && anexos.length > 0 ? (
                  <div className="space-y-3">
                    {anexos.map((anexo) => (
                      <div key={anexo.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-gray-500" />
                          <div>
                            <p className="font-medium">{anexo.nome_arquivo}</p>
                            {anexo.tamanho_arquivo && (
                              <p className="text-sm text-gray-500">
                                {(anexo.tamanho_arquivo / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(anexo.url_arquivo, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum documento anexado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Histórico do Fluxo */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Histórico do Fluxo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historico && historico.length > 0 ? (
                  <div className="space-y-4">
                    {historico.map((item, index) => (
                      <div key={item.id} className="relative">
                        {index < historico.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                        )}
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                            {getAcaoIcon(item.acao)}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{item.acao}</p>
                              <time className="text-xs text-gray-500">
                                {new Date(item.data_acao).toLocaleDateString('pt-BR')}
                              </time>
                            </div>
                            <p className="text-sm text-gray-600">{item.nome_usuario}</p>
                            {item.comentario && (
                              <p className="text-sm text-gray-700 mt-1 italic">
                                "{item.comentario}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum histórico disponível
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
