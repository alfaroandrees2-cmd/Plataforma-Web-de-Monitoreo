import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, MapPin, Activity } from 'lucide-react';

function Step2RealtimeDashboard() {
  const [data, setData] = useState([]);
  const [isDegraded, setIsDegraded] = useState(false);
  const [currentEvents, setCurrentEvents] = useState(14);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/metricas/dashboard');
        const json = await res.json();
        setData(json.chartData);
        setIsDegraded(json.isDegraded);
        setCurrentEvents(json.currentEventsPerMinute);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData(); // Fetch immediately
    const interval = setInterval(fetchData, 3000); // Polling every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="panel-header mb-6">
        <Activity color="var(--accent-cyan)" /> Dashboard en Tiempo Real (Ingesta de Eventos)
      </div>
      
      <div className="flex gap-6 mb-6">
        <div className="panel flex-1 metric-card">
          <h3 className="text-muted text-xs font-bold tracking-widest uppercase">Eventos por Minuto</h3>
          <div className="metric-value">
            {isDegraded ? <span className="text-red pulse-alert px-3 py-1 rounded-lg">{currentEvents}</span> : <span className="text-main">{currentEvents}</span>}
            <span className="text-lg text-muted ml-2 font-normal">req/m</span>
          </div>
        </div>
        <div className="panel flex-1 metric-card">
          <h3 className="text-muted text-xs font-bold tracking-widest uppercase">Estado Global</h3>
          <div className="metric-value">
            {isDegraded ? <span className="text-red">CRÍTICO</span> : <span className="text-green">NORMAL</span>}
          </div>
        </div>
        <div className="panel flex-1 metric-card">
          <h3 className="text-muted text-xs font-bold tracking-widest uppercase">Foco de Anomalía</h3>
          <div className="metric-value flex items-center gap-3 text-2xl mt-3">
             <MapPin size={28} className={isDegraded ? 'text-red' : 'text-green'} />
             {isDegraded ? 'Región Piura' : 'Ninguno'}
          </div>
        </div>
      </div>

      <div className="panel flex-1 relative flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-bold text-muted uppercase tracking-wider">
            Volumen de Eventos (App Móvil)
          </div>
          {isDegraded && (
            <div className="bg-red-900/40 border border-red-500/50 text-red px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse text-sm font-bold shadow-[0_0_15px_rgba(255,42,95,0.3)]">
              <AlertCircle size={18} /> PICO ANÓMALO DETECTADO: OutOfMemory
            </div>
          )}
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDegraded ? "#FF2A5F" : "#00F0FF"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={isDegraded ? "#FF2A5F" : "#00F0FF"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="events" 
                stroke={isDegraded ? "#FF2A5F" : "#00F0FF"} 
                strokeWidth={4}
                fill="url(#colorEvents)"
                activeDot={{ r: 8, fill: isDegraded ? "#FF2A5F" : "#00F0FF", stroke: '#000', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Step2RealtimeDashboard;
