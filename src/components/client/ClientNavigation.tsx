
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { File, MessageSquare, Calendar, Mail, Users } from 'lucide-react';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
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

export const ClientNavigation: React.FC = () => {
  return (
    <div className="space-y-1">
      <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider mb-4">
        Menu
      </h3>
      <NavLink to="/cliente" icon={<File size={20} />}>
        Dashboard
      </NavLink>
      <NavLink to="/cliente/equipe" icon={<Users size={20} />}>
        Equipe
      </NavLink>
      <NavLink to="/cliente/chamados" icon={<MessageSquare size={20} />}>
        Chamados
      </NavLink>
      <NavLink to="/cliente/cronograma" icon={<Calendar size={20} />}>
        Cronograma
      </NavLink>
      <NavLink to="/cliente/contato" icon={<Mail size={20} />}>
        Contato
      </NavLink>
    </div>
  );
};
