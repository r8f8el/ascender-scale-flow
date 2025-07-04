
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
}

const initialFormData: FormData = {
  user_name: '',
  user_email: '',
  user_phone: '',
  title: '',
  description: '',
  category_id: '',
  priority_id: ''
};

export const useTicketForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const { toast } = useToast();

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
      setFormData(initialFormData);
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

  return {
    formData,
    file,
    isLoading,
    categories,
    priorities,
    loadFormData,
    handleInputChange,
    handleSelectChange,
    handleFileChange,
    handleSubmit
  };
};
