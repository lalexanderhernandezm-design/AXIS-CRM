
import React, { useState } from 'react';
import { analyzeDataWithIA } from '../services/geminiService';
import { IAInsight } from '../types';
import { Sparkles, AlertTriangle, Lightbulb, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

interface IAInsightPanelProps {
  title: string;
  data: any;
}

const IAInsightPanel: React.FC<IAInsightPanelProps> = ({ title, data }) => {
  const [insight, setInsight] = useState<IAInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setIsOpen(true);
    const result = await analyzeDataWithIA(title, data);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="mt-4 border border-indigo-100 rounded-xl bg-white shadow-sm overflow-hidden">
      <div 
        className="p-4 bg-indigo-50 flex items-center justify-between cursor-pointer hover:bg-indigo-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">Análisis IA: {title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {!insight && !loading && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Generar Insights
            </button>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-indigo-600 font-medium italic">Gemini está analizando las métricas comerciales...</p>
            </div>
          ) : insight ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4" /> Hallazgos Clave
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {insight.findings.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Interpretación
                </div>
                <p className="text-sm text-slate-600 italic">"{insight.interpretation}"</p>
              </div>

              {insight.alerts.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1 text-red-800 font-bold text-xs uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alertas Críticas
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-red-700">
                    {insight.alerts.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <h4 className="font-bold text-emerald-900 text-sm mb-3">Recomendaciones Accionables</h4>
                  <ul className="space-y-2">
                    {insight.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-emerald-800">
                        <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Siguientes pasos sugeridos</h4>
                  <ul className="space-y-2">
                    {insight.suggestedQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-slate-600 hover:text-indigo-600 cursor-pointer">
                        ? {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-slate-400 py-4 italic">Haz clic en el botón superior para que la IA procese estos datos.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IAInsightPanel;
