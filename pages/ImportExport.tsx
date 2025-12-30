
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Download } from 'lucide-react';

const ImportExport: React.FC = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Importar / Exportar Datos</h1>
        <p className="text-slate-500">Maneja tu base de datos de forma masiva.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Importación Masiva</h3>
          <p className="text-sm text-slate-500 mb-6">Sube tus contactos desde un archivo CSV o Excel. Nuestro asistente te ayudará a mapear las columnas.</p>
          <label className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium shadow-sm">
            Subir Archivo
            <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
          </label>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Exportar Base de Datos</h3>
          <p className="text-sm text-slate-500 mb-6">Descarga toda tu base de contactos actual con filtros aplicados para reportes externos.</p>
          <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm">
            Generar Descarga
          </button>
        </div>
      </div>

      {step === 2 && file && (
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-slate-900">{file.name}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded uppercase font-bold">List para procesar</span>
              </div>
              <button className="text-xs text-red-600 hover:underline" onClick={() => setStep(1)}>Cancelar</button>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
              <span>Columna en Archivo</span>
              <ArrowRight className="w-4 h-4" />
              <span>Campo en CRM</span>
            </div>

            <div className="space-y-4">
              {[
                { original: 'Name', mapped: 'Nombre (obligatorio)', status: 'success' },
                { original: 'Company', mapped: 'Empresa (obligatorio)', status: 'success' },
                { original: 'E-mail', mapped: 'Correo Electrónico', status: 'success' },
                { original: 'Source', mapped: 'Origen del contacto', status: 'warning' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-medium text-slate-700">{row.original}</div>
                  <div className="flex items-center gap-2">
                    {row.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                    <select className="bg-white border border-slate-200 rounded-lg p-1 text-sm outline-none w-48">
                      <option>{row.mapped}</option>
                      <option>Nombre</option>
                      <option>Empresa</option>
                      <option>Teléfono</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">Previsualizar Datos</button>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">Iniciar Importación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExport;
