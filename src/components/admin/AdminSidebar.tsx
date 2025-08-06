
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
  Bell,
  Briefcase,
  FileText,
  UserCheck
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
            to="/admin/projetos"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Briefcase size={20} />
            <span>Projetos</span>
          </NavLink>

          <NavLink
            to="/admin/colaboradores"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <UserCheck size={20} />
            <span>Colaboradores</span>
          </NavLink>

          <NavLink
            to="/admin/tarefas"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FileText size={20} />
            <span>Tarefas</span>
          </NavLink>

          <NavLink
            to="/admin/chamados"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <MessageSquare size={20} />
            <span>Todos os Chamados</span>
          </NavLink>

          <NavLink
            to="/admin/meus-chamados"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <User size={20} />
            <span>Meus Chamados</span>
          </NavLink>

          <NavLink
            to="/admin/arquivos"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <FileUp size={20} />
            <span>Arquivos</span>
          </NavLink>

          <NavLink
            to="/admin/cronogramas"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Calendar size={20} />
            <span>Cronogramas</span>
          </NavLink>

          <NavLink
            to="/admin/mensagens"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Bell size={20} />
            <span>Mensagens</span>
          </NavLink>

          <NavLink
            to="/admin/logs"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Shield size={20} />
            <span>Logs de Acesso</span>
          </NavLink>

          <NavLink
            to="/admin/activity-logs"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Activity size={20} />
            <span>Logs de Atividade</span>
          </NavLink>

          <NavLink
            to="/admin/onedrive"
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Cloud size={20} />
            <span>OneDrive/SharePoint</span>
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
