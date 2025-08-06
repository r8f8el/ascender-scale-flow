
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClientContact = () => {
  const { user, client } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    message: '',
    contactMethod: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = {
    email: 'contato@ascalate.com.br',
    phone: '(11) 9999-9999',
    address: 'São Paulo, SP - Brasil',
    hours: 'Segunda a Sexta, 9h às 18h'
  };

  const teamMembers = [
    {
      name: 'Rafael Gontijo',
      role: 'Analista Senior FP&A',
      email: 'rafael.gontijo@ascalate.com.br',
      avatar: 'RG'
    },
    {
      name: 'Daniel Ascalate',
      role: 'Supervisor',
      email: 'daniel@ascalate.com.br', 
      avatar: 'DA'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular envio de mensagem
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Mensagem enviada com sucesso!');
      setFormData({
        subject: '',
        priority: 'medium',
        message: '',
        contactMethod: 'email'
      });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contato</h1>
        <p className="text-gray-600 mt-1">
          Entre em contato conosco para suporte ou dúvidas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Contato */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Enviar Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Descreva brevemente o assunto"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactMethod">Forma de Contato Preferida</Label>
                  <Select value={formData.contactMethod} onValueChange={(value) => handleInputChange('contactMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Descreva sua solicitação ou dúvida em detalhes..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-6">
          {/* Dados de Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-sm text-gray-600">{contactInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-gray-600">{contactInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Localização</p>
                  <p className="text-sm text-gray-600">{contactInfo.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Horário</p>
                  <p className="text-sm text-gray-600">{contactInfo.hours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipe de Suporte */}
          <Card>
            <CardHeader>
              <CardTitle>Nossa Equipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                    <p className="text-xs text-blue-600">{member.email}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status do Suporte */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
              <p className="text-sm text-gray-600">
                Nossa equipe está disponível para atendimento
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientContact;
