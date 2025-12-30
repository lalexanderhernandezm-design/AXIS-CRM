
import React, { useMemo, useEffect, useState } from 'react';
import { db } from '../services/dbService';
import { MOCK_USERS } from '../constants';
import { Shield, Mail, User as UserIcon, MoreVertical, Search, Plus } from 'lucide-react';
import { Contact, Task } from '../types';

const UserManagement: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setContacts(db.getContacts());
    setTasks(db.getTasks());
  }, []);

  const userStats = useMemo(() => {
    return MOCK_USERS.map(user => {
      const contactsCount = contacts.filter(c => c.ownerId === user.id).length;
      const tasksCount = tasks.filter(t => t.ownerId === user.id).length;
      return { ...user, contactsCount, tasksCount };
    });
  }, [contacts, tasks]);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2E2E2E]">Gestión de Talento</h1>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Administra los accesos y el desempeño real del equipo.</p>
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Colaborador</th>
                <th className="px-8 py-5">Permisos</th>
                <th className="px-8 py-5 text-center">Leads Activos</th>
                <th className="px-8 py-5 text-center">Tareas</th>
                <th className="px-8 py-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {userStats.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#0B3C5D] font-black">{user.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-[#2E2E2E]">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-1 text-[9px] font-black rounded-lg ${user.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center font-black text-xl">{user.contactsCount}</td>
                  <td className="px-8 py-6 text-center font-black text-xl">{user.tasksCount}</td>
                  <td className="px-8 py-6"><MoreVertical className="w-5 h-5 text-slate-300" /></td>
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
