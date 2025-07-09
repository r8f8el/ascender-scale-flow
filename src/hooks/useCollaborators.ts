import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Collaborator, CollaboratorFormData } from '@/types/collaborator';

export const useCollaborators = () => {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('name');

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCollaborator = async (formData: CollaboratorFormData, editingCollaborator: Collaborator | null) => {
    try {
      if (editingCollaborator) {
        const { error } = await supabase
          .from('collaborators')
          .update(formData)
          .eq('id', editingCollaborator.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Colaborador atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('collaborators')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Colaborador criado com sucesso!"
        });
      }

      loadCollaborators();
      return true;
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar colaborador.",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleCollaboratorStatus = async (collaborator: Collaborator) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .update({ is_active: !collaborator.is_active })
        .eq('id', collaborator.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Colaborador ${!collaborator.is_active ? 'ativado' : 'desativado'} com sucesso!`
      });

      loadCollaborators();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do colaborador.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, []);

  return {
    collaborators,
    isLoading,
    loadCollaborators,
    saveCollaborator,
    toggleCollaboratorStatus
  };
};