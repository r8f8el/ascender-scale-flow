
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTicketNotifications } from './useTicketNotifications';

interface FormData {
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface Priority {
  id: string;
  name: string;
  color: string;
  urgency_level: number;
}

export const useTicketForm = () => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const { notifyNewTicket } = useTicketNotifications();
  
  const [formData, setFormData] = useState<FormData>({
    user_name: '',
    user_email: '',
    user_phone: '',
    title: '',
    description: '',
    category_id: '',
    priority_id: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);

  const loadFormData = useCallback(async () => {
    if (client) {
      setFormData(prev => ({
        ...prev,
        user_name: client.name || '',
        user_email: client.email || '',
        user_phone: client.company || '' // Using company field for phone since phone doesn't exist
      }));
    }

    try {
      const [categoriesRes, prioritiesRes] = await Promise.all([
        supabase.from('ticket_categories').select('*').order('name'),
        supabase.from('ticket_priorities').select('*').order('urgency_level')
      ]);

      if (categoriesRes.data) {
        const categoriesWithColor = categoriesRes.data.map(cat => ({
          ...cat,
          color: cat.color || '#3B82F6' // Default color if not set
        }));
        setCategories(categoriesWithColor);
      }
      
      if (prioritiesRes.data) {
        const prioritiesWithUrgency = prioritiesRes.data.map(priority => ({
          ...priority,
          urgency_level: priority.level || priority.urgency_level || 1
        }));
        setPriorities(prioritiesWithUrgency);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  }, [client]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TK-${timestamp.slice(-6)}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const { data: statusData } = await supabase
        .from('ticket_statuses')
        .select('id')
        .eq('name', 'Novo')
        .single();

      const ticketNumber = generateTicketNumber();

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          ...formData,
          ticket_number: ticketNumber,
          status_id: statusData?.id,
          user_id: client?.id
        })
        .select('*, ticket_priorities(name)')
        .single();

      if (ticketError) throw ticketError;

      // Upload de arquivos se houver
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileName = `${ticket.id}/${Date.now()}_${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('ticket-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          return supabase
            .from('ticket_attachments')
            .insert({
              ticket_id: ticket.id,
              filename: file.name,
              file_path: fileName,
              file_size: file.size,
              content_type: file.type
            });
        });

        await Promise.all(uploadPromises);
      }

      // Notificar equipe Ascalate sobre o novo chamado
      await notifyNewTicket.mutateAsync({
        ticketNumber: ticket.ticket_number,
        title: ticket.title,
        userName: ticket.user_name,
        userEmail: ticket.user_email,
        priority: ticket.ticket_priorities?.name || 'Não definida'
      });

      toast.success('Chamado criado com sucesso!');
      navigate('/cliente/chamados');
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erro ao criar chamado. Tente novamente.');
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
