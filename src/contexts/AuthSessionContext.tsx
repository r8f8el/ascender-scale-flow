
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
      console.log('✅ User is ADMIN:', adminData);
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
      console.log('⚠️ No client profile found, creating basic client profile');
      // Create a basic client profile if none exists
      const userEmail = supabase.auth.getUser().then(({ data }) => data.user?.email);
      if (userEmail) {
        const email = await userEmail;
        if (email) {
          const { data: newProfile, error: createError } = await supabase
            .from('client_profiles')
            .insert({
              id: userId,
              name: email.split('@')[0],
              email: email,
              is_primary_contact: true
            })
            .select()
            .maybeSingle();

          if (createError) {
            console.error('❌ Error creating client profile:', createError);
            return null;
          }

          console.log('✅ Created new CLIENT profile:', newProfile);
          return newProfile;
        }
      }
      return null;
    }

    console.log('✅ Found existing CLIENT profile:', data);
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
            // Use setTimeout to prevent blocking the auth state change
            setTimeout(async () => {
              try {
                const profile = await fetchClientProfile(session.user.id);
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
