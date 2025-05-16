
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <HeroImage />
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
