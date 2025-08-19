
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  User, 
  Calendar, 
  Building, 
  TrendingUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText
} from 'lucide-react';

interface Approval {
  id: string;
  title: string;
  value: string;
  department: string;
  requester: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

interface ApprovalDetailsModalProps {
  approval: Approval;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApprovalDetailsModal: React.FC<ApprovalDetailsModalProps> = ({
  approval,
  open,
  onOpenChange
}) => {
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('resume');

  const historicalData = [
    { year: '2024', value: 'R$ 750.000', change: '+13.3%' },
    { year: '2023', value: 'R$ 680.000', change: '+25.0%' },
    { year: 'Orçado 2025', value: 'R$ 800.000', change: '+6.3%' }
  ];

  const approvalHistory = [
    {
      action: 'Solicitação criada',
      user: 'João Silva',
      date: '15/08/2025',
      comment: 'Solicitação inicial do sistema ERP'
    },
    {
      action: 'Enviado para aprovação',
      user: 'Sistema',
      date: '16/08/2025',
      comment: 'Encaminhado para gerente de área'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {approval.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resume">Resumo</TabsTrigger>
            <TabsTrigger value="justification">Justificativa</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Solicitante</p>
                      <p className="font-medium">{approval.requester} ({approval.department})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="font-medium text-green-600">{approval.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Centro de Custo</p>
                      <p className="font-medium">TI-001</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prazo de Implementação</p>
                      <p className="font-medium">Q4 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">ROI Estimado</p>
                      <p className="font-medium">18 meses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Categoria</p>
                      <p className="font-medium">CAPEX - Tecnologia</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativo Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historicalData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{item.year}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-600">{item.value}</span>
                        <Badge variant="outline" className="text-green-600">
                          ({item.change})
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="justification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Justificativa Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {approval.description}
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Benefícios Esperados:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Automatização de processos manuais</li>
                    <li>• Redução de custos operacionais em 15%</li>
                    <li>• Melhoria na precisão de dados financeiros</li>
                    <li>• Compliance com regulamentações</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Aprovações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvalHistory.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border-l-2 border-blue-200 bg-gray-50 rounded-r-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{item.action}</h4>
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Por: {item.user}</p>
                        <p className="text-sm mt-1">{item.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Anexados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum documento anexado a esta solicitação
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Área de Comentários e Ações */}
        <div className="space-y-4 border-t pt-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Comentários do Aprovador
            </label>
            <Textarea
              placeholder="Adicione seus comentários sobre esta aprovação..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Solicitar Mais Informações
            </Button>
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
