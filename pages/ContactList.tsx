
import React, { useState, useMemo } from 'react';
import { MOCK_CONTACTS } from '../constants';
import { Search, Filter, Download, Plus, MoreHorizontal, ExternalLink, User, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { UserRole } from '../types';

const ContactList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredContacts = useMemo(() => {
    return MOCK_CONTACTS.filter(c => {
      // Filtrar por Propiedad
      if (user?.role !== UserRole.ADMIN && c.ownerId !== user?.id) return false;
      
      // Filtrar por Búsqueda
      const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [searchTerm, user]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline de Contactos</h1>
          <p className="text-slate-500">Base de datos centralizada de leads y clientes.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <Link to="/contacts/new" className="flex items-center gap-2 px-6 py-2.5 bg-[#0B3C5D] text-white rounded-xl hover:bg-[#1F6FA8] transition-all shadow-xl shadow-blue-900/10 font-bold text-sm">
            <Plus className="w-4 h-4" /> Nuevo Contacto
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o empresa..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-[#0B3C5D] font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-[#0B3C5D] hover:bg-slate-50 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
            <Filter className="w-4 h-4" /> Filtros Avanzados
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Contacto</th>
                <th className="px-8 py-5">Empresa / Cargo</th>
                <th className="px-8 py-5">Estado AXIS</th>
                <th className="px-8 py-5">Origen</th>
                {user?.role === UserRole.ADMIN && <th className="px-8 py-5">Gestor</th>}
                <th className="px-8 py-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#2E2E2E]">{contact.name}</span>
                      <span className="text-xs text-slate-400 font-medium">{contact.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-bold">{contact.companyName}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{contact.role || 'Sin cargo'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      contact.status === 'Convertido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      contact.status === 'Prospecto' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-indigo-50 text-[#0B3C5D] border border-indigo-100'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-slate-500 font-bold">{contact.origin}</span>
                  </td>
                  {user?.role === UserRole.ADMIN && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[8px] font-black">{contact.ownerId.slice(-2)}</div>
                         <span className="text-[10px] font-black text-slate-400 uppercase">{contact.ownerId}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/contacts/${contact.id}`} className="p-2.5 bg-white border border-slate-100 text-[#0B3C5D] rounded-xl transition-all hover:shadow-lg">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {user?.role === UserRole.ADMIN && (
                        <Link to={`/contacts/${contact.id}/edit`} className="p-2.5 bg-white border border-slate-100 text-indigo-600 rounded-xl transition-all hover:shadow-lg">
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}
                      <button className="p-2.5 bg-white border border-slate-100 text-slate-300 rounded-xl transition-all hover:text-red-500">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-lg font-bold text-[#2E2E2E]">Sin coincidencias en AXIS</p>
            <p className="text-sm font-medium">Prueba ajustando los filtros o la búsqueda del pipeline.</p>
          </div>
        )}

        <div className="p-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
          <p>Mostrando {filteredContacts.length} registros comerciales</p>
          <div className="flex gap-2">
            <button disabled className="px-4 py-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30">Anterior</button>
            <button disabled className="px-4 py-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactList;
