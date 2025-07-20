
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

  const currentClient = clients.find(client => {
    return client.client_profile?.id === user?.id;
  }) as CurrentFPAClient | undefined;

  return {
    currentClient,
    isLoading,
    error,
    hasClient: !!currentClient,
    isOnboardingComplete: currentClient?.onboarding_completed ?? false
  };
};
