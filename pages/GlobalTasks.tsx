
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/dbService';
import { Calendar, Clock, User, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Task, UserRole } from '../types';
import { useAuth } from '../App';

const GlobalTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    setTasks(db.getTasks());
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (user?.role !== UserRole.ADMIN && task.ownerId !== user?.id) return false;
      if (filter === 'pending') return !task.isCompleted;
      if (filter === 'completed') return task.isCompleted;
      return true;
    });
  }, [tasks, filter, user]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda de Seguimiento</h1>
          <p className="text-slate-500">Gestiona tus compromisos comerciales.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border">
          {['all', 'pending', 'completed'].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map(task => (
          <div key={task.id} className={`bg-white p-5 rounded-2xl border ${task.isCompleted ? 'border-emerald-100 bg-emerald-50/10 opacity-75' : 'border-slate-100'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{task.channel}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                <div className="flex items-center gap-6 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {task.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {task.time}</span>
                  <Link to={`/contacts/${task.contactId}`} className="text-indigo-600 font-bold hover:underline">Ver Contacto</Link>
                </div>
              </div>
              {task.isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-200" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalTasks;
