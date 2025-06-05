
import React, { useState, useEffect } from 'react';
import { Menu, X, User, Shield } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, client, logout } = useAuth();
  const { isAdminAuthenticated, admin, adminLogout } = useAdminAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
    }
    if (isAdminAuthenticated) {
      adminLogout();
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="h-10 w-auto" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#services" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Serviços
            </a>
            <a 
              href="#about" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Sobre
            </a>
            <a 
              href="#clients" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Clientes
            </a>
            <a 
              href="#contact" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Contato
            </a>
            
            {/* Authentication Links */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <a 
                  href="/cliente" 
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                >
                  <User size={16} />
                  {client?.name}
                </a>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : isAdminAuthenticated ? (
              <div className="flex items-center gap-4">
                <a 
                  href="/admin" 
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium"
                >
                  <Shield size={16} />
                  {admin?.name}
                </a>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <a 
                  href="/cliente/login" 
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                >
                  <User size={16} />
                  Área do Cliente
                </a>
                <a 
                  href="/admin/login" 
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium"
                >
                  <Shield size={16} />
                  Admin
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <a 
                href="#services" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Serviços
              </a>
              <a 
                href="#about" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Sobre
              </a>
              <a 
                href="#clients" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Clientes
              </a>
              <a 
                href="#contact" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contato
              </a>
              
              {/* Mobile Authentication Links */}
              {isAuthenticated ? (
                <div className="border-t pt-2">
                  <a 
                    href="/cliente" 
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={16} />
                    {client?.name}
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium"
                  >
                    Sair
                  </button>
                </div>
              ) : isAdminAuthenticated ? (
                <div className="border-t pt-2">
                  <a 
                    href="/admin" 
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield size={16} />
                    {admin?.name}
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="border-t pt-2">
                  <a 
                    href="/cliente/login" 
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={16} />
                    Área do Cliente
                  </a>
                  <a 
                    href="/admin/login" 
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield size={16} />
                    Admin
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
