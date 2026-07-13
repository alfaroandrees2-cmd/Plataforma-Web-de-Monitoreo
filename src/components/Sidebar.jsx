import React from 'react';
import { Smartphone, Activity, Ticket, LineChart, CheckCircle2, BookOpen } from 'lucide-react';

const steps = [
  { id: 1, label: 'Generación de Evento', icon: <Smartphone size={18} /> },
  { id: 2, label: 'Dashboard en Tiempo Real', icon: <Activity size={18} /> },
  { id: 3, label: 'Gestión de Incidentes', icon: <Ticket size={18} /> },
  { id: 4, label: 'Degradación UX', icon: <LineChart size={18} /> },
  { id: 5, label: 'Resolución y Normalización', icon: <CheckCircle2 size={18} /> },
  { id: 6, label: 'Base de Conocimiento', icon: <BookOpen size={18} /> },
];

function Sidebar({ activeStep, setActiveStep, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
         {/*<Activity color="var(--accent-purple)" />*/}
        <span>Panel de navegación</span>
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

      {user && (
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-badge">{user.username}</span>
            <p className="sidebar-user-label">Administrador</p>
          </div>
          <button className="btn-ghost sidebar-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
