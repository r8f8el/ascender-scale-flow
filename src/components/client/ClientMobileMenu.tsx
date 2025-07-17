
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { File, MessageSquare, Calendar, Mail, Users, User, LogOut } from 'lucide-react';
import { SheetContent } from '@/components/ui/sheet';

interface MobileNavLinkProps {
  to: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, children, icon }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-2 px-2 py-3 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`
    }
  >
    {icon}
    <span>{children}</span>
  </RouterNavLink>
);

interface ClientMobileMenuProps {
  clientName?: string;
  onLogout: () => void;
}

export const ClientMobileMenu: React.FC<ClientMobileMenuProps> = ({ 
  clientName, 
  onLogout 
}) => {
  return (
    <SheetContent side="right">
      <div className="flex flex-col gap-8 mt-8">
        <div className="flex items-center gap-2">
          <User size={16} />
          <span className="font-medium">{clientName}</span>
        </div>
        
        <nav className="flex flex-col gap-4">
          <MobileNavLink to="/cliente" icon={<File size={20} />}>
            Dashboard
          </MobileNavLink>
          <MobileNavLink to="/cliente/equipe" icon={<Users size={20} />}>
            Equipe
          </MobileNavLink>
          <MobileNavLink to="/cliente/chamados" icon={<MessageSquare size={20} />}>
            Chamados
          </MobileNavLink>
          <MobileNavLink to="/cliente/cronograma" icon={<Calendar size={20} />}>
            Cronograma
          </MobileNavLink>
          <MobileNavLink to="/cliente/contato" icon={<Mail size={20} />}>
            Contato
          </MobileNavLink>
        </nav>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors mt-4"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </SheetContent>
  );
};
