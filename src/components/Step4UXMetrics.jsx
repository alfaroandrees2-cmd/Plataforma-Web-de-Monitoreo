import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingDown, Percent, Activity } from 'lucide-react';

function Step4UXMetrics() {
  const [metrics, setMetrics] = useState({
    apdex: 0.94,
    crashFree: 99.8,
    latency: 240
  });
  const [isDegraded, setIsDegraded] = useState(false);
  const [uxData, setUxData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/metricas/ux');
        const json = await res.json();
        
        const degraded = json.apdex < 0.8;
        setIsDegraded(degraded);
        setMetrics({
          apdex: json.apdex,
          crashFree: json.crashFree,
          latency: json.latency
        });

        // Generar historial falso en base al estado actual
        const data = [
          { time: '-10m', availability: 99.9, responseTime: 1.2 },
          { time: '-8m', availability: 99.9, responseTime: 1.3 },
          { time: '-6m', availability: 99.8, responseTime: 1.5 },
        ];

        if (degraded) {
          data.push(
            { time: '-4m', availability: 95.5, responseTime: 5.2 },
            { time: '-2m', availability: 93.0, responseTime: 7.1 },
            { time: 'Ahora', availability: json.crashFree, responseTime: json.latency / 1000 }
          );
        } else {
          data.push(
            { time: '-4m', availability: 99.9, responseTime: 1.2 },
            { time: '-2m', availability: 99.8, responseTime: 1.3 },
            { time: 'Ahora', availability: json.crashFree, responseTime: json.latency / 1000 }
          );
        }
        setUxData(data);

      } catch (err) {
        console.error("Error fetching UX data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentAvail = metrics.crashFree.toFixed(1);
  const currentRespTime = (metrics.latency / 1000).toFixed(1);
  const successRate = isDegraded ? '75.0' : '99.9';

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header mb-6">
        <Activity color="var(--text-main)" /> Degradación de UX y SLA
      </div>
      
      <div className="flex gap-6 mb-6">
        <div className={`panel flex-1 metric-card ${isDegraded ? 'border-red-400/10' : ''}`} style={{ background: 'linear-gradient(180deg, rgba(192,132,252,0.14), rgba(15,23,42,0.03))' }}>
          <div className="flex items-center gap-2 text-purple text-xs font-semibold uppercase mb-2">
            <Clock size={16} /> TIEMPO DE RESPUESTA
          </div>
          <div className="metric-value">
            <span className={isDegraded ? 'text-red' : 'text-purple'}>{currentRespTime}</span>
            <span className="text-lg text-muted ml-1">s</span>
          </div>
          {isDegraded && <div className="text-xs text-red mt-2">Revisión activa</div>}
        </div>

        <div className={`panel flex-1 metric-card ${isDegraded ? 'border-orange-400/10' : ''}`} style={{ background: 'linear-gradient(180deg, rgba(20,184,166,0.12), rgba(15,23,42,0.03))' }}>
          <div className="flex items-center gap-2 text-teal text-xs font-semibold uppercase mb-2">
            <TrendingDown size={16} /> TASA DE ÉXITO
          </div>
          <div className="metric-value">
            <span className={isDegraded ? 'text-orange' : 'text-teal'}>{successRate}</span>
            <span className="text-lg text-muted ml-1">%</span>
          </div>
          {isDegraded && <div className="text-xs text-orange mt-2">Bajo observación</div>}
        </div>

        <div className={`panel flex-1 metric-card ${isDegraded ? 'border-red-400/10' : ''}`} style={{ background: 'linear-gradient(180deg, rgba(251,191,36,0.12), rgba(15,23,42,0.03))' }}>
          <div className="flex items-center gap-2 text-orange text-xs font-semibold uppercase mb-2">
            <Percent size={16} /> DISPONIBILIDAD SLA
          </div>
          <div className="metric-value">
            <span className={isDegraded ? 'text-red' : 'text-orange'}>{currentAvail}</span>
            <span className="text-lg text-muted ml-1">%</span>
          </div>
          {isDegraded && <div className="text-xs text-red mt-2">SLA en revisión</div>}
        </div>
      </div>

      <div className="panel flex-1 flex flex-col">
        <h3 className="text-xs font-bold tracking-widest uppercase text-muted mb-4">Evolución: Disponibilidad vs Tiempo de Carga</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={uxData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDegraded ? "#fca5a5" : "#86efac"} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={isDegraded ? "#fca5a5" : "#86efac"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" domain={[80, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tickLine={false} axisLine={false} dx={10} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(148,163,184,0.18)', borderRadius: '8px' }}
                itemStyle={{ fontWeight: 'normal', color: '#e2e8f0' }}
              />
              
              <Area yAxisId="left" type="monotone" dataKey="availability" stroke={isDegraded ? "#f87171" : "#86efac"} strokeWidth={3} fillOpacity={1} fill="url(#colorAvail)" name="Disponibilidad (%)" />
              <Area yAxisId="right" type="monotone" dataKey="responseTime" stroke="#fb923c" fill="none" strokeWidth={3} name="T. Respuesta (s)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default Step4UXMetrics;
