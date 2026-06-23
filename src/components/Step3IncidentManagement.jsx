import React from 'react';
import { Ticket, User, Clock, AlertTriangle } from 'lucide-react';

function Step3IncidentManagement({ simState }) {
  return (
    <div className="flex flex-col h-full">
      <div className="panel-header mb-4">
        <TicketIcon /> Gestión de Incidentes (ITIL v4)
      </div>
      <p className="text-muted mb-6">
        El motor de reglas de la plataforma evalúa el pico de eventos y el SLA comprometido, transicionando automáticamente 
        la alerta informativa a un Incidente Crítico asignado al equipo móvil.
      </p>

      <div className="panel flex-1">
        <div className="border-b border-border-color pb-4 mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Cola de Incidentes Activos</h2>
          <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">Mostrando: Abiertos</span>
        </div>

        {!simState.crashed ? (
          <div className="text-center text-muted py-12">
             No hay incidentes críticos actuales. El sistema opera dentro del SLA esperado.
          </div>
        ) : (
          <div className={`border ${simState.resolved ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'} rounded-lg p-6`}>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${simState.resolved ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    PRIORIDAD: ALTA
                  </span>
                  <span className="text-lg font-bold text-cyan">#INC-2026-0892</span>
                </div>
                <h3 className="text-xl font-bold text-main mb-1">
                  Crash Masivo - OutOfMemory en módulo de sincronización
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1"><AlertTriangle size={14}/> Región: Piura</span>
                  <span className="flex items-center gap-1"><User size={14}/> Asignado a: Equipo Desarrollo Móvil</span>
                  <span className="flex items-center gap-1"><Clock size={14}/> Creado: Automático (Hace 2 min)</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-muted mb-1">ESTADO</div>
                <div className={`text-xl font-bold ${simState.resolved ? 'text-green' : 'text-orange'}`}>
                  {simState.resolved ? 'RESUELTO' : 'ASIGNADO'}
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded p-4 border border-border-color">
              <h4 className="text-sm font-bold text-muted mb-2">TRAZA TÉCNICA ADJUNTA (Automática)</h4>
              <pre className="text-xs text-red-400 font-mono overflow-x-auto">
{`Exception in thread 'main' java.lang.OutOfMemoryError: 
Failed to allocate a 157286400 byte allocation with 4194304 free bytes
  at com.corp.app.DataSyncController.sync(DataSyncController.java:45)
  at com.corp.app.MainActivity.onSyncClick(MainActivity.java:112)`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
);

export default Step3IncidentManagement;
