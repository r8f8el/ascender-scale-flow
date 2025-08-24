
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useClient } from './ClientContext';

const fetchClientProfile = async (userId: string) => {
  try {
    console.log('👤 Buscando perfil do cliente para userId:', userId);
    
    // Simplified approach - just check if client profile exists without RLS complications
    console.log('🔍 Executando query client_profiles para userId:', userId);
    const { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('🔍 Resultado client_profiles query:', { clientProfile, clientError });

    if (clientProfile) {
      console.log('✅ Found existing CLIENT profile:', clientProfile);
      return clientProfile;
    }

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
            console.log('✅ User authenticated, setting profile fetch timeout');
            // Defer profile fetching to prevent auth interference
            setTimeout(async () => {
              try {
                console.log('⏱️ Fetching profile in timeout for user:', session.user.id);
                const profile = await fetchClientProfile(session.user.id);
                console.log('⏱️ Profile fetch result:', profile ? 'SUCCESS' : 'NULL');
                setClient(profile);
              } catch (error) {
                console.error('❌ Error fetching profile in timeout:', error);
                // Don't clear user session on profile error
                setClient(null);
              }
            }, 500); // Longer delay to ensure auth is stable
          } else {
            console.log('❌ No user in session, clearing client');
            setClient(null);
          }
        } catch (error) {
          console.error('❌ Error in auth state change handler:', error);
          setClient(null);
        } finally {
          // Only set loading to false after auth state is processed
          setTimeout(() => {
            setLoading(false);
          }, 200);
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
        setTimeout(() => {
          setLoading(false);
        }, 200);
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
