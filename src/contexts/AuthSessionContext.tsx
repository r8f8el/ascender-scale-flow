
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useClient } from './ClientContext';

const fetchClientProfile = async (userId: string) => {
  try {
    console.log('👤 Buscando perfil do cliente para userId:', userId);
    
    // First check if user is admin - if so, return null (admins don't need client profiles)
    console.log('🔍 Verificando se é admin...');
    const { data: adminData, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    console.log('🔍 Resultado admin check:', { adminData, adminError });

    if (adminData) {
      console.log('✅ User is ADMIN, skipping client profile');
      return null;
    }

    console.log('🔍 User is not admin, fetching client profile...');

    // Fetch client profile - with better error handling
    console.log('🔍 Executando query client_profiles para userId:', userId);
    const { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('🔍 Resultado client_profiles query:', { clientProfile, clientError });

    // If there's an error but it's not a "not found" error, return null but don't fail
    if (clientError && clientError.code !== 'PGRST116') {
      console.error('❌ Error fetching client profile:', clientError);
      // Don't return null immediately - maybe we can still work without the profile
      return null;
    }

    if (clientProfile) {
      console.log('✅ Found existing CLIENT profile:', clientProfile);
      return clientProfile;
    }

    // If no profile found, that's okay - return null without trying to create
    // This prevents authentication loops
    console.log('⚠️ No client profile found for user:', userId, '- this is OK, user can still be authenticated');
    return null;
    
  } catch (error) {
    console.error('❌ Exception in fetchClientProfile:', error);
    // Don't let profile fetching errors break authentication
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
            // Use setTimeout to prevent blocking the auth state change
            setTimeout(async () => {
              try {
                console.log('⏱️ Fetching profile in timeout for user:', session.user.id);
                const profile = await fetchClientProfile(session.user.id);
                console.log('⏱️ Profile fetch result:', profile ? 'SUCCESS' : 'NULL');
                setClient(profile);
              } catch (error) {
                console.error('❌ Error fetching profile in timeout:', error);
                setClient(null);
              }
            }, 0);
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
        } else {
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
