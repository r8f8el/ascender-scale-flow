
import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { AvatarInitials } from '@/components/ui/avatar-initials';

const AdminHeader = () => {
  const { admin, adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <div>
              <h1 className="text-lg font-semibold">
                Painel Administrativo
              </h1>
            </div>
          </div>
        </div>
        
        <div className="ml-auto flex items-center space-x-2">
          {/* Admin Info */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  <AvatarInitials name={admin?.name || 'Admin'} />
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="text-sm font-medium">{admin?.name}</div>
                <div className="text-xs text-muted-foreground">Administrador</div>
              </div>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificações</span>
          </Button>
          
          {/* Settings */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Configurações</span>
          </Button>
          
          {/* Logout */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-9 px-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
