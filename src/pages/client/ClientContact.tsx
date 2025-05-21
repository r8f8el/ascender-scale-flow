
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Phone, User, MapPin } from 'lucide-react';

// Mock contact data
const mockContactInfo = {
  name: 'Daniel Gomes',
  position: 'Consultor Responsável',
  email: 'daniel.gomes@ascalate.com.br',
  phone: '+55 (11) 99999-8888',
  whatsapp: '+55 (11) 99999-8888',
};

const ContactItem = ({ icon, label, value, link }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string,
  link?: string
}) => (
  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border">
    <div className="text-blue-600 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {link ? (
        <a href={link} className="text-blue-600 hover:underline font-medium">
          {value}
        </a>
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </div>
  </div>
);

const ClientContact = () => {
  const { client } = useAuth();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Contato - {client?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Informações de contato da equipe responsável pelo seu projeto
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={30} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{mockContactInfo.name}</h2>
              <p className="text-gray-600">{mockContactInfo.position}</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Responsável pelo acompanhamento e gerenciamento do projeto de consultoria financeira 
            para {client?.name}. Entre em contato diretamente para tirar dúvidas ou agendar reuniões.
          </p>
          
          <div className="space-y-4">
            <ContactItem 
              icon={<Mail size={20} />} 
              label="E-mail" 
              value={mockContactInfo.email}
              link={`mailto:${mockContactInfo.email}`}
            />
            
            <ContactItem 
              icon={<Phone size={20} />} 
              label="Telefone" 
              value={mockContactInfo.phone}
              link={`tel:${mockContactInfo.phone.replace(/\D/g, '')}`}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Canais de Atendimento</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Horário de Atendimento</h3>
              <p className="text-gray-600">
                Segunda a Sexta: 9h às 18h<br />
                Sábados: 9h às 12h (somente agendamento prévio)
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Atendimento via WhatsApp</h3>
              <a
                href={`https://wa.me/${mockContactInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Conversar pelo WhatsApp
              </a>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">E-mail Institucional</h3>
              <a
                href="mailto:contato@ascalate.com.br"
                className="text-blue-600 hover:underline"
              >
                contato@ascalate.com.br
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">Endereço:</h3>
        <p className="text-blue-700 text-sm">
          Avenida Portugal, 1148<br />
          Edifício Orion<br />
          Goiânia, Goiás<br />
          Brasil
        </p>
      </div>
    </div>
  );
};

export default ClientContact;
