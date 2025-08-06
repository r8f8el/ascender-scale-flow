
import React from 'react';
import { LogOut, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/NotificationCenter';
import { Logo } from '@/components/Logo';

interface ClientHeaderProps {
  clientName?: string;
  isMobile: boolean;
  onLogout: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ 
  clientName, 
  isMobile, 
  onLogout 
}) => {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Center */}
            <NotificationCenter />
            
            {/* User Info */}
            <div className="hidden md:flex items-center gap-2">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {clientName || 'Cliente'}
                </div>
                <div className="text-gray-500">Área do Cliente</div>
              </div>
            </div>

            {/* Logout Button */}
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
