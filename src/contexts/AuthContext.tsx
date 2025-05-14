
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  client: Client | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  client: null,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mock clients database - in a real app, this would be fetched from a server
const mockClients = [
  { id: '1', name: 'Portobello', email: 'cliente@portobello.com.br', password: 'portobello123' },
  { id: '2', name: 'J.Assy', email: 'cliente@jassy.com.br', password: 'jassy123' },
];

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  
  // Check if there's a stored session on component mount
  useEffect(() => {
    const storedClient = localStorage.getItem('ascalate_client');
    if (storedClient) {
      const parsedClient = JSON.parse(storedClient);
      setClient(parsedClient);
      setIsAuthenticated(true);
    }
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call
    const foundClient = mockClients.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );
    
    if (foundClient) {
      const { password: _, ...clientWithoutPassword } = foundClient;
      setClient(clientWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('ascalate_client', JSON.stringify(clientWithoutPassword));
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    setClient(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ascalate_client');
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, client, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
