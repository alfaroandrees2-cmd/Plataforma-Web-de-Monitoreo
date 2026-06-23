import React from 'react';
import { Smartphone, Activity, Ticket, LineChart, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, label: 'Generación de Evento', icon: <Smartphone size={18} /> },
  { id: 2, label: 'Dashboard en Tiempo Real', icon: <Activity size={18} /> },
  { id: 3, label: 'Gestión de Incidentes', icon: <Ticket size={18} /> },
  { id: 4, label: 'Degradación UX', icon: <LineChart size={18} /> },
  { id: 5, label: 'Resolución y Normalización', icon: <CheckCircle2 size={18} /> },
];

function Sidebar({ activeStep, setActiveStep }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <Activity color="var(--accent-cyan)" />
        <span>NOC Dashboard</span>
      </div>
      
      <nav className="step-nav">
        {steps.map(step => (
          <button 
            key={step.id}
            className={`step-btn ${activeStep === step.id ? 'active' : ''}`}
            onClick={() => setActiveStep(step.id)}
          >
            {step.icon}
            {step.id}. {step.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
