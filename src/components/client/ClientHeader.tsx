
import React from 'react';
import { LogOut, Menu, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { AvatarInitials } from '@/components/ui/avatar-initials';
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Logo className="h-8 w-auto" />
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-2">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    <AvatarInitials name={clientName || 'Cliente'} />
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {clientName || 'Cliente'}
                  </div>
                  <div className="text-xs text-muted-foreground">Área do Cliente</div>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationCenter />

            {/* Settings */}
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configurações</span>
            </Button>

            {/* Logout Button */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-9 px-3 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
