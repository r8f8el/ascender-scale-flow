
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from './useFPAClients';

export interface CurrentFPAClient {
  id: string;
  company_name: string;
  client_profile_id: string;
  onboarding_completed: boolean;
  current_phase: number;
  industry?: string;
  business_model?: string;
  strategic_objectives?: string;
  created_at: string;
  updated_at: string;
  client_profile: {
    id: string;
    name: string;
    email: string;
    company: string;
  };
}

export const useCurrentFPAClient = () => {
  const { user } = useAuth();
  const { data: clients = [], isLoading, error } = useFPAClients();

  // Type guard to ensure client_profile exists and has required properties
  const isValidFPAClient = (client: any): client is CurrentFPAClient => {
    return client && 
           client.client_profile && 
           typeof client.client_profile === 'object' &&
           'id' in client.client_profile &&
           'name' in client.client_profile &&
           'email' in client.client_profile;
  };

  const currentClient = clients.find(client => {
    if (!isValidFPAClient(client) || !user?.id) {
      return false;
    }
    return client.client_profile.id === user.id;
  });

  return {
    currentClient: currentClient as CurrentFPAClient | undefined,
    isLoading,
    error,
    hasClient: !!currentClient,
    isOnboardingComplete: currentClient?.onboarding_completed ?? false
  };
};
