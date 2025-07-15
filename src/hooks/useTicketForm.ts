
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, client } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [files, setFiles] = useState<File[]>([]);
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

      // Pre-fill form with user data if available
      if (client) {
        setFormData(prev => ({
          ...prev,
          user_name: client.name || '',
          user_email: client.email || '',
        }));
      } else if (user) {
        setFormData(prev => ({
          ...prev,
          user_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          user_email: user.email || '',
        }));
      }
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
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Iniciando criação do chamado...');
      console.log('Usuário logado:', user);
      console.log('Cliente:', client);
      console.log('Dados do formulário:', formData);

      // Validar campos obrigatórios
      if (!formData.user_name || !formData.user_email || !formData.user_phone || 
          !formData.title || !formData.description || !formData.category_id || !formData.priority_id) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      // Preparar dados do ticket com informações do usuário logado
      const ticketData = {
        ...formData,
        user_id: user?.id || null, // Associar ao usuário do Supabase se disponível
      };

      console.log('Dados do ticket preparados:', ticketData);

      // Preparar dados para envio
      let requestBody;
      let requestOptions: any = {};

      if (files.length > 0) {
        // Se há arquivos, usar FormData
        const formData = new FormData();
        
        // Adicionar dados do ticket
        Object.entries(ticketData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        // Adicionar arquivos
        files.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
        formData.append('file_count', files.length.toString());
        
        requestBody = formData;
      } else {
        // Se não há arquivos, usar JSON
        requestBody = ticketData;
      }

      // Chamar a Edge Function para processar o chamado
      const { data, error } = await supabase.functions.invoke('process-ticket', {
        body: requestBody
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
      setFiles([]);

      // Recarregar dados do usuário se necessário
      if (client) {
        setFormData(prev => ({
          ...prev,
          user_name: client.name || '',
          user_email: client.email || '',
        }));
      } else if (user) {
        setFormData(prev => ({
          ...prev,
          user_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          user_email: user.email || '',
        }));
      }

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
    files,
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
