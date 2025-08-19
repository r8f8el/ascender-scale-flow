import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getLinkClasses = (path: string) => {
    return `text-gray-700 hover:text-[#f07c00] px-3 py-2 text-sm font-medium transition-colors rounded-md relative ${location.pathname === path ? 'text-[#f07c00]' : ''}`;
  };

  const getMobileLinkClasses = (path: string) => {
    return `text-gray-700 hover:text-[#f07c00] block px-3 py-2 text-base font-medium transition-colors rounded-md ${location.pathname === path ? 'text-[#f07c00]' : ''}`;
  };

  const NavItem = ({ to, children, isHashLink = false }: { to: string; children: React.ReactNode; isHashLink?: boolean }) => {
    const isActive = isHashLink 
      ? location.hash === to 
      : location.pathname === to;
    
    if (isHashLink) {
      return (
        <a 
          href={to} 
          className={getLinkClasses(to)}
        >
          {children}
          {isActive && (
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f07c00]"
              layoutId="navbar-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </a>
      );
    }
    
    return (
      <Link to={to} className={getLinkClasses(to)}>
        {children}
        {isActive && (
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f07c00]"
            layoutId="navbar-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </Link>
    );
  };

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Logo className="h-10 w-auto" />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItem to="/">Início</NavItem>
            <NavItem to="#services" isHashLink>Serviços</NavItem>
            <NavItem to="#mission" isHashLink>Sobre</NavItem>
            <NavItem to="/abrir-chamado">Suporte</NavItem>
            <NavItem to="#contact" isHashLink>Contato</NavItem>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/cliente/login" 
                className="bg-blue hover:bg-blue/90 text-blue-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Área do Cliente
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5 text-gray-700 hover:text-[#f07c00]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="px-2 pt-8 pb-3 space-y-1 sm:px-3 bg-white">
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
                    className="bg-blue hover:bg-blue/90 text-blue-foreground block px-3 py-2 text-base font-medium transition-colors rounded-md mt-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Área do Cliente
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
