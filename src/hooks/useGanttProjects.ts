
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GanttProject {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  created_by?: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  priority: string;
  budget?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGanttProjects = (clientId?: string) => {
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clientId) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // First get the user's company
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('company')
        .eq('id', clientId)
        .single();

      if (profile?.company) {
        // Get all company member IDs
        const { data: companyMembers } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('company', profile.company);

        const memberIds = companyMembers?.map(m => m.id) || [clientId];

        // Fetch projects for all company members
        const { data, error: fetchError } = await supabase
          .from('gantt_projects')
          .select('*')
          .eq('is_active', true)
          .in('client_id', memberIds)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setProjects(data || []);
      } else {
        // Fallback: just fetch for the user
        const { data, error: fetchError } = await supabase
          .from('gantt_projects')
          .select('*')
          .eq('is_active', true)
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching gantt projects:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<GanttProject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('gantt_projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating gantt project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<GanttProject>) => {
    try {
      const { data, error } = await supabase
        .from('gantt_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => prev.map(project => project.id === id ? data : project));
      return data;
    } catch (error) {
      console.error('Error updating gantt project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gantt_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (error) {
      console.error('Error deleting gantt project:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [clientId]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};
