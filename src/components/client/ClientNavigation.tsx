
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { File, MessageSquare, Calendar, Mail, Users, CheckSquare } from 'lucide-react';

const navigationItems = [
  { to: "/cliente", icon: <File size={20} />, label: "Dashboard" },
  { to: "/cliente/equipe", icon: <Users size={20} />, label: "Equipe" },
  { to: "/cliente/chamados", icon: <MessageSquare size={20} />, label: "Chamados" },
  { to: "/cliente/aprovacoes", icon: <CheckSquare size={20} />, label: "Aprovações" },
  { to: "/cliente/cronograma", icon: <Calendar size={20} />, label: "Cronograma" },
  { to: "/cliente/contato", icon: <Mail size={20} />, label: "Contato" },
];

const NavLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) => (
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
      {navigationItems.map((item) => (
        <NavLink key={item.to} to={item.to} icon={item.icon}>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};
