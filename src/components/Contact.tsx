
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from "../hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulando envio de formulário
    setTimeout(() => {
      console.log('Form submitted:', formState);
      setIsSubmitting(false);
      
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
        duration: 5000,
      });
      
      setFormState({ name: '', email: '', phone: '', company: '', message: '' });
    }, 1500);
  };
  
  return (
    <section id="contact" className="py-24 bg-gray-50 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-radial from-blue-50 to-transparent opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ascalate-black mb-4">Entre em contato</h2>
          <div className="w-24 h-1 bg-ascalate-blue mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Estamos prontos para ajudar sua empresa a alcançar novos patamares. 
            Entre em contato para uma consulta personalizada.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow-lg animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6 text-ascalate-darkblue">Envie-nos uma mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="name">Nome completo</label>
                  <input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ascalate-blue"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ascalate-blue"
                    placeholder="Seu email"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="phone">Telefone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ascalate-blue"
                    placeholder="Seu telefone"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="company">Empresa</label>
                  <input
                    id="company"
                    name="company"
                    value={formState.company}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ascalate-blue"
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="message">Mensagem</label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ascalate-blue"
                  placeholder="Como podemos ajudar?"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors duration-300 flex items-center justify-center ${
                  isSubmitting ? 'bg-gray-400' : 'bg-ascalate-blue hover:bg-ascalate-darkblue'
                }`}
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Enviar mensagem
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-500 text-center mt-2">
                Sua privacidade é importante para nós. Seus dados serão utilizados apenas para contato.
              </p>
            </form>
          </div>
          
          <div className="w-full lg:w-1/2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
              <h3 className="text-2xl font-semibold mb-6 text-ascalate-darkblue">Informações de contato</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-ascalate-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">
                      Rua Exemplo, 123<br />
                      Caldas Novas, Goiás<br />
                      Brasil
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-ascalate-blue" />
                  </div>
                  <div className="ml-4">
                    <a href="tel:+5500000000000" className="text-gray-700 hover:text-ascalate-blue transition-colors">(XX) XXXX-XXXX</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-ascalate-blue" />
                  </div>
                  <div className="ml-4">
                    <a href="mailto:contato@ascalate.com.br" className="text-gray-700 hover:text-ascalate-blue transition-colors">contato@ascalate.com.br</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg h-64">
              <h3 className="text-lg font-semibold mb-4 text-ascalate-darkblue">Nossa localização</h3>
              <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Mapa Indisponível</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
