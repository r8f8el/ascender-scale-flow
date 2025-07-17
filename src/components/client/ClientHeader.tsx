
import React from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, User } from 'lucide-react';
import { Logo } from '../Logo';
import { ClientMobileMenu } from './ClientMobileMenu';

interface Client {
  name: string;
}

interface ClientHeaderProps {
  client: Client | null;
  isMobile: boolean;
  onLogout: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ 
  client, 
  isMobile, 
  onLogout 
}) => {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo className="h-10 w-auto" />
          <span className="text-xl font-semibold hidden sm:inline">Área do Cliente</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span>{client?.name}</span>
            </div>
          </div>
          
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <ClientMobileMenu 
                  client={client} 
                  onLogout={onLogout} 
                />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};
