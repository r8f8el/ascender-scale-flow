
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  admin: Admin | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  admin: null,
  adminLogin: async () => false,
  adminLogout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

// Mock admins database - in a real app, this would be fetched from a server
const mockAdmins = [
  { 
    id: '1', 
    name: 'Admin Ascalate', 
    email: 'admin@ascalate.com.br', 
    password: 'admin123',
    role: 'super_admin' as const
  },
  { 
    id: '2', 
    name: 'Consultor Ascalate', 
    email: 'consultor@ascalate.com.br', 
    password: 'consultor123',
    role: 'admin' as const
  },
];

const AdminAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  
  // Check if there's a stored admin session on component mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem('ascalate_admin');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdmin(parsedAdmin);
        setIsAdminAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        localStorage.removeItem('ascalate_admin');
      }
    }
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      const foundAdmin = mockAdmins.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );
      
      if (foundAdmin) {
        const { password: _, ...adminWithoutPassword } = foundAdmin;
        setAdmin(adminWithoutPassword);
        setIsAdminAuthenticated(true);
        localStorage.setItem('ascalate_admin', JSON.stringify(adminWithoutPassword));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const adminLogout = () => {
    setAdmin(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('ascalate_admin');
  };
  
  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdminAuthenticated, 
        admin, 
        adminLogin, 
        adminLogout 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
