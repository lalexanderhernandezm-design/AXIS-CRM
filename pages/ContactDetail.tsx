
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_CONTACTS, MOCK_INTERACTIONS, MOCK_TASKS, CHANNELS } from '../constants';
import { calculateLeadScore } from '../services/geminiService';
// Added useAuth import to access current user session
import { useAuth } from '../App';
import { 
  ChevronLeft, Phone, Mail, Globe, History, MessageSquare, 
  Paperclip, Send, Calendar, Star, TrendingUp,
  Loader2, RefreshCw, Clock, Plus, CheckCircle, FileText, X, AlertCircle,
  MessageCircle, PhoneCall, MailCheck, MapPin, Edit3
} from 'lucide-react';
import { ContactStatus, LeadScore, Task, Interaction, UserRole } from '../types';

const ContactDetail: React.FC = () => {
  // Added useAuth hook to get current user
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const contact = MOCK_CONTACTS.find(c => c.id === id);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS.filter(t => t.contactId === id));
  const [interactions, setInteractions] = useState<Interaction[]>(MOCK_INTERACTIONS.filter(i => i.contactId === id));
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks'>('timeline');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);

  const now = new Date();
  const isAdmin = user?.role === UserRole.ADMIN;

  // Estados para nueva tarea
  const [newTask, setNewTask] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    channel: CHANNELS[0].name,
    description: ''
  });

  // Estados para nuevo comentario (Interacción manual)
  const [newComment, setNewComment] = useState({
    summary: '',
    channel: CHANNELS[0].name,
    files: [] as { name: string, type: string }[]
  });

  const [fulfillment, setFulfillment] = useState({
    description: '',
    files: [] as { name: string, type: string }[]
  });

  const [aiScore, setAiScore] = useState<LeadScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getTaskStatus = (task: Task) => {
    if (task.isCompleted) return 'completed';
    const taskDate = new Date(`${task.date}T${task.time}:00`);
    if (taskDate < now) return 'overdue';
    const diff = taskDate.getTime() - now.getTime();
    if (diff > 0 && diff < 24 * 60 * 60 * 1000) return 'due_soon';
    return 'upcoming';
  };

  const unifiedTimeline = useMemo(() => {
    const timelineItems = [
      ...interactions.map(i => ({ 
        ...i, 
        sortDate: i.timestamp, 
        uiType: 'interaction' as const 
      })),
      ...tasks.map(t => ({ 
        ...t, 
        sortDate: `${t.date}T${t.time}:00Z`, 
        uiType: 'task' as const 
      }))
    ];
    return timelineItems.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
  }, [interactions, tasks]);

  const handleAnalyzeConversion = async () => {
    if (!contact) return;
    setIsAnalyzing(true);
    const result = await calculateLeadScore(contact, interactions);
    setAiScore(result);
    setIsAnalyzing(false);
  };

  const handleCreateTask = () => {
    // Fixed: Added ownerId to new tasks
    const task: Task = {
      id: `t-${Date.now()}`,
      contactId: id!,
      ownerId: user?.id || contact?.ownerId || 'unknown',
      ...newTask,
      isCompleted: false
    };
    setTasks([task, ...tasks]);
    setShowTaskForm(false);
    setNewTask({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', channel: CHANNELS[0].name, description: '' });
  };

  const handleCreateComment = () => {
    if (!newComment.summary) return;
    
    // Fixed: Added missing ownerId to interaction object (Fixes Error on line 99)
    const interaction: Interaction = {
      id: `i-${Date.now()}`,
      contactId: id!,
      ownerId: user?.id || contact?.ownerId || 'unknown',
      timestamp: new Date().toISOString(),
      channel: newComment.channel,
      summary: newComment.summary,
      attachments: newComment.files.map(f => f.name),
      type: 'interaction'
    };

    setInteractions([interaction, ...interactions]);
    setShowCommentForm(false);
    setNewComment({ summary: '', channel: CHANNELS[0].name, files: [] });
  };

  const handleCompleteTask = () => {
    if (!completingTask) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === completingTask.id 
      ? { ...t, isCompleted: true, fulfillmentDescription: fulfillment.description, attachments: fulfillment.files } 
      : t
    );
    
    setTasks(updatedTasks);
    
    // Fixed: Added missing ownerId to interaction object when completing a task (Fixes Error on line 125)
    const newInt: Interaction = {
      id: `i-${Date.now()}`,
      contactId: id!,
      ownerId: user?.id || completingTask.ownerId,
      timestamp: new Date().toISOString(),
      channel: completingTask.channel,
      summary: `[Tarea Completada: ${completingTask.title}] ${fulfillment.description}`,
      type: 'task',
      attachments: fulfillment.files.map(f => f.name)
    };
    setInteractions([newInt, ...interactions]);
    
    setCompletingTask(null);
    setFulfillment({ description: '', files: [] });
  };

  const handleFileSim = (e: React.ChangeEvent<HTMLInputElement>, target: 'comment' | 'fulfillment') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => ({ name: f.name, type: f.type }));
      if (target === 'comment') {
        setNewComment(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
      } else {
        setFulfillment(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
      }
    }
  };

  if (!contact) return <div className="p-10 text-center text-slate-500 font-medium">Contacto no encontrado.</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between mb-6">
        <Link to="/contacts" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver a la lista
        </Link>
        {isAdmin && (
          <Link 
            to={`/contacts/${id}/edit`} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all shadow-sm"
          >
            <Edit3 className="w-4 h-4" /> Editar Datos Maestro
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Perfil Básico */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#0B3C5D] text-white flex items-center justify-center rounded-2xl text-2xl font-black shadow-lg shadow-blue-900/10">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[#2E2E2E] truncate">{contact.name}</h2>
                <p className="text-slate-500 truncate text-sm font-medium">{contact.companyName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-slate-600 truncate font-medium">{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-slate-600 font-medium">{contact.phone}</span>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado de Pipeline</p>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block ${
                  contact.status === 'Convertido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  contact.status === 'Prospecto' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                  'bg-indigo-50 text-[#0B3C5D] border border-indigo-100'
                }`}>
                  {contact.status}
                </span>
              </div>
            </div>
          </div>

          {/* AI Calificación */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500 opacity-50"></div>
             <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Potencial de Cierre
              </h3>
              <button onClick={handleAnalyzeConversion} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
            </div>
            {aiScore ? (
              <div className="flex flex-col items-center py-2 relative z-10">
                <div className="flex gap-1.5 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-7 h-7 ${s <= aiScore.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-100 fill-slate-50'}`} />)}
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase">Calificación Predictiva AXIS</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 text-center italic py-4">Haz clic en el icono de actualizar para analizar con IA</p>
            )}
          </div>
        </div>

        {/* Timeline & Tareas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-inner">
              <button 
                onClick={() => setActiveTab('timeline')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'timeline' ? 'bg-white text-[#0B3C5D] shadow-md border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Línea de Tiempo
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'tasks' ? 'bg-white text-[#0B3C5D] shadow-md border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tareas ({tasks.filter(t => !t.isCompleted).length})
              </button>
            </div>
            
            {activeTab === 'timeline' && (
              <button 
                onClick={() => setShowCommentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0B3C5D] text-white rounded-xl text-xs font-black hover:bg-[#1F6FA8] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" /> Registrar Comentario
              </button>
            )}
          </div>

          {activeTab === 'timeline' ? (
            <div className="space-y-6">
              {/* Formulario de Comentario / Interacción */}
              {showCommentForm && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-indigo-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-black text-[#0B3C5D] text-sm uppercase tracking-widest">Nueva Bitácora</h4>
                      <p className="text-xs text-slate-400 font-medium">Registro manual de interacción con el cliente.</p>
                    </div>
                    <button onClick={() => setShowCommentForm(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Canal utilizado</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CHANNELS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setNewComment({...newComment, channel: c.name})}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                              newComment.channel === c.name 
                                ? 'border-[#0B3C5D] bg-blue-50/50 text-[#0B3C5D]' 
                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                            }`}
                          >
                            {c.name === 'WhatsApp' && <MessageCircle className="w-5 h-5" />}
                            {c.name === 'Llamada' && <PhoneCall className="w-5 h-5" />}
                            {c.name === 'Mail' && <MailCheck className="w-5 h-5" />}
                            {c.name === 'Visita' && <MapPin className="w-5 h-5" />}
                            <span className="text-[10px] font-black uppercase tracking-tighter">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Contenido del Comentario *</label>
                      <textarea 
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-[#0B3C5D] text-sm font-medium leading-relaxed min-h-[120px]"
                        placeholder="Escribe aquí los detalles clave de la comunicación..."
                        value={newComment.summary}
                        onChange={e => setNewComment({...newComment, summary: e.target.value})}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {newComment.files.map((f, i) => (
                          <div key={i} className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] flex items-center gap-2 text-indigo-700 font-bold">
                            <FileText className="w-3.5 h-3.5" /> {f.name}
                            <button onClick={() => setNewComment(prev => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }))}>
                              <X className="w-3.5 h-3.5 hover:text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-indigo-200 rounded-3xl cursor-pointer hover:bg-indigo-50/30 transition-all group">
                        <Paperclip className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <span className="text-xs font-black text-indigo-600 block uppercase tracking-widest">Adjuntar Archivos</span>
                          <span className="text-[10px] text-slate-400 font-medium">Imágenes o PDFs de la gestión</span>
                        </div>
                        <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={(e) => handleFileSim(e, 'comment')} />
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={handleCreateComment}
                      disabled={!newComment.summary}
                      className="px-10 py-4 bg-[#0B3C5D] text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-[#1F6FA8] disabled:opacity-30 active:scale-95 transition-all"
                    >
                      Guardar en Bitácora
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
                {unifiedTimeline.map((item, idx) => {
                  const status = item.uiType === 'task' ? getTaskStatus(item as Task) : null;
                  const isOverdue = status === 'overdue';
                  
                  return (
                    <div key={idx} className="relative pl-12 group">
                      <div className={`absolute left-2 top-1.5 w-5 h-5 rounded-full border-4 border-white z-10 shadow-sm transition-transform group-hover:scale-125 ${
                        item.uiType === 'task' 
                          ? (item.isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-red-600 ring-2 ring-red-100' : 'bg-amber-500') 
                          : 'bg-[#0B3C5D]'
                      }`}></div>
                      <div className={`bg-white p-6 rounded-[24px] shadow-sm border transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50/10' : 'border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg flex items-center gap-1.5 tracking-widest border ${
                              item.uiType === 'task' 
                                ? (item.isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : isOverdue ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-100') 
                                : 'bg-blue-50 text-[#0B3C5D] border-blue-100'
                            }`}>
                              {isOverdue && <AlertCircle className="w-3 h-3" />}
                              {item.uiType === 'task' ? (item.isCompleted ? 'Tarea Ejecutada' : isOverdue ? 'Vencida' : 'Agenda Pendiente') : 'Bitácora Manual'}
                            </span>
                            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.channel}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                               {new Date(item.sortDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                             </span>
                             <span className="text-[9px] font-bold text-slate-300">
                               {new Date(item.sortDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                        </div>
                        
                        <h4 className={`text-base font-bold mb-2 leading-tight ${isOverdue ? 'text-red-900' : 'text-[#2E2E2E]'}`}>
                          {item.uiType === 'task' ? item.title : item.summary}
                        </h4>
                        {item.uiType === 'task' && <p className={`text-sm mb-3 font-medium leading-relaxed ${isOverdue ? 'text-red-700/70' : 'text-slate-500'}`}>{item.description}</p>}
                        
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {item.attachments.map((file, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 group/file cursor-pointer hover:bg-white hover:border-[#0B3C5D] transition-all">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="max-w-[120px] truncate">{file}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.uiType === 'task' && item.isCompleted && item.fulfillmentDescription && (
                          <div className="mt-4 p-4 bg-emerald-50/30 rounded-2xl text-sm text-emerald-800 border border-emerald-100 italic leading-relaxed">
                            <span className="font-black uppercase text-[9px] block mb-2 opacity-60">Reporte de Cierre:</span>
                            {item.fulfillmentDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-[#2E2E2E] uppercase text-[10px] tracking-[0.2em]">Agenda de Seguimiento</h3>
                <button 
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Nueva Tarea
                </button>
              </div>

              {showTaskForm && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-indigo-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between mb-6">
                    <h4 className="font-black text-[#0B3C5D] text-sm uppercase tracking-widest">Agendar nueva tarea</h4>
                    <button onClick={() => setShowTaskForm(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Título de la actividad</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-indigo-600"
                        placeholder="Ej. Enviar cotización final"
                        value={newTask.title}
                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha</label>
                      <input 
                        type="date" 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                        value={newTask.date}
                        onChange={e => setNewTask({...newTask, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora</label>
                      <input 
                        type="time" 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                        value={newTask.time}
                        onChange={e => setNewTask({...newTask, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Canal de contacto</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                      value={newTask.channel}
                      onChange={e => setNewTask({...newTask, channel: e.target.value})}
                    >
                      {CHANNELS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-8">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Notas previas</label>
                    <textarea 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium min-h-[100px] outline-none"
                      placeholder="Detalles de lo que se debe hacer..."
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={handleCreateTask}
                    className="w-full py-4 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Programar Actividad
                  </button>
                </div>
              )}

              {completingTask && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-emerald-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                   <div className="flex justify-between mb-6">
                    <h4 className="font-black text-emerald-800 text-sm uppercase tracking-widest">Cerrar Tarea: {completingTask.title}</h4>
                    <button onClick={() => setCompletingTask(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-emerald-700 uppercase block mb-2 tracking-widest">Resultado de la gestión</label>
                    <textarea 
                      className="w-full p-5 bg-emerald-50/30 border border-emerald-100 rounded-3xl text-sm font-medium leading-relaxed min-h-[120px] outline-none focus:ring-4 focus:ring-emerald-600/5"
                      placeholder="¿Qué se logró en esta actividad?"
                      value={fulfillment.description}
                      onChange={e => setFulfillment({...fulfillment, description: e.target.value})}
                    />
                  </div>
                  <div className="mb-8">
                    <label className="text-[10px] font-black text-emerald-700 uppercase block mb-2 tracking-widest">Evidencias Adjuntas</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {fulfillment.files.map((f, i) => (
                        <div key={i} className="px-3 py-2 bg-white border border-emerald-200 rounded-xl text-[10px] font-black text-emerald-700 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> {f.name}
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-emerald-200 rounded-3xl cursor-pointer hover:bg-emerald-50 transition-colors group">
                      <Paperclip className="w-5 h-5 text-emerald-500 group-hover:rotate-12 transition-transform" />
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Subir Archivos</span>
                      <input type="file" className="hidden" multiple onChange={(e) => handleFileSim(e, 'fulfillment')} />
                    </label>
                  </div>
                  <button 
                    onClick={handleCompleteTask}
                    disabled={!fulfillment.description}
                    className="w-full py-4 bg-emerald-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 disabled:opacity-30 active:scale-95 transition-all"
                  >
                    Guardar y Finalizar
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {tasks.filter(t => !t.isCompleted).map(task => {
                  const status = getTaskStatus(task);
                  const isOverdue = status === 'overdue';
                  const isDueSoon = status === 'due_soon';

                  return (
                    <div key={task.id} className={`p-6 rounded-[24px] border flex items-start justify-between transition-all group hover:shadow-md ${
                      isOverdue 
                        ? 'bg-red-50/40 border-red-200 shadow-sm shadow-red-100' 
                        : isDueSoon
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-white border-slate-100 shadow-sm'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1.5 border ${
                            isOverdue ? 'bg-red-600 text-white border-red-700' : isDueSoon ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            {isOverdue && <AlertCircle className="w-3 h-3" />}
                            {task.channel}
                          </span>
                          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${isOverdue ? 'text-red-700' : 'text-slate-400'}`}>
                            <Clock className="w-3.5 h-3.5" /> {new Date(task.date).toLocaleDateString()} - {task.time}
                          </div>
                        </div>
                        <h4 className={`font-bold text-base mb-1 ${isOverdue ? 'text-red-900' : 'text-[#2E2E2E]'}`}>{task.title}</h4>
                        <p className={`text-sm font-medium ${isOverdue ? 'text-red-700/60' : 'text-slate-500'}`}>{task.description}</p>
                      </div>
                      <button 
                        onClick={() => setCompletingTask(task)}
                        className={`ml-6 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          isOverdue 
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        Completar
                      </button>
                    </div>
                  );
                })}
                
                {tasks.filter(t => !t.isCompleted).length === 0 && !showTaskForm && (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 rounded-[32px]">
                    <Calendar className="w-12 h-12 opacity-30" />
                    <p className="text-sm font-black uppercase tracking-widest opacity-50 italic">Sin tareas pendientes</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
