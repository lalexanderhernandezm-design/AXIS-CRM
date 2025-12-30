
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/dbService';
import { CHANNELS } from '../constants';
import { calculateLeadScore } from '../services/geminiService';
import { useAuth } from '../App';
import { 
  ChevronLeft, Phone, Mail, MessageSquare, Paperclip, Star, TrendingUp,
  Loader2, RefreshCw, Clock, Plus, CheckCircle, FileText, X, AlertCircle,
  MessageCircle, PhoneCall, MailCheck, MapPin, Edit3
} from 'lucide-react';
import { LeadScore, Task, Interaction, UserRole, Contact } from '../types';

const ContactDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'tasks'>('timeline');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);

  const now = new Date();
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (id) {
      const c = db.getContacts().find(x => x.id === id);
      if (c) {
        setContact(c);
        setTasks(db.getTasks(id));
        setInteractions(db.getInteractions(id));
      }
    }
  }, [id]);

  const [newTask, setNewTask] = useState({
    title: '', date: new Date().toISOString().split('T')[0], time: '09:00', channel: CHANNELS[0].name, description: ''
  });

  const [newComment, setNewComment] = useState({ summary: '', channel: CHANNELS[0].name, files: [] as any[] });
  const [fulfillment, setFulfillment] = useState({ description: '', files: [] as any[] });
  const [aiScore, setAiScore] = useState<LeadScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const unifiedTimeline = useMemo(() => {
    const timelineItems = [
      ...interactions.map(i => ({ ...i, sortDate: i.timestamp, uiType: 'interaction' as const })),
      ...tasks.map(t => ({ ...t, sortDate: `${t.date}T${t.time}:00Z`, uiType: 'task' as const }))
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
    if (!id) return;
    const task: Partial<Task> = {
      contactId: id,
      ownerId: user?.id || contact?.ownerId || 'unknown',
      ...newTask,
      isCompleted: false
    };
    db.saveTask(task);
    setTasks(db.getTasks(id));
    setShowTaskForm(false);
  };

  const handleCreateComment = () => {
    if (!newComment.summary || !id) return;
    const interaction: Interaction = {
      id: `i-${Date.now()}`,
      contactId: id,
      ownerId: user?.id || contact?.ownerId || 'unknown',
      timestamp: new Date().toISOString(),
      channel: newComment.channel,
      summary: newComment.summary,
      attachments: newComment.files.map(f => f.name),
      type: 'interaction'
    };
    db.saveInteraction(interaction);
    setInteractions(db.getInteractions(id));
    setShowCommentForm(false);
    setNewComment({ summary: '', channel: CHANNELS[0].name, files: [] });
  };

  if (!contact) return <div className="p-10 text-center text-slate-500 font-medium">Cargando contacto...</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between mb-6">
        <Link to="/contacts" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Pipeline
        </Link>
        <Link to={`/contacts/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-xs font-black shadow-sm">
          <Edit3 className="w-4 h-4" /> Editar Datos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#0B3C5D] text-white flex items-center justify-center rounded-2xl text-2xl font-black">
                {contact.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2E2E2E]">{contact.name}</h2>
                <p className="text-slate-500 text-sm font-medium">{contact.companyName}</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /> {contact.email}</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /> {contact.phone}</div>
              <div className="pt-4 border-t border-slate-50">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${contact.status === 'Convertido' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-[#0B3C5D]'}`}>
                  {contact.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Score IA
              </h3>
              <button onClick={handleAnalyzeConversion} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600">
                {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
            </div>
            {aiScore ? (
              <div className="flex gap-1.5 justify-center py-2">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-7 h-7 ${s <= aiScore.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />)}
              </div>
            ) : <p className="text-[10px] text-slate-400 text-center italic">Solicita análisis predictivo</p>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setActiveTab('timeline')} className={`px-4 py-2 rounded-lg text-xs font-black ${activeTab === 'timeline' ? 'bg-white text-[#0B3C5D] shadow-sm' : 'text-slate-500'}`}>Timeline</button>
              <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-lg text-xs font-black ${activeTab === 'tasks' ? 'bg-white text-[#0B3C5D] shadow-sm' : 'text-slate-500'}`}>Tareas ({tasks.filter(t => !t.isCompleted).length})</button>
            </div>
            <button onClick={() => setShowCommentForm(true)} className="px-4 py-2 bg-[#0B3C5D] text-white rounded-xl text-xs font-black shadow-lg">Registrar Gestión</button>
          </div>

          {activeTab === 'timeline' ? (
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-1 before:bg-slate-50">
              {showCommentForm && (
                <div className="bg-white p-6 rounded-3xl border-2 border-indigo-100 shadow-xl ml-12 mb-8">
                  <textarea 
                    className="w-full p-4 bg-slate-50 border rounded-2xl text-sm outline-none"
                    placeholder="Resultado de la gestión..."
                    value={newComment.summary}
                    onChange={e => setNewComment({...newComment, summary: e.target.value})}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <select className="bg-white border rounded-lg text-xs p-1" value={newComment.channel} onChange={e => setNewComment({...newComment, channel: e.target.value})}>
                      {CHANNELS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <button onClick={handleCreateComment} className="px-6 py-2 bg-[#0B3C5D] text-white rounded-lg text-xs font-bold">Guardar</button>
                  </div>
                </div>
              )}
              {unifiedTimeline.map((item, idx) => (
                <div key={idx} className="relative pl-12 group">
                  <div className={`absolute left-2 top-2 w-5 h-5 rounded-full border-4 border-white z-10 ${item.uiType === 'task' ? 'bg-amber-500' : 'bg-[#0B3C5D]'}`}></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-600">{item.channel}</span>
                      <span className="text-[9px] text-slate-400">{new Date(item.sortDate).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{item.uiType === 'task' ? (item as any).title : item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="py-10 text-center text-slate-300 italic">Módulo de tareas bajo demanda.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
