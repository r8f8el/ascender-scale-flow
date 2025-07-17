
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut } from 'lucide-react';
import { Logo } from '../Logo';

interface AdminHeaderProps {
  admin?: { name: string; email: string };
  onLogout: () => void;
  onSidebarToggle: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  admin, 
  onLogout,
  onSidebarToggle
}) => {
  return (
    <header className="bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-40 h-16">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <Menu size={24} />
          </Button>
          <Logo className="h-8 w-auto" />
          <span className="text-xl font-semibold hidden sm:inline">Painel Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <User size={16} />
            <span>{admin?.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};
