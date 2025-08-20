
import React from 'react';

const Clients = () => {
  return (
    <section id="clientes" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nossos Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empresas que confiam em nossos serviços para transformar seus processos e impulsionar o crescimento
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-center">
          {/* Cliente 1 */}
          <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
              src="/lovable-uploads/f21c20f5-4dfe-463b-b744-fdc15cd182e8.png" 
              alt="Cliente 1" 
              className="max-h-16 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Cliente 2 */}
          <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
              src="/lovable-uploads/67fee783-7ae5-4793-8ec2-3802ea6d1d83.png" 
              alt="Cliente 2" 
              className="max-h-16 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Cliente 3 */}
          <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
              src="/lovable-uploads/75440280-d8c2-40e7-b3c3-154932015279.png" 
              alt="Cliente 3" 
              className="max-h-16 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Cliente 4 */}
          <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
              src="/lovable-uploads/9b9e23bc-f39b-419d-b7e0-dbf05855f76c.png" 
              alt="Cliente 4" 
              className="max-h-16 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Cliente 5 */}
          <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
              src="/lovable-uploads/244710e0-c1bc-438e-978d-5daddf1771c0.png" 
              alt="Cliente 5" 
              className="max-h-16 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Cliente 6 */}
          <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
              src="/lovable-uploads/56c3c6a9-9428-4d10-889f-078c025019d3.png" 
              alt="Cliente 6" 
              className="max-h-16 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600">
            Junte-se a mais de <span className="font-semibold text-blue-600">100+ empresas</span> que já transformaram seus processos conosco
          </p>
        </div>
      </div>
    </section>
  );
};

export default Clients;
