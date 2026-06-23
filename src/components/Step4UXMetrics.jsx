import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingDown, Percent, Activity } from 'lucide-react';

function Step4UXMetrics({ simState }) {

  const uxData = useMemo(() => {
    const data = [
      { time: '-10m', availability: 99.9, responseTime: 1.2 },
      { time: '-8m', availability: 99.9, responseTime: 1.3 },
      { time: '-6m', availability: 99.8, responseTime: 1.5 },
    ];

    if (simState.crashed) {
      if (simState.resolved) {
        data.push(
          { time: '-4m', availability: 91.5, responseTime: 8.4 },
          { time: '-2m', availability: 95.0, responseTime: 4.2 },
          { time: 'Ahora', availability: 99.6, responseTime: 1.1 }
        );
      } else {
        data.push(
          { time: '-4m', availability: 95.5, responseTime: 5.2 },
          { time: '-2m', availability: 93.0, responseTime: 7.1 },
          { time: 'Ahora', availability: 91.5, responseTime: 8.4 }
        );
      }
    } else {
      data.push(
        { time: '-4m', availability: 99.9, responseTime: 1.2 },
        { time: '-2m', availability: 99.8, responseTime: 1.3 },
        { time: 'Ahora', availability: 99.9, responseTime: 1.2 }
      );
    }
    return data;
  }, [simState.crashed, simState.resolved]);

  const currentAvail = simState.crashed ? (simState.resolved ? '99.6' : '91.5') : '99.9';
  const currentRespTime = simState.crashed ? (simState.resolved ? '1.1' : '8.4') : '1.2';
  const successRate = simState.crashed ? (simState.resolved ? '99.8' : '75.0') : '99.9';

  const isDegraded = simState.crashed && !simState.resolved;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="panel-header mb-6">
        <Activity color="var(--accent-orange)" /> Degradación de UX y SLA
      </div>
      
      <div className="flex gap-6 mb-6">
        <div className={`panel flex-1 metric-card relative overflow-hidden ${isDegraded ? 'border-red-500/50' : ''}`}>
          {isDegraded && <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>}
          <div className="flex items-center gap-2 text-muted text-xs font-bold tracking-widest uppercase mb-2 relative z-10">
            <Clock size={16} /> TIEMPO DE RESPUESTA
          </div>
          <div className="metric-value relative z-10">
            <span className={isDegraded ? 'text-red' : 'text-main'}>{currentRespTime}</span>
            <span className="text-lg text-muted ml-1">s</span>
          </div>
          {isDegraded && <div className="text-xs text-red mt-2 font-bold relative z-10">↑ Degradado (+600%)</div>}
        </div>

        <div className={`panel flex-1 metric-card relative overflow-hidden ${isDegraded ? 'border-orange-500/50' : ''}`}>
          {isDegraded && <div className="absolute inset-0 bg-orange-900/10 pointer-events-none"></div>}
          <div className="flex items-center gap-2 text-muted text-xs font-bold tracking-widest uppercase mb-2 relative z-10">
            <TrendingDown size={16} /> TASA DE ÉXITO
          </div>
          <div className="metric-value relative z-10">
            <span className={isDegraded ? 'text-orange' : 'text-main'}>{successRate}</span>
            <span className="text-lg text-muted ml-1">%</span>
          </div>
          {isDegraded && <div className="text-xs text-orange mt-2 font-bold relative z-10">↓ Caída Crítica</div>}
        </div>

        <div className={`panel flex-1 metric-card relative overflow-hidden ${isDegraded ? 'border-red-500/50 pulse-alert' : ''}`}>
           {isDegraded && <div className="absolute inset-0 bg-red-900/20 pointer-events-none"></div>}
          <div className="flex items-center gap-2 text-muted text-xs font-bold tracking-widest uppercase mb-2 relative z-10">
            <Percent size={16} /> DISPONIBILIDAD SLA
          </div>
          <div className="metric-value relative z-10">
            <span className={isDegraded ? 'text-red' : 'text-main'}>{currentAvail}</span>
            <span className="text-lg text-muted ml-1">%</span>
          </div>
          {isDegraded && <div className="text-xs text-red font-bold mt-2 relative z-10">ALERTA DE SLA INCUMPLIDO</div>}
        </div>
      </div>

      <div className="panel flex-1 flex flex-col">
        <h3 className="text-xs font-bold tracking-widest uppercase text-muted mb-4">Evolución: Disponibilidad vs Tiempo de Carga</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={uxData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDegraded ? "#FF2A5F" : "#00FF87"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isDegraded ? "#FF2A5F" : "#00FF87"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" domain={[80, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tickLine={false} axisLine={false} dx={10} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              
              <Area yAxisId="left" type="monotone" dataKey="availability" stroke={isDegraded ? "#FF2A5F" : "#00FF87"} strokeWidth={3} fillOpacity={1} fill="url(#colorAvail)" name="Disponibilidad (%)" />
              <Area yAxisId="right" type="monotone" dataKey="responseTime" stroke="#FF8C00" fill="none" strokeWidth={3} name="T. Respuesta (s)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default Step4UXMetrics;
