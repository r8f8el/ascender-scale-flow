
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  User,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClientContact = () => {
  const { client } = useAuth();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    subject: '',
    priority: '',
    message: ''
  });

  console.log('📞 ClientContact - Cliente:', client?.name);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      toast.error('Por favor, preencha o assunto e a mensagem');
      return;
    }

    console.log('📧 Enviando mensagem:', formData);
    toast.success('Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.');
    
    // Limpar formulário
    setFormData(prev => ({
      ...prev,
      subject: '',
      priority: '',
      message: ''
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contato</h1>
        <p className="text-gray-600 mt-1">
          Entre em contato conosco para dúvidas ou suporte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Contato */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Assunto da mensagem"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Descreva sua dúvida ou solicitação..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">contato@ascalate.com.br</p>
                  <p className="text-gray-600">suporte@ascalate.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-gray-600">(11) 3456-7890</p>
                  <p className="text-gray-600">(11) 98765-4321</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-gray-600">
                    Av. Paulista, 1000<br />
                    São Paulo - SP<br />
                    CEP: 01310-100
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Horário de Atendimento</p>
                  <p className="text-gray-600">
                    Segunda a Sexta: 8h às 18h<br />
                    Sábado: 9h às 12h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canais de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Suporte Técnico</p>
                <p className="text-sm text-blue-700">
                  Para questões técnicas e problemas no sistema
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Suporte Comercial</p>
                <p className="text-sm text-green-700">
                  Para dúvidas sobre contratos e serviços
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-900">Emergências</p>
                <p className="text-sm text-orange-700">
                  Para situações urgentes fora do horário comercial
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientContact;
