
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useClient } from './ClientContext';

const fetchClientProfile = async (userId: string) => {
  try {
    console.log('👤 Buscando perfil do cliente para userId:', userId);
    
    // First check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (adminData && !adminError) {
      console.log('✅ User is ADMIN - não deve estar na área do cliente:', adminData);
      // Redirect admin users to admin area
      if (window.location.pathname.startsWith('/cliente')) {
        console.log('🔄 Redirecionando admin para área administrativa');
        window.location.href = '/admin';
        return null;
      }
      return null; // Admin users don't need client profile
    }

    // If not admin, fetch client profile
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching client profile:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ No client profile found for non-admin user');
      return null;
    }

    console.log('✅ Found CLIENT profile:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in fetchClientProfile:', error);
    return null;
  }
};

export const AuthSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setSession, setLoading } = useUser();
  const { setClient } = useClient();

  useEffect(() => {
    console.log('🔄 Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('📡 Auth state change:', event, 'User ID:', session?.user?.id);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Check if this is an admin user and handle redirect
            const profile = await fetchClientProfile(session.user.id);
            setClient(profile);
          } else {
            setClient(null);
          }
        } catch (error) {
          console.error('❌ Error in auth state change handler:', error);
          setClient(null);
        } finally {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkInitialSession = async () => {
      try {
        console.log('🔍 Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
        console.log('🔍 Initial session check:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profile = await fetchClientProfile(session.user.id);
            setClient(profile);
          } catch (error) {
            console.error('❌ Error fetching profile in initial check:', error);
            setClient(null);
          }
        }
      } catch (error) {
        console.error('❌ Error in checkInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setClient, setLoading]);

  return <>{children}</>;
};
