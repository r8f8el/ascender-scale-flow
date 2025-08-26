
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAccountMigration = () => {
  return useQuery({
    queryKey: ['account-migration'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log('🔄 Verificando se conta precisa de migração:', user.id);

      // Buscar perfil atual
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log('❌ Perfil não encontrado');
        return null;
      }

      // Se já tem empresa, não precisa migrar
      if (profile.company) {
        console.log('✅ Conta já tem empresa:', profile.company);
        return { migrated: false, company: profile.company };
      }

      // Migrar conta existente
      console.log('🔄 Migrando conta existente...');
      
      let companyName = profile.name?.trim();
      if (!companyName) {
        const emailParts = profile.email.split('@')[0];
        companyName = emailParts.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      }

      try {
        const { error } = await supabase
          .from('client_profiles')
          .update({
            company: companyName,
            is_primary_contact: true
          })
          .eq('id', user.id);

        if (error) {
          console.error('❌ Erro na migração:', error);
          toast.error('Erro ao configurar conta');
          return null;
        }

        console.log('✅ Conta migrada com sucesso para empresa:', companyName);
        toast.success('Conta configurada com sucesso!');
        
        return { migrated: true, company: companyName };
      } catch (error) {
        console.error('❌ Erro na migração:', error);
        return null;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};
