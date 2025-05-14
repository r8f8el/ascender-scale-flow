
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, Calendar, AlertTriangle, Edit, Trash, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// Dados de exemplo para as mensagens automáticas
const mensagensIniciais = [
  {
    id: '1',
    tipo: 'solicitacao',
    assunto: 'Confirmação de Solicitação',
    corpo: 'Prezado(a) [CLIENTE],\n\nRecebemos sua solicitação sobre "[ASSUNTO]" e ela está sendo analisada pela nossa equipe.\n\nVocê será notificado assim que tivermos uma resposta.\n\nAtenciosamente,\nEquipe Ascalate',
    habilitado: true
  },
  {
    id: '2',
    tipo: 'documento',
    assunto: 'Novo Documento Disponível',
    corpo: 'Prezado(a) [CLIENTE],\n\nUm novo documento "[DOCUMENTO]" foi adicionado ao seu portal de cliente.\n\nAcesse a área de documentos para visualizá-lo.\n\nAtenciosamente,\nEquipe Ascalate',
    habilitado: true
  },
  {
    id: '3',
    tipo: 'reuniao',
    assunto: 'Lembrete de Reunião',
    corpo: 'Prezado(a) [CLIENTE],\n\nEste é um lembrete sobre nossa reunião marcada para [DATA] às [HORA].\n\nAssunto: [ASSUNTO]\n\nAguardamos sua presença.\n\nAtenciosamente,\nEquipe Ascalate',
    habilitado: false
  },
  {
    id: '4',
    tipo: 'entrega',
    assunto: 'Lembrete de Entrega',
    corpo: 'Prezado(a) [CLIENTE],\n\nEste é um lembrete sobre a entrega do documento "[DOCUMENTO]" programada para [DATA].\n\nPor favor, confirme o recebimento assim que disponível.\n\nAtenciosamente,\nEquipe Ascalate',
    habilitado: true
  },
];

