
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronLeft, Save, CheckCircle, Loader2, AlertCircle, DollarSign, User } from 'lucide-react';
import { ContactStatus, Contact, ServiceType, UserRole } from '../types';
import { ORIGINS, MOCK_USERS } from '../constants';
import { useAuth } from '../App';
import { db } from '../services/dbService';

const ContactForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    companyName: '',
    role: '',
    phone: '',
    email: '',
    website: '',
    origin: ORIGINS[0].name,
    serviceType: ServiceType.CONTACT_CENTER,
    contractValue: 0,
    status: ContactStatus.PROSPECTO,
    ownerId: user?.id || ''
  });

  const isEditMode = Boolean(id);
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isEditMode && id) {
      const contactToEdit = db.getContacts().find(c => c.id === id);
      if (contactToEdit) {
        setFormData(contactToEdit);
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'contractValue' ? parseFloat(value) || 0 : value 
    }));
  };

  const isFormValid = formData.name && formData.companyName && formData.email;

  const handleFinalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSaving(true);
    setTimeout(() => {
      db.saveContact(formData);
      setIsSaving(false);
      navigate(isEditMode ? `/contacts/${id}` : '/contacts');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <Link to={isEditMode ? `/contacts/${id}` : "/contacts"} className="flex items-center gap-2 text-slate-500 hover:text-[#0B3C5D] transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver a {isEditMode ? 'detalles' : 'contactos'}
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-[#F4F6F8]">
          <h1 className="text-2xl font-bold text-[#2E2E2E]">
            {isEditMode ? `Editando: ${formData.name}` : 'Registro Comercial'}
          </h1>
        </div>

        <form onSubmit={handleFinalSave} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre Completo *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B3C5D]" placeholder="Alexander Pierce" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Empresa *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B3C5D]" placeholder="Stark Industries" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Especialidad de Servicio *</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0B3C5D]">
                  {Object.values(ServiceType).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Valor Estimado Contrato ($)</label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <input type="number" name="contractValue" value={formData.contractValue} onChange={handleChange} className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0B3C5D]" placeholder="0.00" />
                </div>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User className="w-3 h-3 text-indigo-500" /> Gestor Asignado
                  </label>
                  <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl outline-none text-indigo-900 font-semibold">
                    {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="correo@empresa.com" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Teléfono</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="+52 55..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Estado Inicial</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none">
                  {Object.values(ContactStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Origen</label>
                <select name="origin" value={formData.origin} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none">
                  {ORIGINS.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-end border-t border-slate-100 pt-8">
            <button 
              type="submit"
              className="px-10 py-3 bg-[#0B3C5D] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-30"
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEditMode ? 'Actualizar Contacto' : 'Guardar y Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
