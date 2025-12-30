
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, Settings as SettingsIcon, FileInput, BarChart3, LogOut, 
  Bell, User, CalendarRange, AlertTriangle, Target, Lock, 
  ShieldCheck, UserPlus, Fingerprint 
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ContactList from './pages/ContactList';
import ContactDetail from './pages/ContactDetail';
import ContactForm from './pages/ContactForm';
import ImportExport from './pages/ImportExport';
import GlobalTasks from './pages/GlobalTasks';
import Goals from './pages/Goals';
import UserManagement from './pages/UserManagement';
import { MOCK_TASKS, MOCK_USERS } from './constants';
import { UserAccount, UserRole } from './types';

// Contexto de Autenticación
interface AuthContextType {
  user: UserAccount | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AxisLogo = () => (
  <div className="flex items-center gap-3 group">
    <div className="relative">
      <div className="w-10 h-10 bg-[#0B3C5D] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 group-hover:scale-105 transition-transform duration-300">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M3 12h18M12 12l6-6M12 12l-6 6" />
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl font-black text-[#2E2E2E] tracking-tighter">AXIS</span>
      <span className="text-[10px] font-bold text-[#0B3C5D] tracking-[0.2em] -mt-0.5">CRM</span>
    </div>
  </div>
);

const SidebarLink: React.FC<{ to: string, icon: any, children: React.ReactNode }> = ({ to, icon: Icon, children }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
      ${isActive ? 'bg-[#0B3C5D] text-white shadow-lg shadow-blue-900/10' : 'text-slate-500 hover:bg-indigo-50 hover:text-[#0B3C5D]'}
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{children}</span>
  </NavLink>
);

const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (mode === 'login') {
      const success = await login(email, password);
      if (success) navigate('/');
      else setError('Credenciales inválidas. Intenta admin@axis.com / 1234');
    } else {
      await register(name, email, password);
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <AxisLogo />
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-[#2E2E2E] tracking-tight">
              {mode === 'login' ? 'Bienvenido a AXIS' : 'Crea tu Cuenta Comercial'}
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              {mode === 'login' ? 'Ingresa para gestionar tu pipeline' : 'Únete al equipo de alto rendimiento'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre Completo</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0B3C5D] outline-none transition-all" />
              </div>
            )}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Corporativo</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0B3C5D] outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0B3C5D] outline-none transition-all" />
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

            <button disabled={loading} className="w-full py-4 bg-[#0B3C5D] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-[#1F6FA8] transition-all flex items-center justify-center gap-2 active:scale-95">
              {loading ? <Lock className="w-4 h-4 animate-spin" /> : mode === 'login' ? <Fingerprint className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {mode === 'login' ? 'Acceder al Workspace' : 'Comenzar ahora'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to={mode === 'login' ? '/register' : '/login'} className="text-xs font-bold text-[#0B3C5D] hover:underline">
              {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya eres usuario? Inicia sesión'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const overdueCount = useMemo(() => {
    const now = new Date();
    return MOCK_TASKS.filter(t => {
      if (t.isCompleted) return false;
      // Filtro por usuario (Admin ve todo)
      if (user?.role !== UserRole.ADMIN && t.ownerId !== user?.id) return false;
      const taskDate = new Date(`${t.date}T${t.time}:00`);
      return taskDate < now;
    }).length;
  }, [user]);

  return (
    <div className="flex min-h-screen bg-[#F4F6F8]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <AxisLogo />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink to="/" icon={BarChart3}>Dashboard Ejecutivo</SidebarLink>
          <SidebarLink to="/goals" icon={Target}>Metas Comerciales</SidebarLink>
          <div className="h-px bg-slate-50 mx-4 my-4"></div>
          <SidebarLink to="/contacts" icon={Users}>Contactos</SidebarLink>
          <SidebarLink to="/tasks" icon={CalendarRange}>Agenda Seguimiento</SidebarLink>
          <SidebarLink to="/import-export" icon={FileInput}>Importar/Exportar</SidebarLink>
          
          {user?.role === UserRole.ADMIN && (
            <SidebarLink to="/admin/users" icon={ShieldCheck}>Usuarios (Admin)</SidebarLink>
          )}
          <SidebarLink to="/settings" icon={SettingsIcon}>Configuración</SidebarLink>
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 mb-4 border border-slate-100">
            <div className="w-10 h-10 bg-[#0B3C5D] text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-900/10">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-[#2E2E2E] truncate">{user?.name}</p>
              <p className="text-[9px] text-[#0B3C5D] font-black uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-600 transition-colors text-xs font-black uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-black uppercase border border-emerald-100">AXIS {user?.role}</span>
            <span className="text-slate-200">/</span>
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest">Workspace Activo</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/tasks" className="relative p-2 text-slate-400 hover:text-[#0B3C5D] transition-colors group">
              <Bell className="w-5 h-5" />
              {overdueCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C0392B] text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white ring-4 ring-red-500/5">
                  {overdueCount}
                </span>
              )}
            </Link>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <span className="text-sm font-bold text-[#2E2E2E] group-hover:text-[#0B3C5D] transition-colors">Workspace Central</span>
              <User className="w-5 h-5 text-slate-300 group-hover:text-[#0B3C5D] transition-colors" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/contacts" element={<ContactList />} />
            <Route path="/contacts/new" element={<ContactForm />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/contacts/:id/edit" element={<ContactForm />} />
            <Route path="/tasks" element={<GlobalTasks />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/admin/users" element={user?.role === UserRole.ADMIN ? <UserManagement /> : <Navigate to="/" />} />
            <Route path="/settings" element={<div className="p-12 text-center text-slate-400 italic">Panel de configuración de AXIS CRM</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('axis_session');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, pass: string) => {
    // Simulacro de Login
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('axis_session', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string) => {
    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: UserRole.USER
    };
    setUser(newUser);
    localStorage.setItem('axis_session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('axis_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <AuthPage mode="register" />} />
          <Route path="/*" element={<PrivateRoute><MainLayout /></PrivateRoute>} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
