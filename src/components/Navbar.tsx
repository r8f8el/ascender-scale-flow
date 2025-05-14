
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Logo className="h-10 w-auto" />
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <NavLink href="#services">O que entregamos</NavLink>
          <NavLink href="#partner">Sócio</NavLink>
          <NavLink href="#mission">Missão, Visão e Valores</NavLink>
          <NavLink href="#clients">Clientes</NavLink>
          <NavLink href="#contact">Contato</NavLink>
          <Link 
            to="/cliente/login"
            className="text-white bg-[#0056b3] hover:bg-[#003d7f] px-4 py-2 rounded-md transition-colors duration-300"
          >
            Área do Cliente
          </Link>
        </div>
        
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-ascalate-blue">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%]">
              <div className="flex flex-col space-y-4 mt-8">
                <MobileNavLink href="#services">O que entregamos</MobileNavLink>
                <MobileNavLink href="#partner">Sócio</MobileNavLink>
                <MobileNavLink href="#mission">Missão, Visão e Valores</MobileNavLink>
                <MobileNavLink href="#clients">Clientes</MobileNavLink>
                <MobileNavLink href="#contact">Contato</MobileNavLink>
                <Link 
                  to="/cliente/login"
                  className="text-white bg-[#0056b3] hover:bg-[#003d7f] px-4 py-2 rounded-md transition-colors duration-300 text-center"
                >
                  Área do Cliente
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
  return (
    <a 
      href={href} 
      className="text-gray-800 hover:text-ascalate-blue font-medium transition-colors duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ascalate-blue after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
    >
      {children}
    </a>
  );
};

const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
  return (
    <a 
      href={href} 
      className="text-gray-800 hover:text-ascalate-blue font-medium transition-colors duration-300 py-2 block"
    >
      {children}
    </a>
  );
};

export default Navbar;
