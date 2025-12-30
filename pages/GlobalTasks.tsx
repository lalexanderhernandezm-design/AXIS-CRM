
import React, { useState, useMemo } from 'react';
import { MOCK_TASKS, CHANNELS } from '../constants';
import { 
  Calendar, Clock, User, CheckCircle2, Circle, FileText, 
  X, Paperclip, Send, Loader2, AlertTriangle, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Task, UserRole } from '../types';
import { useAuth } from '../App';

const GlobalTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [fulfillment, setFulfillment] = useState({
    description: '',
    files: [] as { name: string, type: string }[]
  });
  const [isSaving, setIsSaving] = useState(false);

  const now = new Date();

  const getTaskStatus = (task: Task) => {
    if (task.isCompleted) return 'completed';
    const taskDate = new Date(`${task.date}T${task.time}:00`);
    if (taskDate < now) return 'overdue';
    const diff = taskDate.getTime() - now.getTime();
    if (diff > 0 && diff < 24 * 60 * 60 * 1000) return 'due_soon';
    return 'upcoming';
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtro por Usuario
      if (user?.role !== UserRole.ADMIN && task.ownerId !== user?.id) return false;

      // Filtro por Estado
      const status = getTaskStatus(task);
      if (filter === 'pending') return !task.isCompleted;
      if (filter === 'completed') return task.isCompleted;
      if (filter === 'overdue') return status === 'overdue';
      return true;
    });
  }, [tasks, filter, user]);

  const handleFileSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: File) => ({ name: f.name, type: f.type }));
      setFulfillment(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const handleCompleteTask = () => {
    if (!completingTask) return;
    setIsSaving(true);
    
    setTimeout(() => {
      const updatedTasks = tasks.map(t => 
        t.id === completingTask.id 
        ? { 
            ...t, 
            isCompleted: true, 
            fulfillmentDescription: fulfillment.description, 
            attachments: fulfillment.files 
          } 
        : t
      );
      
      setTasks(updatedTasks);
      setIsSaving(false);
      setCompletingTask(null);
      setFulfillment({ description: '', files: [] });
    }, 600);
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda de Seguimiento</h1>
          <p className="text-slate-500">Visualiza y gestiona todas las tareas programadas.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'Todas', color: 'indigo' },
            { id: 'pending', label: 'Pendientes', color: 'amber' },
            { id: 'overdue', label: 'Vencidas', color: 'red' },
            { id: 'completed', label: 'Completadas', color: 'emerald' },
          ].map((btn) => (
            <button 
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === btn.id 
                ? `bg-${btn.color === 'indigo' ? 'indigo-600' : btn.color + '-600'} text-white shadow-md` 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map(task => {
          const status = getTaskStatus(task);
          const isOverdue = status === 'overdue';
          const isDueSoon = status === 'due_soon';
          
          return (
            <div 
              key={task.id} 
              className={`bg-white p-5 rounded-2xl border transition-all ${
                task.isCompleted 
                  ? 'border-emerald-100 bg-emerald-50/10 opacity-75' 
                  : isOverdue 
                    ? 'border-red-200 bg-red-50/40 shadow-sm shadow-red-100 ring-1 ring-red-500/20' 
                    : isDueSoon
                      ? 'border-amber-200 bg-amber-50/40 shadow-sm'
                      : 'border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${
                      task.isCompleted 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isOverdue 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : isDueSoon
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {isOverdue ? <AlertCircle className="w-2.5 h-2.5" /> : isDueSoon ? <Clock className="w-2.5 h-2.5" /> : null}
                      {task.isCompleted ? 'Ejecutada' : isOverdue ? 'Vencida' : isDueSoon ? 'Próxima a vencer' : 'Pendiente'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{task.channel}</span>
                    {user?.role === UserRole.ADMIN && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black uppercase">Owner: {task.ownerId}</span>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${task.isCompleted ? 'text-slate-500' : isOverdue ? 'text-red-900' : 'text-slate-900'}`}>{task.title}</h3>
                  <p className={`text-sm mb-4 ${task.isCompleted ? 'text-slate-400' : isOverdue ? 'text-red-700/70' : 'text-slate-500'}`}>{task.description}</p>
                  
                  <div className={`flex flex-wrap items-center gap-6 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {task.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {task.time}
                    </div>
                    <Link to={`/contacts/${task.contactId}`} className={`flex items-center gap-1.5 font-bold hover:underline ${isOverdue ? 'text-red-700' : 'text-indigo-600'}`}>
                      <User className="w-3.5 h-3.5" /> {task.contactName}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <button 
                      onClick={() => setCompletingTask(task)}
                      className="group relative"
                      title="Marcar como completada"
                    >
                      <Circle className={`w-8 h-8 transition-colors ${isOverdue ? 'text-red-300 group-hover:text-red-500' : 'text-slate-200 group-hover:text-emerald-400'}`} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Send className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-emerald-600'}`} />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
              <div>
                <h3 className="text-lg font-bold text-emerald-900">Cerrar Actividad</h3>
                <p className="text-xs text-emerald-600 font-medium">{completingTask.title}</p>
              </div>
              <button 
                onClick={() => setCompletingTask(null)}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Descripción del cumplimiento *</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all min-h-[120px] text-sm leading-relaxed"
                  placeholder="Explica detalladamente cómo se resolvió esta tarea..."
                  value={fulfillment.description}
                  onChange={e => setFulfillment({...fulfillment, description: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Evidencias y Documentos (PDF / Imagen)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {fulfillment.files.map((f, i) => (
                    <div key={i} className="px-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] flex items-center gap-2 text-emerald-700 animate-in scale-95 duration-200">
                      <FileText className="w-3.5 h-3.5" /> {f.name}
                      <button onClick={() => setFulfillment(prev => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }))}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-400 transition-all group">
                  <Paperclip className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-emerald-600">Adjuntar archivos de cumplimiento</span>
                  <input type="file" className="hidden" multiple onChange={handleFileSim} accept="image/*,application/pdf" />
                </label>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setCompletingTask(null)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCompleteTask}
                disabled={!fulfillment.description || isSaving}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Registrar Cumplimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No hay tareas que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default GlobalTasks;
