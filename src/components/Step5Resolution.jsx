import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Terminal } from 'lucide-react';

function Step5Resolution({ simState, resolveIncident }) {
  const [deploying, setDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  const fetchIncidentes = async () => {
    try {
      setLoadingIncidents(true);
      const res = await fetch('http://localhost:3001/api/incidentes');
      const data = await res.json();
      setActiveIncidents(data || []);
    } catch (err) {
      console.error('Error fetching incidentes en resolución:', err);
    } finally {
      setLoadingIncidents(false);
    }
  };

  useEffect(() => {
    fetchIncidentes();
  }, []);

  const activeIncidentsOpen = activeIncidents.filter(
    inc => inc.fecha_resolucion === '0' || inc.fecha_resolucion === 0 || inc.fecha_resolucion === null
  );
  const hasActiveIncident = activeIncidentsOpen.length > 0;
  const activeIncidentCodes = activeIncidentsOpen.map(inc => inc.codigo).join(', ');

  const handleDeploy = () => {
    setDeploying(true);
    const incidentCount = activeIncidentsOpen.length;
    const logs = [
      "Iniciando despliegue de Hotfix v2.1.4 (Batching Sync)...",
      "Compilando artefactos móviles...",
      "Ejecutando pruebas unitarias de gestión de memoria: PASSED",
      "Publicando actualización OTA (Over-The-Air) para región Piura...",
      "Actualización distribuida a 450 dispositivos.",
      "Recibiendo telemetría limpia...",
      "Indicador de usuarios libres de fallos recuperado a 99.6%.",
      `Cerrando ${incidentCount} incidente(s): ${activeIncidentCodes}`
    ];

    logs.forEach((log, i) => {
      setTimeout(async () => {
        setDeployLogs(prev => [...prev, log]);
        if (i === logs.length - 1) {
          setDeploying(false);
          await resolveIncident();
          fetchIncidentes();
        }
      }, i * 800);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header mb-4">
        <CheckCircleIcon /> Resolución y Normalización del Sistema
      </div>
      <p className="text-muted mb-6">
        El equipo de desarrollo ha modificado el algoritmo para realizar cargas en lotes paginados (batching).
        Despliega el hotfix para observar cómo los indicadores retornan a la normalidad.
      </p>

      <div className="flex gap-6 h-full">
        <div className="panel flex-1 flex flex-col items-center justify-center text-center">
          
          {!hasActiveIncident ? (
            simState.resolved ? (
              <div className="text-green flex flex-col items-center">
                <CheckCircle2 size={64} className="mb-4" />
                <h2 className="text-2xl font-bold mb-2">Incidente Resuelto Exitosamente</h2>
                <p className="text-muted text-sm">
                  La disponibilidad volvió a 99.6%. El incidente ha sido documentado
                  en la Base de Conocimientos de Errores Conocidos.
                </p>
              </div>
            ) : (
              <div className="text-muted">El sistema está operando con normalidad. No hay incidentes activos ni parches pendientes.</div>
            )
          ) : (
            <div className="flex flex-col items-center w-full max-w-md">
              <div className="bg-[#0f172a] border border-border-color p-4 rounded-lg text-left w-full mb-6">
                <h4 className="text-cyan font-bold mb-2">Detalle del Hotfix (v2.1.4)</h4>
                <p className="text-sm text-muted mb-3">
                  Incidentes activos: {activeIncidentsOpen.length} ({activeIncidentCodes})
                </p>
                <ul className="text-sm text-muted list-disc list-inside">
                  <li>Implementación de paginación (50 registros/lote).</li>
                  <li>Liberación proactiva de memoria con Garbage Collector tras cada lote.</li>
                  <li>Reintento automático bajo conectividad inestable.</li>
                </ul>
              </div>

              <button 
                onClick={handleDeploy}
                disabled={deploying}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ backgroundColor: deploying ? '#0e7490' : '#06b6d4' }}
              >
                {deploying ? <RefreshIcon className="animate-spin" /> : <Play size={20} />}
                {deploying ? 'Desplegando en Producción...' : 'Desplegar Hotfix a Dispositivos'}
              </button>
            </div>
          )}

        </div>

        <div className="panel flex-1 flex flex-col">
          <div className="panel-header text-sm">
            <Terminal size={16} /> Consola de Despliegue CI/CD
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-xs flex-1 overflow-y-auto border border-border-color">
            {deployLogs.length === 0 && <span className="text-gray-600">Esperando ejecución de pipeline...</span>}
            {deployLogs.map((log, i) => (
              <div key={i} className="mb-2">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{' '}
                <span className={log.includes('PASSED') || log.includes('recuperado') ? 'text-green' : 'text-blue-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

export default Step5Resolution;
