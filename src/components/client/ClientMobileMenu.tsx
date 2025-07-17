
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { File, MessageSquare, Calendar, Mail, Users, CheckSquare, LogOut, User } from 'lucide-react';

interface Client {
  name: string;
}

interface ClientMobileMenuProps {
  client: Client | null;
  onLogout: () => void;
}

const navigationItems = [
  { to: "/cliente", icon: <File size={20} />, label: "Dashboard" },
  { to: "/cliente/equipe", icon: <Users size={20} />, label: "Equipe" },
  { to: "/cliente/chamados", icon: <MessageSquare size={20} />, label: "Chamados" },
  { to: "/cliente/aprovacoes", icon: <CheckSquare size={20} />, label: "Aprovações" },
  { to: "/cliente/cronograma", icon: <Calendar size={20} />, label: "Cronograma" },
  { to: "/cliente/contato", icon: <Mail size={20} />, label: "Contato" },
];

const MobileNavLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) => (
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

export const ClientMobileMenu: React.FC<ClientMobileMenuProps> = ({ client, onLogout }) => {
  return (
    <div className="flex flex-col gap-8 mt-8">
      <div className="flex items-center gap-2">
        <User size={16} />
        <span className="font-medium">{client?.name}</span>
      </div>
      
      <nav className="flex flex-col gap-4">
        {navigationItems.map((item) => (
          <MobileNavLink key={item.to} to={item.to} icon={item.icon}>
            {item.label}
          </MobileNavLink>
        ))}
      </nav>
      
      <button 
        onClick={onLogout}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors mt-4"
      >
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </div>
  );
};
