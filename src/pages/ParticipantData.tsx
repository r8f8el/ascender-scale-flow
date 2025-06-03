
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ParticipantData = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-participant-data', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Dados enviados com sucesso!",
        description: "Recebemos seus dados e você receberá os arquivos em breve.",
      });

      // Limpar o formulário
      setFormData({ nome: '', email: '', telefone: '', empresa: '', cargo: '' });
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast({
        title: "Erro ao enviar dados",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header com logo */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/b73f783c-4401-4f9e-abf0-f7119839392f.png" 
            alt="Ascalate Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Título da página */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#003366] mb-4">Dados do Participante</h1>
          <p className="text-lg text-gray-600 mb-2">Preencha seus dados para receber os arquivos</p>
          <p className="text-sm text-gray-500">Enviaremos os materiais para o seu email</p>
        </div>

        {/* Formulário centralizado */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#003366]">Seus Dados</CardTitle>
              <CardDescription className="text-center">
                Preencha as informações abaixo para receber os arquivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    type="text"
                    id="empresa"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Nome da sua empresa"
                  />
                </div>

                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Seu cargo na empresa"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#f07c00] hover:bg-[#e56b00] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar dados para receber arquivos'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParticipantData;
