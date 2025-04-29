
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Partner from '../components/Partner';
import MissionVision from '../components/MissionVision';
import Clients from '../components/Clients';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import BackgroundAnimation from '../components/BackgroundAnimation';
import ScrollToTop from '../components/ScrollToTop';

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
    <div className="min-h-screen">
      <BackgroundAnimation />
      <Navbar />
      <Hero />
      <Services />
      <Partner />
      <MissionVision />
      <Clients />
      <Contact />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
