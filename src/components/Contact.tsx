
import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
      setIsSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
      
      // Reset o status após 3 segundos
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
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
          <p className="mt-6 text-gray-700 max-w-2xl mx-auto">
            Estamos prontos para ajudar sua empresa a alcançar novos patamares. 
            Entre em contato para uma consulta personalizada.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow-lg animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6 text-ascalate-darkblue">Envie-nos uma mensagem</h3>
            
            {isSubmitted ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                Mensagem enviada com sucesso! Entraremos em contato em breve.
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="name">Nome</label>
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
              
              <div className="mb-6">
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
              
              <div className="mb-6">
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
                className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors duration-300 ${
                  isSubmitting ? 'bg-gray-400' : 'bg-ascalate-blue hover:bg-ascalate-darkblue'
                }`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
              </button>
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
                    <p className="text-gray-700">(XX) XXXX-XXXX</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-ascalate-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">contato@ascalate.com.br</p>
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
