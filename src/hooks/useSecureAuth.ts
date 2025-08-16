
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRole {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  company?: string;
}

export const useSecureAuth = () => {
  const [userRole, setUserRole] = useState<UserRole>({
    isAdmin: false,
    isSuperAdmin: false
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkUserRole = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setUserRole({ isAdmin: false, isSuperAdmin: false });
        setUser(null);
        return;
      }

      setUser(currentUser);

      // Use secure functions to check roles
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin_user_secure');

      const { data: isSuperAdmin, error: superAdminError } = await supabase
        .rpc('is_super_admin_secure');

      const { data: company, error: companyError } = await supabase
        .rpc('get_user_company');

      if (adminError || superAdminError || companyError) {
        console.error('Error checking user role:', { adminError, superAdminError, companyError });
      }

      setUserRole({
        isAdmin: Boolean(isAdmin),
        isSuperAdmin: Boolean(isSuperAdmin),
        company: company || undefined
      });

    } catch (error) {
      console.error('Error in checkUserRole:', error);
      setUserRole({ isAdmin: false, isSuperAdmin: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        checkUserRole();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const secureSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserRole({ isAdmin: false, isSuperAdmin: false });
      
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return {
    user,
    userRole,
    loading,
    secureSignOut,
    refreshUserRole: checkUserRole
  };
};
