
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroImage from '../components/HeroImage';
import Hero from '../components/Hero';
import Services from '../components/Services';
import { Partner } from '../components/Partner'; // Using the updated Partner component
import MissionVision from '../components/MissionVision';
import Clients from '../components/Clients';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Index = () => {
  useEffect(() => {
    // Smooth scroll para links de âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const href = this.getAttribute('href');
        if (!href) return;
        
        const targetElement = document.querySelector(href);
        if (!targetElement) return;
        
        window.scrollTo({
          top: targetElement.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth'
        });
      });
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="bg-blue-600 text-white text-center py-2 text-xs font-medium tracking-wide">
        🚀 Projeto atualizado em 07/07/2026 — Sincronização automática via Git ativa!
      </div>
      <Navbar />
      <HeroImage />
      
      {/* Banner CTA - Budget Planejamento Orçamentário */}
      <section className="bg-white py-6 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-white rounded-xl px-6 py-5 text-center sm:text-left">
            <div className="flex items-start gap-4">
              <div className="w-1 h-12 bg-blue rounded-full flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Budget Essencial & Budget Pro — Planejamento Orçamentário
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Conheça os dois produtos da Ascalate para estruturação e gestão do ciclo orçamentário.
                </p>
              </div>
            </div>
            <a
              href="/plan-orcamentario"
              className="inline-flex items-center gap-2 bg-blue hover:bg-blue/90 text-blue-foreground text-sm font-medium px-6 py-3 rounded-full transition-colors whitespace-nowrap"
            >
              Ver produtos →
            </a>
          </div>
        </div>
      </section>

      <Hero />
      <Services />
      <Partner />
      <MissionVision />
      <Clients />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
