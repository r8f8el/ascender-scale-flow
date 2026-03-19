
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DocumentCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  created_at: string;
}

export const useDocumentCategories = () => {
  return useQuery({
    queryKey: ['document-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching document categories:', error);
        throw error;
      }
      
      // Map data ensuring icon field has a default
      return (data || []).map(cat => ({
        ...cat,
        icon: (cat as any).icon || 'FileText',
      })) as DocumentCategory[];
    }
  });
};
