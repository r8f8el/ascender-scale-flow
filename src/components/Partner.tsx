
import React, { useEffect, useRef } from 'react';
import { Linkedin } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Partner = () => {
  const partnerId = useRef(null);
  
  // Efeito para criar animação de partículas no fundo
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.className = "absolute inset-0 w-full h-full";
    partnerId.current?.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let animationFrameId: number;
    const particles: Particle[] = [];
    
    const resize = () => {
      canvas.width = partnerId.current?.clientWidth || window.innerWidth;
      canvas.height = partnerId.current?.clientHeight || window.innerHeight;
      
      // Recriar partículas quando o tamanho muda
      particles.length = 0;
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(canvas));
      }
    };
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      canvas: HTMLCanvasElement;
      
      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        
        const colors = ['#0048ff33', '#11008f33', '#00000033'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > this.canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        
        if (this.y > this.canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    const animate = () => {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx!);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    window.addEventListener('resize', resize);
    resize();
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <section id="partner" className="py-24 bg-gray-50 relative overflow-hidden" ref={partnerId}>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nosso Sócio</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça o profissional por trás da Ascalate e sua trajetória de sucesso.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          <div className="w-full lg:w-1/3 animate__animated animate__fadeIn">
            <Card className="overflow-hidden shadow-xl border-none">
              <div className="relative h-96 w-full overflow-hidden">
                <img 
                  src="/lovable-uploads/9d76e17b-e7f3-435a-b95b-158ef80f185f.png" 
                  alt="Daniel Gomes" 
                  className="w-full h-full object-contain object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white">Daniel Gomes</h3>
                  <p className="text-blue-200">Sócio Fundador</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="w-full lg:w-1/2 animate__animated animate__fadeIn" style={{ animationDelay: '0.2s' }}>
            <Card className="p-8 shadow-xl border-none">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Experiência e Liderança</h3>
              <p className="text-gray-700 mb-6">
                Com mais de 15 anos de experiência no mercado financeiro, Daniel Gomes é especialista em consultoria financeira e estratégica para empresas de diversos setores. Sua abordagem inovadora e capacidade analítica têm ajudado negócios a alcançarem seu máximo potencial e superarem expectativas.
              </p>
              
              <p className="text-gray-700 mb-8">
                Formado em Finanças e com MBA em Gestão Estratégica, Daniel combina conhecimento técnico com uma visão holística do mercado, entregando soluções personalizadas e resultados consistentes para seus clientes.
              </p>
              
              <a 
                href="https://www.linkedin.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                <span>Conecte-se no LinkedIn</span>
              </a>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partner;
