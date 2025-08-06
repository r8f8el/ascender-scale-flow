
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calendar,
  Users,
  Mail,
  Shield,
  TrendingUp,
  FileText,
  MessageCircle,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  FolderOpen,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const mainNavigationItems = [
  { path: '/cliente/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/cliente/equipe', icon: Users, label: 'Equipe' },
  { path: '/cliente/chamados', icon: MessageSquare, label: 'Chamados' },
  { path: '/cliente/cronograma', icon: Calendar, label: 'Cronograma' },
  { path: '/cliente/contato', icon: Mail, label: 'Contato' }
];

const fpaNavigationItems = [
  { path: '/cliente/fpa/dashboard', icon: TrendingUp, label: 'Dashboard FP&A' },
  { path: '/cliente/documentos', icon: FolderOpen, label: 'Cofre de Dados' },
  { path: '/cliente/fpa/cenarios', icon: TrendingUp, label: 'Cenários Interativos' },
  { path: '/cliente/fpa/relatorios', icon: FileText, label: 'Biblioteca de Relatórios' },
  { path: '/cliente/fpa/comunicacao', icon: MessageCircle, label: 'Comunicação' }
];

export const ClientNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNewTicket = () => {
    navigate('/abrir-chamado');
  };

  const handleLogout = () => {
    logout();
    navigate('/cliente/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden p-4 bg-white border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={`bg-white border-r border-gray-200 w-64 min-h-screen ${
        isMobileMenuOpen ? 'block' : 'hidden md:block'
      }`}>
        {/* Botão Novo Chamado */}
        <div className="p-4 border-b">
          <Button 
            onClick={handleNewTicket}
            className="w-full bg-[#f07c00] hover:bg-[#e56b00] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Chamado
          </Button>
        </div>

        <div className="p-4">
          {/* Menu Principal */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              MENU PRINCIPAL
            </h3>
            <ul className="space-y-1">
              {mainNavigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* FP&A - Planejamento Financeiro */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              FP&A - PLANEJAMENTO FINANCEIRO
            </h3>
            <ul className="space-y-1">
              {fpaNavigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Botão Sair */}
          <div className="pt-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
