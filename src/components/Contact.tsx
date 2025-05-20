
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from "../hooks/use-toast";
import { Card, CardContent } from '@/components/ui/card';

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
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Entre em contato</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Estamos prontos para ajudar sua empresa a alcançar novos patamares. 
            Entre em contato para uma consulta personalizada.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-1/2 animate__animated animate__fadeIn">
            <Card className="shadow-xl border-none">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-blue-900">Envie-nos uma mensagem</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="name">Nome completo</label>
                      <input
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Seu email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="phone">Telefone</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formState.phone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Como podemos ajudar?"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors duration-300 flex items-center justify-center ${
                      isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
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
                  
                  <p className="text-sm text-gray-500 text-center">
                    Sua privacidade é importante para nós. Seus dados serão utilizados apenas para contato.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full lg:w-1/2 animate__animated animate__fadeIn" style={{ animationDelay: '0.2s' }}>
            <Card className="shadow-xl border-none">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-blue-900">Informações de contato</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-600" />
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
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <a href="tel:+5562936180447" className="text-gray-700 hover:text-blue-600 transition-colors">(62) 93618-0447</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <a href="mailto:daniel@ascalate.com.br" className="text-gray-700 hover:text-blue-600 transition-colors">daniel@ascalate.com.br</a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
