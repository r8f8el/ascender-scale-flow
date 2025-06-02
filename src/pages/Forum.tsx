
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Forum = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    email: ''
  });
  const [newsletterData, setNewsletterData] = useState({
    nome: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewsletterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-forum-registration', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Inscrição enviada com sucesso!",
        description: "Recebemos sua inscrição e entraremos em contato em breve.",
      });

      // Limpar o formulário
      setFormData({ nome: '', cargo: '', email: '' });
    } catch (error) {
      console.error('Erro ao enviar inscrição:', error);
      toast({
        title: "Erro ao enviar inscrição",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewsletterLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-newsletter-signup', {
        body: newsletterData
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você receberá nossas atualizações em breve.",
      });

      // Limpar o formulário
      setNewsletterData({ nome: '', email: '' });
    } catch (error) {
      console.error('Erro ao cadastrar email:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsNewsletterLoading(false);
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

        {/* Imagem do evento */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/Capturar.PNG" 
            alt="Fórum FPA Brasil - Além dos Números" 
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Informações do evento */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#003366] mb-2">FÓRUM FPA BRASIL</h1>
          <p className="text-2xl text-[#f07c00] font-semibold mb-4">ALÉM DOS NÚMEROS</p>
          <p className="text-lg mb-2">A transformação do FP&A começa pelas pessoas.</p>
          <p className="text-lg mb-4">Mindset ágil, comportamento estratégico e liderança humana em tempos de IA.</p>
          <div className="text-lg">
            <p><strong>Data:</strong> 13 e 14 de Junho</p>
            <p><strong>Local:</strong> Meliá Higienópolis - São Paulo</p>
          </div>
        </div>

        {/* Aviso de vagas */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#003366] text-white px-6 py-4 rounded-lg">
            <div className="text-3xl font-bold text-[#f07c00] mb-2">70%</div>
            <div className="text-lg font-semibold">Vagas preenchidas!</div>
            <div className="text-lg">Garanta seu lugar!</div>
          </div>
        </div>

        {/* Dois formulários lado a lado */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Formulário de inscrição no evento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#003366]">Inscrição no Evento</CardTitle>
              <CardDescription className="text-center">
                Preencha os dados abaixo para garantir sua vaga no evento
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
                  />
                </div>

                <div>
                  <Label htmlFor="cargo">Cargo na Empresa</Label>
                  <Input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Corporativo</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#28a745] hover:bg-[#218838] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Garantir minha vaga'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Formulário de cadastro para atualizações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-[#003366]">Receba Atualizações</CardTitle>
              <CardDescription className="text-center">
                Cadastre seu email para receber conteúdos exclusivos e novidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newsletter-nome">Nome</Label>
                  <Input
                    type="text"
                    id="newsletter-nome"
                    name="nome"
                    value={newsletterData.nome}
                    onChange={handleNewsletterChange}
                    required
                    className="mt-1"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="newsletter-email">Email</Label>
                  <Input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    value={newsletterData.email}
                    onChange={handleNewsletterChange}
                    required
                    className="mt-1"
                    placeholder="seu@email.com"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#f07c00] hover:bg-[#e56b00] text-white"
                  disabled={isNewsletterLoading}
                >
                  {isNewsletterLoading ? 'Cadastrando...' : 'Quero receber atualizações'}
                </Button>
              </form>

              {/* Benefícios do cadastro */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-center">O que você receberá:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-[#f07c00] mr-2">📊</span>
                    <span>Insights exclusivos sobre FP&A</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#f07c00] mr-2">🎯</span>
                    <span>Convites para eventos especiais</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#f07c00] mr-2">📚</span>
                    <span>Materiais gratuitos e templates</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#f07c00] mr-2">🤝</span>
                    <span>Oportunidades de networking</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empresas parceiras */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-4">Empresas parceiras:</h3>
          <p className="text-gray-600">Logos das empresas parceiras podem ser inseridos aqui.</p>
        </div>
      </div>
    </div>
  );
};

export default Forum;
