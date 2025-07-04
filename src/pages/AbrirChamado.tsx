
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Paperclip, Phone } from 'lucide-react';

const AbrirChamado = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    title: '',
    description: '',
    category_id: '',
    priority_id: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [categoriesRes, prioritiesRes] = await Promise.all([
        supabase.from('ticket_categories').select('*'),
        supabase.from('ticket_priorities').select('*').order('level')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (prioritiesRes.data) setPriorities(prioritiesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Iniciando criação do chamado via Edge Function...');
      console.log('Dados do formulário:', formData);

      // Validar campos obrigatórios
      if (!formData.user_name || !formData.user_email || !formData.user_phone || 
          !formData.title || !formData.description || !formData.category_id || !formData.priority_id) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      // Chamar a Edge Function para processar o chamado
      const { data, error } = await supabase.functions.invoke('process-ticket', {
        body: formData
      });

      if (error) {
        console.error('Erro da Edge Function:', error);
        throw new Error(error.message || 'Erro ao processar chamado');
      }

      if (!data.success) {
        console.error('Resposta de erro da Edge Function:', data);
        throw new Error(data.error || 'Erro desconhecido ao processar chamado');
      }

      console.log('Chamado processado com sucesso:', data);

      toast({
        title: "Chamado criado com sucesso!",
        description: `Seu chamado foi aberto com o número ${data.ticket.ticket_number}. Você receberá um email de confirmação em breve.`,
      });

      // Limpar formulário
      setFormData({
        user_name: '',
        user_email: '',
        user_phone: '',
        title: '',
        description: '',
        category_id: '',
        priority_id: ''
      });
      setFile(null);

    } catch (error: any) {
      console.error('Erro completo ao criar chamado:', error);
      toast({
        title: "Erro ao criar chamado",
        description: error.message || "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#003366] mb-4">Abrir Chamado de Suporte</h1>
          <p className="text-lg text-gray-600">
            Precisa de ajuda? Abra um chamado e nossa equipe entrará em contato em breve.
          </p>
        </div>

        {/* Formulário */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003366]">Dados do Chamado</CardTitle>
              <CardDescription>
                Preencha todas as informações para que possamos ajudá-lo da melhor forma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user_name">Nome Completo *</Label>
                    <Input
                      id="user_name"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_email">Email para Contato *</Label>
                    <Input
                      type="email"
                      id="user_email"
                      name="user_email"
                      value={formData.user_email}
                      onChange={handleInputChange}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="user_phone">Telefone (com WhatsApp) *</Label>
                  <Input
                    type="tel"
                    id="user_phone"
                    name="user_phone"
                    value={formData.user_phone}
                    onChange={handleInputChange}
                    required
                    placeholder="(11) 99999-9999"
                  />
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span>Ao preencher, você concorda em receber notificações sobre seu chamado via SMS ou WhatsApp.</span>
                  </div>
                </div>

                {/* Detalhes do Chamado */}
                <div>
                  <Label htmlFor="title">Título do Chamado *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Resumo do seu problema ou solicitação"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Descreva detalhadamente seu problema ou solicitação..."
                  />
                </div>

                {/* Categoria e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria do Chamado *</Label>
                    <Select onValueChange={(value) => handleSelectChange('category_id', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nível de Prioridade *</Label>
                    <Select onValueChange={(value) => handleSelectChange('priority_id', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.id} value={priority.id}>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: priority.color }}
                              />
                              {priority.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Anexo */}
                <div>
                  <Label htmlFor="file">Anexar Arquivos (opcional)</Label>
                  <div className="mt-1">
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4 file:rounded-md
                        file:border-0 file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  {file && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <Paperclip size={16} className="mr-1" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#f07c00] hover:bg-[#e56b00] text-white text-lg py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando Chamado...' : 'Abrir Chamado'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AbrirChamado;
