
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-newsletter-signup', {
        body: { email, nome }
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você receberá nossas atualizações em breve.",
      });

      // Limpar o formulário
      setEmail('');
      setNome('');
    } catch (error) {
      console.error('Erro ao cadastrar email:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/b73f783c-4401-4f9e-abf0-f7119839392f.png" 
            alt="Ascalate Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#003366] mb-4">Mantenha-se Atualizado</h1>
          <p className="text-xl text-gray-600 mb-2">
            Receba conteúdos exclusivos sobre FP&A e insights do mercado
          </p>
          <p className="text-lg text-gray-500">
            Cadastre seu email e seja o primeiro a saber sobre novos eventos e materiais
          </p>
        </div>

        {/* Formulário de cadastro */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#003366]">Cadastre-se</CardTitle>
              <CardDescription className="text-center">
                Preencha os dados abaixo para receber nossas atualizações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="seu@email.com"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#f07c00] hover:bg-[#e56b00] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Quero receber atualizações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Benefícios */}
        <div className="max-w-2xl mx-auto mt-12">
          <h3 className="text-2xl font-semibold text-center text-[#003366] mb-6">
            O que você receberá:
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4">
              <div className="text-[#f07c00] text-3xl mb-2">📊</div>
              <h4 className="font-semibold mb-2">Insights Exclusivos</h4>
              <p className="text-gray-600">Análises e tendências do mercado FP&A</p>
            </div>
            <div className="text-center p-4">
              <div className="text-[#f07c00] text-3xl mb-2">🎯</div>
              <h4 className="font-semibold mb-2">Eventos Especiais</h4>
              <p className="text-gray-600">Acesso antecipado a workshops e palestras</p>
            </div>
            <div className="text-center p-4">
              <div className="text-[#f07c00] text-3xl mb-2">📚</div>
              <h4 className="font-semibold mb-2">Materiais Gratuitos</h4>
              <p className="text-gray-600">Templates, guias e recursos práticos</p>
            </div>
            <div className="text-center p-4">
              <div className="text-[#f07c00] text-3xl mb-2">🤝</div>
              <h4 className="font-semibold mb-2">Networking</h4>
              <p className="text-gray-600">Conecte-se com outros profissionais</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;
