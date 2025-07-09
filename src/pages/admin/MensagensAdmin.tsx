import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { useToast } from '@/hooks/use-toast';

interface MensagemAutomatica {
  id: string;
  type: string;
  subject: string;
  body: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

const MensagensAdmin = () => {
  const { toast } = useToast();
  const [mensagens, setMensagens] = useState<MensagemAutomatica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mensagemEmEdicao, setMensagemEmEdicao] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    type: '',
    subject: '',
    body: '',
    enabled: true
  });

  useEffect(() => {
    loadMensagens();
  }, []);

  const loadMensagens = async () => {
    try {
      const { data, error } = await supabase
        .from('automatic_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMensagens(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens automáticas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };

  const iniciarEdicao = (mensagem: MensagemAutomatica) => {
    setMensagemEmEdicao(mensagem.id);
    setFormValues({
      type: mensagem.type,
      subject: mensagem.subject,
      body: mensagem.body,
      enabled: mensagem.enabled
    });
  };

  const cancelarEdicao = () => {
    setMensagemEmEdicao(null);
    setFormValues({
      type: '',
      subject: '',
      body: '',
      enabled: true
    });
  };

  const salvarEdicao = async (id: string) => {
    if (!formValues.subject || !formValues.body) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('automatic_messages')
        .update({
          subject: formValues.subject,
          body: formValues.body,
          enabled: formValues.enabled
        })
        .eq('id', id);

      if (error) throw error;
      
      setMensagemEmEdicao(null);
      toast({
        title: "Sucesso",
        description: "Mensagem atualizada com sucesso!"
      });
      
      loadMensagens();
    } catch (error: any) {
      console.error('Erro ao salvar mensagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar mensagem.",
        variant: "destructive"
      });
    }
  };

  const alterarStatus = async (id: string, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('automatic_messages')
        .update({ enabled: novoStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Mensagem ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`
      });
      
      loadMensagens();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status da mensagem.",
        variant: "destructive"
      });
    }
  };

  const excluirMensagem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mensagem automática?')) {
      try {
        const { error } = await supabase
          .from('automatic_messages')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        if (mensagemEmEdicao === id) {
          cancelarEdicao();
        }
        
        toast({
          title: "Sucesso",
          description: "Mensagem excluída com sucesso!"
        });
        
        loadMensagens();
      } catch (error: any) {
        console.error('Erro ao excluir mensagem:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir mensagem.",
          variant: "destructive"
        });
      }
    }
  };

  const adicionarNovaMensagem = async () => {
    if (!formValues.type || !formValues.subject || !formValues.body) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('automatic_messages')
        .insert([formValues]);

      if (error) throw error;
      
      cancelarEdicao();
      toast({
        title: "Sucesso",
        description: "Nova mensagem automática adicionada com sucesso!"
      });
      
      loadMensagens();
    } catch (error: any) {
      console.error('Erro ao adicionar mensagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar mensagem.",
        variant: "destructive"
      });
    }
  };

  const getIconeParaTipo = (tipo: string) => {
    switch (tipo) {
      case 'ticket': return <Bell className="h-5 w-5 text-blue-500" />;
      case 'document': return <Mail className="h-5 w-5 text-green-500" />;
      case 'meeting': return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'delivery': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNomeTipo = (tipo: string) => {
    switch (tipo) {
      case 'ticket': return 'Confirmação de Chamado';
      case 'document': return 'Novo Documento';
      case 'meeting': return 'Lembrete de Reunião';
      case 'delivery': return 'Lembrete de Entrega';
      default: return 'Outro';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando mensagens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mensagens Automáticas</h2>
        
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
              <Label htmlFor="type">Tipo de Mensagem*</Label>
              <Select 
                value={formValues.type} 
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mensagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ticket">Confirmação de Chamado</SelectItem>
                  <SelectItem value="document">Novo Documento</SelectItem>
                  <SelectItem value="meeting">Lembrete de Reunião</SelectItem>
                  <SelectItem value="delivery">Lembrete de Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto do E-mail*</Label>
              <Input
                id="subject"
                value={formValues.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Ex: Confirmação de Chamado"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Conteúdo da Mensagem*</Label>
              <Textarea
                id="body"
                value={formValues.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                placeholder="Digite o conteúdo da mensagem..."
                className="min-h-[150px]"
              />
              <p className="text-xs text-gray-500">
                Use marcadores como [CLIENTE], [ASSUNTO], [DOCUMENTO], [DATA], [HORA] para personalizar a mensagem.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formValues.enabled}
                onCheckedChange={(checked) => handleInputChange('enabled', checked)}
              />
              <Label htmlFor="enabled">Habilitar envio automático por e-mail</Label>
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
                  {getIconeParaTipo(mensagem.type)}
                  <div>
                    <CardTitle>{mensagem.subject}</CardTitle>
                    <CardDescription>{getNomeTipo(mensagem.type)}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`status-${mensagem.id}`}
                      checked={mensagem.enabled}
                      onCheckedChange={(checked) => alterarStatus(mensagem.id, checked)}
                    />
                    <Label htmlFor={`status-${mensagem.id}`} className="text-xs">
                      {mensagem.enabled ? 'Ativo' : 'Inativo'}
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
                  <Label htmlFor={`subject-${mensagem.id}`}>Assunto do E-mail*</Label>
                  <Input
                    id={`subject-${mensagem.id}`}
                    value={formValues.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`body-${mensagem.id}`}>Conteúdo da Mensagem*</Label>
                  <Textarea
                    id={`body-${mensagem.id}`}
                    value={formValues.body}
                    onChange={(e) => handleInputChange('body', e.target.value)}
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
                    {mensagem.body}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {mensagens.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma mensagem encontrada</h3>
            <p className="text-muted-foreground text-center">
              Comece criando sua primeira mensagem automática clicando no botão "Nova Mensagem"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MensagensAdmin;