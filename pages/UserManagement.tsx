
import React, { useMemo } from 'react';
import { MOCK_USERS, MOCK_CONTACTS, MOCK_TASKS } from '../constants';
import { Shield, Mail, User as UserIcon, Activity, MoreVertical, Search, Plus } from 'lucide-react';

const UserManagement: React.FC = () => {
  const userStats = useMemo(() => {
    return MOCK_USERS.map(user => {
      const contactsCount = MOCK_CONTACTS.filter(c => c.ownerId === user.id).length;
      const tasksCount = MOCK_TASKS.filter(t => t.ownerId === user.id).length;
      return {
        ...user,
        contactsCount,
        tasksCount
      };
    });
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2E2E2E] tracking-tight">Gestión de Talento</h1>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Administra los accesos y el desempeño del equipo AXIS.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0B3C5D] text-white rounded-2xl hover:bg-[#1F6FA8] transition-all text-sm font-black shadow-xl shadow-blue-900/10 active:scale-95">
          <Plus className="w-4 h-4" /> Registrar Nuevo Usuario
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-[#0B3C5D] text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Usuarios Activos: {MOCK_USERS.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Colaborador</th>
                <th className="px-8 py-5">Permisos</th>
                <th className="px-8 py-5 text-center">Leads Propios</th>
                <th className="px-8 py-5 text-center">Carga de Trabajo</th>
                <th className="px-8 py-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {userStats.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#0B3C5D] border border-indigo-100 font-black text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#2E2E2E]">{user.name}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 w-fit ${
                      user.role === 'ADMIN' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex flex-col">
                      <span className="text-xl font-black text-[#2E2E2E]">{user.contactsCount}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">CONTACTOS</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex flex-col">
                      <span className="text-xl font-black text-[#2E2E2E]">{user.tasksCount}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">TAREAS ACTIVAS</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 text-slate-300 hover:text-[#0B3C5D] transition-colors rounded-xl hover:bg-white border border-transparent hover:border-slate-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