const MensagensAdmin = () => {
  const [mensagens, setMensagens] = useState(mensagensIniciais);
  const [mensagemEmEdicao, setMensagemEmEdicao] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    tipo: '',
    assunto: '',
    corpo: '',
    habilitado: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };

  const iniciarEdicao = (mensagem: any) => {
    setMensagemEmEdicao(mensagem.id);
    setFormValues({
      tipo: mensagem.tipo,
      assunto: mensagem.assunto,
      corpo: mensagem.corpo,
      habilitado: mensagem.habilitado
    });
  };

  const cancelarEdicao = () => {
    setMensagemEmEdicao(null);
    setFormValues({
      tipo: '',
      assunto: '',
      corpo: '',
      habilitado: true
    });
  };

  const salvarEdicao = (id: string) => {
    if (!formValues.assunto || !formValues.corpo) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const mensagensAtualizadas = mensagens.map(msg => 
      msg.id === id 
        ? {...msg, ...formValues} 
        : msg
    );
    setMensagens(mensagensAtualizadas);
    setMensagemEmEdicao(null);
    toast.success('Mensagem atualizada com sucesso');
  };

  const alterarStatus = (id: string, novoStatus: boolean) => {
    const mensagensAtualizadas = mensagens.map(msg => 
      msg.id === id 
        ? {...msg, habilitado: novoStatus} 
        : msg
    );
    setMensagens(mensagensAtualizadas);
    toast.success(`Mensagem ${novoStatus ? 'ativada' : 'desativada'} com sucesso`);
  };

  const excluirMensagem = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mensagem automática?')) {
      const mensagensAtualizadas = mensagens.filter(msg => msg.id !== id);
      setMensagens(mensagensAtualizadas);
      
      if (mensagemEmEdicao === id) {
        cancelarEdicao();
      }
      
      toast.success('Mensagem excluída com sucesso');
    }
  };

  const adicionarNovaMensagem = () => {
    if (!formValues.tipo || !formValues.assunto || !formValues.corpo) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const novaMensagem = {
      id: Date.now().toString(),
      ...formValues
    };
    
    setMensagens([...mensagens, novaMensagem]);
    cancelarEdicao();
    toast.success('Nova mensagem automática adicionada com sucesso');
  };

  const getIconeParaTipo = (tipo: string) => {
    switch (tipo) {
      case 'solicitacao': return <Bell className="h-5 w-5 text-blue-500" />;
      case 'documento': return <Mail className="h-5 w-5 text-green-500" />;
      case 'reuniao': return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'entrega': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNomeTipo = (tipo: string) => {
    switch (tipo) {
      case 'solicitacao': return 'Confirmação de Solicitação';
      case 'documento': return 'Novo Documento';
      case 'reuniao': return 'Lembrete de Reunião';
      case 'entrega': return 'Lembrete de Entrega';
      default: return 'Outro';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Mensagens Automáticas</h2>
        
        <Button onClick={() => setMensagemEmEdicao('novo')}>
          Nova Mensagem
        </Button>
      </div>
      
      {mensagemEmEdicao === 'novo' && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Mensagem Automática</CardTitle>
            <CardDescription>
              Crie uma nova mensagem para envio automático aos clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Mensagem*</Label>
              <Select 
                value={formValues.tipo} 
                onValueChange={(value) => handleInputChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mensagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solicitacao">Confirmação de Solicitação</SelectItem>
                  <SelectItem value="documento">Novo Documento</SelectItem>
                  <SelectItem value="reuniao">Lembrete de Reunião</SelectItem>
                  <SelectItem value="entrega">Lembrete de Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto do E-mail*</Label>
              <Input
                id="assunto"
                value={formValues.assunto}
                onChange={(e) => handleInputChange('assunto', e.target.value)}
                placeholder="Ex: Confirmação de Solicitação"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="corpo">Conteúdo da Mensagem*</Label>
              <Textarea
                id="corpo"
                value={formValues.corpo}
                onChange={(e) => handleInputChange('corpo', e.target.value)}
                placeholder="Digite o conteúdo da mensagem..."
                className="min-h-[150px]"
              />
              <p className="text-xs text-gray-500">
                Use marcadores como [CLIENTE], [ASSUNTO], [DOCUMENTO], [DATA], [HORA] para personalizar a mensagem.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="habilitado"
                checked={formValues.habilitado}
                onCheckedChange={(checked) => handleInputChange('habilitado', checked)}
              />
              <Label htmlFor="habilitado">Habilitar envio automático por e-mail</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelarEdicao}>
              Cancelar
            </Button>
            <Button onClick={adicionarNovaMensagem}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Mensagem
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {mensagens.map(mensagem => (
          <Card key={mensagem.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 p-4 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {getIconeParaTipo(mensagem.tipo)}
                  <div>
                    <CardTitle>{mensagem.assunto}</CardTitle>
                    <CardDescription>{getNomeTipo(mensagem.tipo)}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`status-${mensagem.id}`}
                      checked={mensagem.habilitado}
                      onCheckedChange={(checked) => alterarStatus(mensagem.id, checked)}
                    />
                    <Label htmlFor={`status-${mensagem.id}`} className="text-xs">
                      {mensagem.habilitado ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => iniciarEdicao(mensagem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => excluirMensagem(mensagem.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {mensagemEmEdicao === mensagem.id ? (
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`assunto-${mensagem.id}`}>Assunto do E-mail*</Label>
                  <Input
                    id={`assunto-${mensagem.id}`}
                    value={formValues.assunto}
                    onChange={(e) => handleInputChange('assunto', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`corpo-${mensagem.id}`}>Conteúdo da Mensagem*</Label>
                  <Textarea
                    id={`corpo-${mensagem.id}`}
                    value={formValues.corpo}
                    onChange={(e) => handleInputChange('corpo', e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-gray-500">
                    Use marcadores como [CLIENTE], [ASSUNTO], [DOCUMENTO], [DATA], [HORA] para personalizar a mensagem.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelarEdicao}>
                    Cancelar
                  </Button>
                  <Button onClick={() => salvarEdicao(mensagem.id)}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {mensagem.corpo}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MensagensAdmin;
