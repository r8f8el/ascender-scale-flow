
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

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
        </div>
        
        <div className="md:hidden">
          <button className="p-2 text-ascalate-blue">
            Menu
          </button>
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

export default Navbar;
