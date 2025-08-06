
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  FileUp, 
  Calendar, 
  MessageSquare,
  Settings,
  User,
  Shield,
  Database,
  Cloud,
  Activity,
  Bell
} from 'lucide-react';

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r shadow-sm">
      <div className="p-6">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-500 uppercase text-xs tracking-wider mb-4">
            Menu Principal
          </h3>
          
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Database size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/admin/clientes"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Users size={20} />
            <span>Clientes</span>
          </NavLink>
          
          <NavLink
            to="/admin/documentos"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FileUp size={20} />
            <span>Documentos</span>
          </NavLink>
          
          <NavLink
            to="/admin/fpa/gestao-clientes"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Activity size={20} />
            <span>FP&A - Gestão Clientes</span>
          </NavLink>
          
          <NavLink
            to="/admin/configuracoes"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Settings size={20} />
            <span>Configurações</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
