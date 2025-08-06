
import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Bell, User, LogOut } from 'lucide-react';

const AdminHeader = () => {
  const { admin, adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
  };

  return (
    <header className="bg-white border-b shadow-sm px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Painel Administrativo
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} />
            <span>{admin?.name}</span>
          </div>
          
          <Button variant="outline" size="sm">
            <Bell size={16} />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut size={16} />
            <span className="ml-1">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
