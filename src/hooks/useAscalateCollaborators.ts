
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Collaborator } from '@/types/collaborator';

export const useAscalateCollaborators = () => {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAscalateCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .like('email', '%@ascalate.com.br')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Erro ao carregar colaboradores Ascalate:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAscalateCollaborators();
  }, []);

  return {
    collaborators,
    isLoading,
    refreshCollaborators: loadAscalateCollaborators
  };
};
