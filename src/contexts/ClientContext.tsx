
import React, { createContext, useContext, useState } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  cnpj?: string;
  is_primary_contact?: boolean;
}

interface ClientContextType {
  client: Client | null;
  setClient: (client: Client | null) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);

  const value = {
    client,
    setClient,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};
