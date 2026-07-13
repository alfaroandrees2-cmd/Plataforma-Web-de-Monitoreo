import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, MapPin, Activity, CheckCircle2, XCircle, Clock, BarChart2 } from 'lucide-react';

function Step2RealtimeDashboard() {
  const [data, setData] = useState([]);
  const [isDegraded, setIsDegraded] = useState(false);
  const [currentEvents, setCurrentEvents] = useState(14);
  const [stats, setStats] = useState({
    total: 0,
    abiertos: 0,
    resueltos: 0,
    tiempoPromedioMin: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3001/api/metricas/dashboard');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.debug('dashboard payload', json);
        const normalized = Array.isArray(json.chartData)
          ? json.chartData.map((point, index) => ({
              time: point.time != null ? String(point.time) : `T${index}`,
              events: Number(point.events) || 0
            }))
          : [];
        setData(normalized);
        setIsDegraded(Boolean(json.isDegraded));
        setCurrentEvents(Number(json.currentEventsPerMinute) || 0);
        if (json.stats) setStats(json.stats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('No se pudo cargar el dashboard. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ gap: '1.25rem' }}>
      <div className="panel-header">
        <Activity color="var(--text-main)" /> Dashboard en tiempo real
      </div>

      {/* Fila 1: Estado del sistema */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="panel metric-card">
          <h3 className="text-muted text-xs font-bold tracking-widest uppercase">Eventos / min</h3>
          <div className="metric-value">
            {isDegraded
              ? <span className="text-[#f87171] px-3 py-1 rounded-lg bg-[#3f1f26]">{currentEvents}</span>
              : <span className="text-main">{currentEvents}</span>}
            <span className="text-lg text-muted ml-2 font-normal">req/m</span>
          </div>
        </div>
        <div className="panel metric-card">
          <h3 className="text-muted text-xs font-bold tracking-widest uppercase">Estado Global</h3>
          <div className="metric-value">
            {isDegraded ? <span className="text-[#f87171]">CRÍTICO</span> : <span className="text-[#86efac]">NORMAL</span>}
          </div>
        </div>
        <div className="panel metric-card">
          <h3 className="text-muted text-xs font-bold tracking-widest uppercase">Foco de Anomalía</h3>
          <div className="metric-value flex items-center gap-3 text-2xl mt-3">
            <MapPin size={28} className={isDegraded ? 'text-[#f87171]' : 'text-[#86efac]'} />
            {isDegraded ? 'Región Piura' : 'Ninguno'}
          </div>
        </div>
      </div>

      {/* Fila 2: Métricas de incidentes desde MySQL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {/* Total */}
        <div className="panel" style={{
          background: 'linear-gradient(135deg, rgba(192,132,252,0.14), rgba(192,132,252,0.04))',
          border: '1px solid rgba(192,132,252,0.22)',
          borderRadius: '1rem',
          padding: '1.25rem'
        }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} style={{ color: '#c084fc' }} />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Total Incidentes</span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'Outfit', color: '#c084fc', lineHeight: 1 }}>
            {stats.total}
          </div>
          <div className="text-xs text-muted mt-2">registrados en BD</div>
        </div>

        {/* Abiertos */}
        <div className="panel" style={{
          background: stats.abiertos > 0
            ? 'rgba(30, 18, 26, 0.95)'
            : 'rgba(255,255,255,0.03)',
          border: stats.abiertos > 0 ? '1px solid rgba(248,113,113,0.25)' : '1px solid rgba(255,255,255,0.05)',
          borderRadius: '1rem',
          padding: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {stats.abiertos > 0 && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
              background: 'linear-gradient(180deg, #ff2a5f, #ff8c00)',
              boxShadow: '2px 0 10px rgba(255,42,95,0.5)'
            }} />
          )}
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={16} style={{ color: stats.abiertos > 0 ? '#ff2a5f' : '#94a3b8' }} />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Sin Resolver</span>
          </div>
          <div style={{
            fontSize: '2.8rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1,
            color: stats.abiertos > 0 ? '#fca5a5' : 'var(--text-main)'
          }}>
            {stats.abiertos}
          </div>
          <div className="text-xs text-muted mt-2">incidentes activos</div>
        </div>

        {/* Resueltos */}
        <div className="panel" style={{
          background: stats.resueltos > 0
            ? 'rgba(15, 28, 19, 0.95)'
            : 'rgba(255,255,255,0.03)',
          border: stats.resueltos > 0 ? '1px solid rgba(134,239,172,0.2)' : '1px solid rgba(255,255,255,0.05)',
          borderRadius: '1rem',
          padding: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {stats.resueltos > 0 && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
              background: 'linear-gradient(180deg, #00ff87, #00b8ff)',
              boxShadow: '2px 0 10px rgba(0,255,135,0.5)'
            }} />
          )}
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} style={{ color: stats.resueltos > 0 ? '#00ff87' : '#94a3b8' }} />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Resueltos</span>
          </div>
          <div style={{
            fontSize: '2.8rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1,
            color: stats.resueltos > 0 ? '#86efac' : 'var(--text-main)'
          }}>
            {stats.resueltos}
          </div>
          <div className="text-xs text-muted mt-2">cerrados exitosamente</div>
        </div>

        {/* Tiempo promedio */}
        <div className="panel" style={{
          background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(255,140,0,0.02))',
          border: '1px solid rgba(255,140,0,0.2)',
          borderRadius: '1rem',
          padding: '1.25rem'
        }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} style={{ color: '#ff8c00' }} />
            <span className="text-xs font-bold text-muted uppercase tracking-wider">T. Resolución</span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'Outfit', color: '#ff8c00', lineHeight: 1 }}>
            {stats.resueltos > 0 ? stats.tiempoPromedioMin : '—'}
          </div>
          <div className="text-xs text-muted mt-2">
            {stats.resueltos > 0 ? 'minutos promedio' : 'sin datos aún'}
          </div>
        </div>
      </div>

      {/* Fila 3: Gráfico de eventos */}
      <div className="panel flex-1 relative flex flex-col" style={{ minHeight: '200px' }}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-bold text-muted uppercase tracking-wider">
            Volumen de Eventos (App Móvil)
          </div>
          {isDegraded && (
            <div className="bg-[#3e1c24] border border-[#fca5a5] text-[#f87171] px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              style={{ boxShadow: 'none' }}>
              <AlertCircle size={18} /> PICO anómalo detectado
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted">Cargando métricas...</div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-[#f87171]">{error}</div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted">No hay datos de eventos disponibles.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDegraded ? '#f87171' : '#c084fc'} stopOpacity={0.34} />
                    <stop offset="95%" stopColor={isDegraded ? '#f87171' : '#ec4899'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  formatter={(value) => [value, 'Eventos/min']}
                  labelFormatter={(label) => new Date(label).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke={isDegraded ? '#FF2A5F' : '#c084fc'}
                  strokeWidth={4}
                  fill="url(#colorEvents)"
                  activeDot={{ r: 8, fill: isDegraded ? '#FF2A5F' : '#c084fc', stroke: '#000', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2RealtimeDashboard;
