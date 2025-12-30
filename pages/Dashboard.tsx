
import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  ComposedChart, Line, LabelList, Funnel, FunnelChart
} from 'recharts';
import IAInsightPanel from '../components/IAInsightPanel';
import { MOCK_CONTACTS, MOCK_TASKS, MOCK_USERS } from '../constants';
import { ContactStatus, ServiceType, UserGoalConfig, UserRole } from '../types';
import { useAuth } from '../App';
import { 
  CheckCircle2, Target, Filter, RotateCcw, 
  AlertCircle, DollarSign, Briefcase, Award, Eye,
  Users as UsersIcon, Filter as FunnelIcon, TrendingUp
} from 'lucide-react';

const COLORS = ['#0B3C5D', '#1F6FA8', '#6FAED9', '#10B981', '#94A3B8', '#F59E0B', '#EF4444'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [adminViewUser, setAdminViewUser] = useState<string>('all');
  const now = new Date();
  const currentMonthIdx = now.getMonth();

  const allGoals = useMemo<Record<string, Record<ServiceType, UserGoalConfig>>>(() => {
    const saved = localStorage.getItem('axis_master_goals_v3');
    return saved ? JSON.parse(saved) : {};
  }, []);

  const isDateInRange = (dateStr: string) => {
    if (!dateRange.start && !dateRange.end) return true;
    const date = new Date(dateStr).getTime();
    const start = dateRange.start ? new Date(dateRange.start).getTime() : -Infinity;
    const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;
    const adjustedEnd = dateRange.end ? end + (24 * 60 * 60 * 1000) - 1 : Infinity;
    return date >= start && date <= adjustedEnd;
  };

  const filteredContacts = useMemo(() => {
    return MOCK_CONTACTS.filter(c => {
      if (!isDateInRange(c.createdAt)) return false;
      if (user?.role === UserRole.ADMIN) {
        if (adminViewUser !== 'all' && c.ownerId !== adminViewUser) return false;
      } else {
        if (c.ownerId !== user?.id) return false;
      }
      return true;
    });
  }, [dateRange, adminViewUser, user]);

  const performanceData = useMemo(() => {
    return Object.values(ServiceType).map(service => {
      const actualBilling = filteredContacts
        .filter(c => c.serviceType === service && c.status === ContactStatus.CONVERTIDO)
        .reduce((sum, c) => sum + (c.contractValue || 0), 0);
      
      let monthlyGoal = 0;
      
      if (adminViewUser === 'all') {
        monthlyGoal = Object.values(allGoals).reduce<number>((sum, userGoals: Record<ServiceType, UserGoalConfig>) => {
          const serviceGoal = userGoals[service];
          return sum + (serviceGoal?.months[currentMonthIdx]?.billing || 0);
        }, 0);
      } else {
        const targetUserId = adminViewUser === 'all' ? (user?.id || '') : adminViewUser;
        monthlyGoal = allGoals[targetUserId]?.[service]?.months[currentMonthIdx]?.billing || 0;
      }

      return {
        name: service,
        Meta: monthlyGoal,
        Real: actualBilling,
        cumplimiento: monthlyGoal > 0 ? Math.round((actualBilling / monthlyGoal) * 100) : 0
      };
    });
  }, [filteredContacts, allGoals, adminViewUser, user, currentMonthIdx]);

  // Nueva métrica: Cantidad de contactos por usuario vs tipo de servicio
  const userVsServiceData = useMemo(() => {
    const services = Object.values(ServiceType);
    const usersList = MOCK_USERS;

    return services.map(service => {
      const dataPoint: any = { name: service };
      usersList.forEach(u => {
        dataPoint[u.name] = filteredContacts.filter(c => c.serviceType === service && c.ownerId === u.id).length;
      });
      return dataPoint;
    });
  }, [filteredContacts]);

  // Nueva métrica: Embudo de conversión
  const funnelData = useMemo(() => {
    const statuses = [
      { status: ContactStatus.PROSPECTO, label: 'Prospectos' },
      { status: ContactStatus.CONTACTADO, label: 'Contactados' },
      { status: ContactStatus.INTERESADO, label: 'Interesados' },
      { status: ContactStatus.EN_CONTRATO, label: 'En Contrato' },
      { status: ContactStatus.CONVERTIDO, label: 'Convertidos' },
    ];

    return statuses.map((s, idx) => ({
      name: s.label,
      value: filteredContacts.filter(c => c.status === s.status).length,
      fill: COLORS[idx % COLORS.length]
    })).filter(d => d.value >= 0); // Keep zeros to show the funnel shape
  }, [filteredContacts]);

  const totalRevenue = useMemo(() => {
    return filteredContacts
      .filter(c => c.status === ContactStatus.CONVERTIDO)
      .reduce((sum, c) => sum + (c.contractValue || 0), 0);
  }, [filteredContacts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2E2E]">
            {user?.role === UserRole.ADMIN ? 'Consola de Supervisión AXIS' : `Workspace: ${user?.name}`}
          </h1>
          <p className="text-[#6B7280] text-sm italic font-medium">Meta calculada para: {MONTHS_LABELS[currentMonthIdx]} 2024</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          {user?.role === UserRole.ADMIN && (
            <div className="flex items-center gap-2 px-3 border-r border-slate-100">
              <Eye className="w-4 h-4 text-slate-400" />
              <select 
                value={adminViewUser} 
                onChange={(e) => setAdminViewUser(e.target.value)}
                className="text-[10px] font-black text-[#0B3C5D] uppercase outline-none bg-transparent"
              >
                <option value="all">TODOS LOS USUARIOS</option>
                {MOCK_USERS.filter(u => u.role !== UserRole.ADMIN).map(u => (
                  <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase">Filtro Temporal</span>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <input type="date" className="bg-slate-50 border-none rounded-lg px-2 py-1 text-xs outline-none font-medium" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
            <span className="text-slate-300">-</span>
            <input type="date" className="bg-slate-50 border-none rounded-lg px-2 py-1 text-xs outline-none font-medium" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
            <button onClick={() => setDateRange({start: '', end: ''})} className="p-1 text-slate-300 hover:text-[#0B3C5D] transition-colors"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ingreso Real', val: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'indigo' },
          { label: 'Tareas Vencidas', val: MOCK_TASKS.filter(t => !t.isCompleted && new Date(`${t.date}T${t.time}:00`) < now && (adminViewUser === 'all' || t.ownerId === adminViewUser)).length, icon: AlertCircle, color: 'red' },
          { label: 'Cierres Efectivos', val: filteredContacts.filter(c => c.status === ContactStatus.CONVERTIDO).length, icon: CheckCircle2, color: 'emerald' },
          { label: 'Eficiencia Mes', val: `${performanceData.reduce((acc, p) => acc + p.cumplimiento, 0) / performanceData.length || 0}%`.split('.')[0] + '%', icon: Target, color: 'blue' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:translate-y-[-2px] transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              kpi.color === 'red' ? 'bg-red-50 text-red-600' : 
              kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              kpi.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-[#0B3C5D]'
            }`}>
              <kpi.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h4 className="text-2xl font-black text-[#2E2E2E]">{kpi.val}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart - Full Width Row */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center border border-slate-100">
                <Briefcase className="w-6 h-6 text-[#0B3C5D]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2E2E2E]">Performance vs Cuota del Mes</h3>
                <p className="text-xs text-[#6B7280]">Cumplimiento real vs meta planificada en AXIS para este mes.</p>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Meta" name="Cuota Planificada" fill="#E2E8F0" radius={[8, 8, 0, 0]} barSize={45} />
                <Bar dataKey="Real" name="Facturación" fill="#0B3C5D" radius={[8, 8, 0, 0]} barSize={45}>
                  <LabelList dataKey="cumplimiento" position="top" formatter={(v: any) => `${v}%`} style={{ fontSize: '11px', fill: '#0B3C5D', fontWeight: '900' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <IAInsightPanel title="Eficiencia de Cumplimiento de Cuota" data={performanceData} />
        </div>

        {/* User vs Service Type Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
              <UsersIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2E2E2E]">Leads por Gestor y Servicio</h3>
              <p className="text-xs text-[#6B7280]">Distribución de carga comercial por tipo de negocio.</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userVsServiceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700}} width={120} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', color: '#94A3B8' }} />
                {MOCK_USERS.map((u, i) => (
                  <Bar key={u.id} dataKey={u.name} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === MOCK_USERS.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <IAInsightPanel title="Balance de Carga por Gestor" data={userVsServiceData} />
        </div>

        {/* Sales Funnel Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
              <FunnelIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2E2E2E]">Embudo de Conversión</h3>
              <p className="text-xs text-[#6B7280]">Salud del pipeline y flujo de ventas actual.</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Funnel
                  data={funnelData}
                  dataKey="value"
                  nameKey="name"
                  labelLine={true}
                >
                  <LabelList position="right" fill="#94A3B8" stroke="none" dataKey="name" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <IAInsightPanel title="Análisis del Embudo de Ventas" data={funnelData} />
        </div>
      </div>
    </div>
  );
};

const MONTHS_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default Dashboard;
