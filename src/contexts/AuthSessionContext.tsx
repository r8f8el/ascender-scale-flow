
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useClient } from './ClientContext';

const fetchClientProfile = async (userId: string) => {
  try {
    console.log('👤 Buscando perfil do cliente para userId:', userId);
    
    // Check if user is admin first using RPC call
    const { data: adminData, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (adminError) {
      console.error('❌ Error checking admin profile:', adminError);
    }

    if (adminData) {
      console.log('✅ User is ADMIN, redirecting to admin area');
      // If accessing client area, redirect to admin area
      if (window.location.pathname.startsWith('/cliente')) {
        window.location.href = '/admin';
        return null;
      }
      return null;
    }

    // Use RPC function to bypass RLS issues
    console.log('🔍 Executando RPC get_client_profile_bypass para userId:', userId);
    const { data: clientProfile, error: clientError } = await supabase.rpc(
      'get_client_profile_bypass', 
      { p_user_id: userId }
    );

    console.log('🔍 Resultado RPC query:', { clientProfile, clientError });

    if (clientError) {
      console.error('❌ RPC Error:', clientError);
      throw clientError;
    }

    if (clientProfile && clientProfile.id) {
      console.log('✅ Found existing CLIENT profile via RPC:', clientProfile);
      return clientProfile;
    }

    // Fallback to regular query if RPC fails
    console.log('🔄 Fallback: Tentando query direta client_profiles');
    const { data: directProfile, error: directError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('🔍 Resultado query direta:', { directProfile, directError });

    if (directError) {
      console.error('❌ Direct query error:', directError);
      throw directError;
    }

    if (directProfile) {
      console.log('✅ Found CLIENT profile via direct query:', directProfile);
      return directProfile;
    }

    console.log('⚠️ No client profile found for user:', userId);
    return null;
    
  } catch (error) {
    console.error('❌ Exception in fetchClientProfile:', error);
    throw error; // Re-throw to be caught by caller
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
                // Don't clear user session on profile error - set client to null but keep user
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
            console.log('⏱️ Setting loading to false');
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
          setSession(null);
          setUser(null);
          setClient(null);
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
        setSession(null);
        setUser(null);
        setClient(null);
      } finally {
        setTimeout(() => {
          console.log('⏱️ Initial session check complete, setting loading to false');
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
