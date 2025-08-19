import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getLinkClasses = (path: string) => {
    return `text-gray-700 hover:text-[#f07c00] px-3 py-2 text-sm font-medium transition-colors rounded-md ${location.pathname === path ? 'bg-gray-100 text-[#f07c00]' : ''}`;
  };

  const getMobileLinkClasses = (path: string) => {
    return `text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors rounded-md ${location.pathname === path ? 'bg-gray-100 text-[#f07c00]' : ''}`;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={getLinkClasses('/')}>
              Início
            </Link>
            <a href="#services" className="text-gray-700 hover:text-[#f07c00] px-3 py-2 text-sm font-medium transition-colors">
              Serviços
            </a>
            <a href="#mission" className="text-gray-700 hover:text-[#f07c00] px-3 py-2 text-sm font-medium transition-colors">
              Sobre
            </a>
            <Link to="/abrir-chamado" className={getLinkClasses('/abrir-chamado')}>
              Suporte
            </Link>
            <a href="#contact" className="text-gray-700 hover:text-[#f07c00] px-3 py-2 text-sm font-medium transition-colors">
              Contato
            </a>
            <Link 
              to="/cliente/login" 
              className="bg-blue hover:bg-blue/90 text-blue-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Área do Cliente
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                  <Menu className="h-5 w-5 text-gray-700 hover:text-[#f07c00]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                  <Link 
                    to="/" 
                    className={getMobileLinkClasses('/')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Início
                  </Link>
                  <a 
                    href="#services" 
                    className="text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Serviços
                  </a>
                  <a 
                    href="#mission" 
                    className="text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sobre
                  </a>
                  <Link 
                    to="/abrir-chamado" 
                    className={getMobileLinkClasses('/abrir-chamado')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Suporte
                  </Link>
                  <a 
                    href="#contact" 
                    className="text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contato
                  </a>
                  <Link 
                    to="/cliente/login" 
                    className="bg-blue hover:bg-blue/90 text-blue-foreground block px-3 py-2 text-base font-medium transition-colors rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Área do Cliente
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link 
                to="/" 
                className={getMobileLinkClasses('/')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Início
              </Link>
              <a 
                href="#services" 
                className="text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Serviços
              </a>
              <a 
                href="#mission" 
                className="text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sobre
              </a>
              <Link 
                to="/abrir-chamado" 
                className={getMobileLinkClasses('/abrir-chamado')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Suporte
              </Link>
              <a 
                href="#contact" 
                className="text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contato
              </a>
              <Link 
                to="/cliente/login" 
                className="bg-blue hover:bg-blue/90 text-blue-foreground block px-3 py-2 text-base font-medium transition-colors rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Área do Cliente
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
