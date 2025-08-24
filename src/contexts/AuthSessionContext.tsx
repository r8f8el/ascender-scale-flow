
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useClient } from './ClientContext';

const fetchClientProfile = async (userId: string) => {
  try {
    console.log('👤 Buscando perfil do cliente para userId:', userId);
    
    // First check if user is admin - if so, return null (admins don't need client profiles)
    const { data: adminData } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (adminData) {
      console.log('✅ User is ADMIN, skipping client profile');
      return null;
    }

    // Fetch client profile
    const { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (clientError) {
      console.error('❌ Error fetching client profile:', clientError);
      return null;
    }

    if (clientProfile) {
      console.log('✅ Found existing CLIENT profile:', clientProfile);
      return clientProfile;
    }

    // No profile found - create one
    console.log('⚠️ No client profile found, creating basic profile');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      console.error('❌ No user email found for profile creation');
      return null;
    }

    const { data: newProfile, error: createError } = await supabase
      .from('client_profiles')
      .insert({
        id: userId,
        name: user.email.split('@')[0],
        email: user.email,
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
