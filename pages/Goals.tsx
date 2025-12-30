
import React, { useState, useMemo, useEffect } from 'react';
import { ServiceType, UserGoalConfig, PeriodicGoal, UserRole } from '../types';
import { MOCK_USERS } from '../constants';
import { useAuth } from '../App';
import { 
  Save, Calculator, DollarSign, FileCheck, Layers, 
  ChevronRight, Users, Calendar, TrendingUp, ChevronDown, 
  ArrowUpRight, AlertCircle, Info
} from 'lucide-react';

const emptyPeriodic = (): PeriodicGoal => ({ contracts: 0, billing: 0 });

const defaultGoalConfig = (): UserGoalConfig => ({
  yearly: { contracts: 120, billing: 1000000 },
  quarters: {
    q1: { contracts: 30, billing: 250000 },
    q2: { contracts: 30, billing: 250000 },
    q3: { contracts: 30, billing: 250000 },
    q4: { contracts: 30, billing: 250000 },
  },
  // Fix: Explicitly type the reduce return and initial value to satisfy the index signature for number keys.
  months: Array.from({ length: 12 }).reduce<Record<number, PeriodicGoal>>((acc, _, i) => {
    acc[i] = { contracts: 10, billing: 83333 };
    return acc;
  }, {})
});

const MONTHS_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Goals: React.FC = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(user?.id || '');
  const [selectedService, setSelectedService] = useState<ServiceType>(ServiceType.CONTACT_CENTER);
  const [activeSection, setActiveSection] = useState<'yearly' | 'quarters' | 'months'>('yearly');

  const isAdmin = user?.role === UserRole.ADMIN;

  const [allGoals, setAllGoals] = useState<Record<string, Record<ServiceType, UserGoalConfig>>>(() => {
    const saved = localStorage.getItem('axis_master_goals_v3');
    return saved ? JSON.parse(saved) : {};
  });

  const [isSaving, setIsSaving] = useState(false);

  // Obtener o inicializar la meta para el usuario y servicio seleccionado
  const currentGoal: UserGoalConfig = useMemo(() => {
    return allGoals[selectedUserId]?.[selectedService] || defaultGoalConfig();
  }, [allGoals, selectedUserId, selectedService]);

  const updateCurrentGoal = (updater: (prev: UserGoalConfig) => UserGoalConfig) => {
    setAllGoals(prev => {
      const userGoals = prev[selectedUserId] || {} as any;
      return {
        ...prev,
        [selectedUserId]: {
          ...userGoals,
          [selectedService]: updater(currentGoal)
        }
      };
    });
  };

  const saveToStorage = () => {
    setIsSaving(true);
    localStorage.setItem('axis_master_goals_v3', JSON.stringify(allGoals));
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleManualDistribute = () => {
    const yearlyBilling = currentGoal.yearly.billing;
    const yearlyContracts = currentGoal.yearly.contracts;
    
    updateCurrentGoal(prev => ({
      ...prev,
      quarters: {
        q1: { billing: yearlyBilling / 4, contracts: Math.floor(yearlyContracts / 4) },
        q2: { billing: yearlyBilling / 4, contracts: Math.floor(yearlyContracts / 4) },
        q3: { billing: yearlyBilling / 4, contracts: Math.floor(yearlyContracts / 4) },
        q4: { billing: yearlyBilling / 4, contracts: Math.floor(yearlyContracts / 4) },
      },
      // Fix: Explicitly type the reduce return and initial value to satisfy the index signature for number keys.
      months: Array.from({ length: 12 }).reduce<Record<number, PeriodicGoal>>((acc, _, i) => {
        acc[i] = { billing: yearlyBilling / 12, contracts: Math.floor(yearlyContracts / 12) };
        return acc;
      }, {})
    }));
  };

  const sumMonths = useMemo(() => {
    return Object.values(currentGoal.months).reduce((acc, m) => ({
      billing: acc.billing + m.billing,
      contracts: acc.contracts + m.contracts
    }), { billing: 0, contracts: 0 });
  }, [currentGoal.months]);

  const isConsistent = Math.abs(sumMonths.billing - currentGoal.yearly.billing) < 100;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2E2E2E] tracking-tight">Planificación Táctica</h1>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Configura las cuotas comerciales multinivel para tu equipo.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <Users className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="text-xs font-black text-[#0B3C5D] uppercase outline-none bg-transparent cursor-pointer"
              >
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.name.toUpperCase()} ({u.role})</option>
                ))}
              </select>
            </div>
          )}
          <button 
            onClick={saveToStorage}
            disabled={!isAdmin}
            className="flex items-center gap-2 px-8 py-3 bg-[#0B3C5D] text-white rounded-2xl hover:bg-[#1F6FA8] transition-all text-xs font-black shadow-xl shadow-blue-900/10 active:scale-95 disabled:opacity-30"
          >
            {isSaving ? 'Sincronizando...' : <><Save className="w-4 h-4" /> Publicar Cuotas</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar de Servicios */}
        <div className="xl:col-span-1 space-y-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">Líneas de Negocio</h3>
          {Object.values(ServiceType).map(service => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center justify-between group ${
                selectedService === service 
                ? 'bg-[#0B3C5D] text-white shadow-lg shadow-blue-900/10 scale-[1.02]' 
                : 'bg-white text-slate-500 hover:bg-indigo-50 border border-slate-100'
              }`}
            >
              <span className="text-sm font-bold">{service}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedService === service ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 border-dashed">
             <div className="flex items-center gap-2 text-indigo-700 mb-3">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Instrucciones</span>
             </div>
             <p className="text-[10px] text-indigo-900/60 leading-relaxed font-medium">
                Define la meta anual para habilitar el desglose. Puedes usar el botón de auto-distribución para una base inicial.
             </p>
          </div>
        </div>

        {/* Panel de Edición Granular */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            {/* Navegación de Secciones */}
            <div className="flex border-b border-slate-50 p-2 bg-slate-50/50">
              {[
                { id: 'yearly', label: 'Plan Anual', icon: TrendingUp },
                { id: 'quarters', label: 'Quarters (Q)', icon: Layers },
                { id: 'months', label: 'Mensualizado', icon: Calendar },
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeSection === sec.id 
                    ? 'bg-white text-[#0B3C5D] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <sec.icon className="w-4 h-4" />
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Vista Anual */}
              {activeSection === 'yearly' && (
                <div className="animate-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-xl font-black text-[#0B3C5D]">{selectedService}</h4>
                      <p className="text-sm text-slate-400 font-medium">Establece el objetivo macro para el año fiscal.</p>
                    </div>
                    <button 
                      onClick={handleManualDistribute}
                      disabled={!isAdmin}
                      className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors uppercase tracking-widest disabled:opacity-30"
                    >
                      Auto-distribuir Meses
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" /> Revenue Meta 2024
                      </label>
                      <input 
                        type="number" 
                        disabled={!isAdmin}
                        value={currentGoal.yearly.billing}
                        onChange={(e) => updateCurrentGoal(g => ({...g, yearly: {...g.yearly, billing: parseFloat(e.target.value) || 0 }}))}
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-[#0B3C5D] font-black text-2xl text-[#0B3C5D] disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-indigo-500" /> Contratos Objetivo
                      </label>
                      <input 
                        type="number" 
                        disabled={!isAdmin}
                        value={currentGoal.yearly.contracts}
                        onChange={(e) => updateCurrentGoal(g => ({...g, yearly: {...g.yearly, contracts: parseInt(e.target.value) || 0 }}))}
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-[#0B3C5D] font-black text-2xl text-[#0B3C5D] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {!isConsistent && (
                    <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-xs font-bold">
                        Diferencia detectada: La suma mensual (${sumMonths.billing.toLocaleString()}) no coincide con la meta anual (${currentGoal.yearly.billing.toLocaleString()}).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Vista Quarters */}
              {activeSection === 'quarters' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                  {['q1', 'q2', 'q3', 'q4'].map((q) => (
                    <div key={q} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all">
                      <h5 className="text-[10px] font-black text-[#0B3C5D] uppercase tracking-[0.2em] mb-4">Trimestre {q.toUpperCase()}</h5>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200">
                           <DollarSign className="w-4 h-4 text-slate-300" />
                           <input 
                            type="number" 
                            disabled={!isAdmin}
                            value={(currentGoal.quarters as any)[q].billing}
                            onChange={(e) => updateCurrentGoal(g => {
                              const newQ = { ...g.quarters, [q]: { ...(g.quarters as any)[q], billing: parseFloat(e.target.value) || 0 } };
                              return { ...g, quarters: newQ };
                            })}
                            className="bg-transparent outline-none w-full text-sm font-black text-slate-700"
                           />
                        </div>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200">
                           <FileCheck className="w-4 h-4 text-slate-300" />
                           <input 
                            type="number" 
                            disabled={!isAdmin}
                            value={(currentGoal.quarters as any)[q].contracts}
                            onChange={(e) => updateCurrentGoal(g => {
                              const newQ = { ...g.quarters, [q]: { ...(g.quarters as any)[q], contracts: parseInt(e.target.value) || 0 } };
                              return { ...g, quarters: newQ };
                            })}
                            className="bg-transparent outline-none w-full text-sm font-black text-slate-700"
                           />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vista Mensual */}
              {activeSection === 'months' && (
                <div className="space-y-4 animate-in fade-in duration-500 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {MONTHS_LABELS.map((month, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                      <div className="w-full sm:w-1/4">
                        <span className="text-xs font-black text-[#0B3C5D] uppercase tracking-widest">{month}</span>
                      </div>
                      <div className="w-full sm:w-2/4 flex gap-3">
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-slate-300" />
                          <input 
                            type="number" 
                            disabled={!isAdmin}
                            value={currentGoal.months[idx].billing}
                            onChange={(e) => updateCurrentGoal(g => {
                              const newM = { ...g.months, [idx]: { ...g.months[idx], billing: parseFloat(e.target.value) || 0 } };
                              return { ...g, months: newM };
                            })}
                            className="w-full bg-transparent outline-none text-xs font-bold text-slate-600"
                          />
                        </div>
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
                          <FileCheck className="w-3 h-3 text-slate-300" />
                          <input 
                            type="number" 
                            disabled={!isAdmin}
                            value={currentGoal.months[idx].contracts}
                            onChange={(e) => updateCurrentGoal(g => {
                              const newM = { ...g.months, [idx]: { ...g.months[idx], contracts: parseInt(e.target.value) || 0 } };
                              return { ...g, months: newM };
                            })}
                            className="w-full bg-transparent outline-none text-xs font-bold text-slate-600"
                          />
                        </div>
                      </div>
                      <div className="w-full sm:w-1/4 text-right">
                         <span className="text-[10px] font-black text-indigo-500">{(currentGoal.months[idx].billing / (currentGoal.yearly.billing || 1) * 100).toFixed(1)}% del año</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resumen de Performance Proyectada */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Medio Obj.</p>
                 <h4 className="text-2xl font-black text-[#0B3C5D] tracking-tight">
                    ${currentGoal.yearly.contracts > 0 ? (currentGoal.yearly.billing / currentGoal.yearly.contracts).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                 </h4>
              </div>
              <div className="mt-4 flex items-center gap-2 text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-[10px] font-bold">Planificación Activa</span>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Concentración Mensual</p>
                 <h4 className="text-2xl font-black text-[#0B3C5D] tracking-tight">
                    ${(currentGoal.yearly.billing / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}
                 </h4>
              </div>
              <div className="mt-4 flex items-center gap-2 text-indigo-500">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold">Cuota Base Promedio</span>
              </div>
            </div>

            <div className={`p-8 rounded-[32px] border shadow-sm flex flex-col justify-between ${isConsistent ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div>
                 <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isConsistent ? 'text-emerald-600' : 'text-red-600'}`}>Precisión de Datos</p>
                 <h4 className={`text-2xl font-black tracking-tight ${isConsistent ? 'text-emerald-900' : 'text-red-900'}`}>
                    {isConsistent ? '100% Sincronizado' : 'Error de Calibración'}
                 </h4>
              </div>
              <div className={`mt-4 flex items-center gap-2 ${isConsistent ? 'text-emerald-600' : 'text-red-600'}`}>
                {isConsistent ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-[10px] font-bold">{isConsistent ? 'Suma válida' : 'Verifica anual vs meses'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle: React.FC<{className?: string}> = ({className}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default Goals;
