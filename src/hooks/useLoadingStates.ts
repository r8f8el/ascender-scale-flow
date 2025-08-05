
import { useState } from 'react';

export interface LoadingStates {
  projects: boolean;
  files: boolean;
  reports: boolean;
  notifications: boolean;
  stats: boolean;
  tickets: boolean;
}

export const useLoadingStates = () => {
  const [states, setStates] = useState<LoadingStates>({
    projects: false,
    files: false,
    reports: false,
    notifications: false,
    stats: false,
    tickets: false
  });

  const setLoading = (key: keyof LoadingStates, value: boolean) => {
    setStates(prev => ({ ...prev, [key]: value }));
  };

  const setAllLoading = (value: boolean) => {
    setStates(prev => Object.keys(prev).reduce((acc, key) => {
      acc[key as keyof LoadingStates] = value;
      return acc;
    }, {} as LoadingStates));
  };

  const isAnyLoading = Object.values(states).some(state => state);

  return { 
    states, 
    setLoading, 
    setAllLoading, 
    isAnyLoading 
  };
};
