import React, { useState, useEffect } from 'react';
import { Ticket, User, Clock, AlertTriangle } from 'lucide-react';

function Step3IncidentManagement({ simState, resolveIncident }) {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchIncidentes = () => {
      fetch('http://localhost:3001/api/incidentes')
        .then(res => res.json())
        .then(data => {
          setIncidentes(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching incidentes", err);
          setLoading(false);
        });
    };

    setLoading(true);
    fetchIncidentes(); // Fetch inicial
    const interval = setInterval(fetchIncidentes, 3000); // Polling cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const handleResolve = async () => {
    if (!resolveIncident) return;
    setResolving(true);
    setStatusMessage('Resolviendo incidentes abiertos...');

    const result = await resolveIncident();

    if (result && result.success) {
      setStatusMessage(`Incidentes resueltos: ${result.count}`);
      setLoading(true);
      fetch('http://localhost:3001/api/incidentes')
        .then(res => res.json())
        .then(data => {
          setIncidentes(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching incidentes", err);
          setLoading(false);
        });
    } else {
      setStatusMessage('No se pudo resolver el incidente. Revisa el backend.');
    }

    setResolving(false);
  };

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
        <div className="border-b border-border-color pb-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Cola de Incidentes Activos</h2>
            <span className="text-sm text-muted">Actualizado cada 3s desde el backend</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResolve}
              disabled={resolving || incidentes.filter(i => i.fecha_resolucion === '0' || i.fecha_resolucion === 0 || i.fecha_resolucion === null).length === 0}
              className="bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50"
            >
              {resolving ? 'Resolviendo...' : 'Resolver incidentes abiertos'}
            </button>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">Mostrando: Abiertos</span>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 rounded-lg bg-slate-900 text-sm text-slate-100">{statusMessage}</div>
        )}

        {loading && incidentes.length === 0 ? (
          <div className="text-center text-muted py-12">Cargando incidentes desde MySQL...</div>
        ) : incidentes.length === 0 ? (
          <div className="text-center text-muted py-12">
             No hay incidentes críticos registrados en la base de datos.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {incidentes.map(incidente => {
              // Un incidente está resuelto si su fecha_resolucion en MySQL es distinta de 0
              const isResolved = incidente.fecha_resolucion !== '0' && incidente.fecha_resolucion !== 0 && incidente.fecha_resolucion !== null;
              const cardClass = isResolved ? 'incident-card resolved' : 'incident-card critical';
              const badgeClass = isResolved ? 'badge badge-resolved' : 'badge badge-critical';
              const stateText = isResolved ? 'RESUELTO' : 'ASIGNADO';

              return (
                <div key={incidente.incidente_id} className={cardClass}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={badgeClass}>
                          PRIORIDAD: {incidente.prioridad}
                        </span>
                        <span className="text-lg font-bold text-cyan" style={{ letterSpacing: '1px' }}>#{incidente.codigo}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-main mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {incidente.titulo}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted mt-3">
                        <span className="flex items-center gap-1"><AlertTriangle size={15} style={{ color: 'var(--accent-orange)' }}/> {incidente.descripcion}</span>
                        {incidente.EquipoSoporte && (
                          <span className="flex items-center gap-1"><User size={15} style={{ color: 'var(--accent-blue)' }}/> Asignado a: {incidente.EquipoSoporte.nombre}</span>
                        )}
                        <span className="flex items-center gap-1"><Clock size={15} style={{ color: 'var(--accent-cyan)' }}/> {new Date(incidente.fecha_creacion).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-muted mb-1" style={{ letterSpacing: '1px' }}>ESTADO ACTUAL</div>
                      <div className={`text-2xl font-bold ${isResolved ? 'text-green' : 'text-orange'}`} style={{ textShadow: isResolved ? '0 0 15px rgba(0,255,135,0.4)' : '0 0 15px rgba(255,140,0,0.4)' }}>
                        {stateText}
                      </div>
                    </div>
                  </div>

                  {incidente.Alerta && incidente.Alerta.regla_itil && (
                    <div className="log-box">
                      <h4 className="text-xs font-bold text-muted mb-2 flex items-center gap-2">
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 5px var(--accent-red)' }}></span> 
                        REGLA ITIL DISPARADA AUTOMÁTICAMENTE
                      </h4>
                      <pre className="text-sm font-mono overflow-x-auto" style={{ color: '#ff7b00' }}>
                        &gt; Evaluando regla: {incidente.Alerta.regla_itil}
                        <br/>
                        &gt; Condición de umbral superada: {incidente.Alerta.umbral}
                        <br/>
                        <span style={{ color: '#00ff87' }}>&gt; Acción ejecutada: Incidente creado exitosamente.</span>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
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
