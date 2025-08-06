
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';

const ClientContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  console.log('📞 ClientContact: Componente carregado');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📧 Enviando mensagem:', formData);
    toast.success('Mensagem enviada com sucesso! Retornaremos em breve.');
    
    // Limpar formulário
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Entre em Contato</h1>
        <p className="text-gray-600 mt-1">
          Estamos aqui para ajudar. Entre em contato conosco através dos canais abaixo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informações de Contato */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">contato@ascalate.com.br</p>
                  <p className="text-gray-600">suporte@ascalate.com.br</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Telefone</h3>
                  <p className="text-gray-600">(11) 3456-7890</p>
                  <p className="text-gray-600">(11) 99999-0000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Endereço</h3>
                  <p className="text-gray-600">
                    Rua Example, 123<br />
                    São Paulo, SP - 01234-567
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Horário de Atendimento</h3>
                  <p className="text-gray-600">
                    Segunda a Sexta: 8h às 18h<br />
                    Sábado: 9h às 12h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canais de Atendimento Rápido */}
          <Card>
            <CardHeader>
              <CardTitle>Atendimento Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Button className="justify-start h-auto p-4" variant="outline">
                  <MessageSquare className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Chat Online</p>
                    <p className="text-sm text-gray-600">Resposta imediata</p>
                  </div>
                </Button>

                <Button className="justify-start h-auto p-4" variant="outline">
                  <Phone className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-gray-600">(11) 99999-0000</p>
                  </div>
                </Button>

                <Button className="justify-start h-auto p-4" variant="outline">
                  <Mail className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Suporte Técnico</p>
                    <p className="text-sm text-gray-600">suporte@ascalate.com.br</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Envie sua Mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="Assunto da sua mensagem"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Digite sua mensagem aqui..."
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientContact;
