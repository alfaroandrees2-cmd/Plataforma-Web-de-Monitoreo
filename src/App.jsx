import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Step1MobileCrash from './components/Step1MobileCrash';
import Step2RealtimeDashboard from './components/Step2RealtimeDashboard';
import Step3IncidentManagement from './components/Step3IncidentManagement';
import Step4UXMetrics from './components/Step4UXMetrics';
import Step5Resolution from './components/Step5Resolution';
import Step6Knowledge from './components/Step6Knowledge';

function App() {
  const [activeStep, setActiveStep] = useState(() => {
    return Number(localStorage.getItem('activeStep')) || 1;
  });

  const [simState, setSimState] = useState(() => {
    try {
      const saved = localStorage.getItem('simState');
      return saved ? JSON.parse(saved) : {
        crashed: false,
        resolved: false,
        crashCount: 0,
        timestamp: null
      };
    } catch {
      return { crashed: false, resolved: false, crashCount: 0, timestamp: null };
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persistir simState en localStorage cada vez que cambie
  const updateSimState = (newState) => {
    setSimState(newState);
    localStorage.setItem('simState', JSON.stringify(newState));
  };

  const handleSetActiveStep = (step) => {
    setActiveStep(step);
    localStorage.setItem('activeStep', step);
  };

  const triggerCrash = async () => {
    try {
      await fetch('http://localhost:3001/api/simular-crash', { method: 'POST' });
      console.log("Crash guardado en MySQL exitosamente");
    } catch (err) {
      console.error("Error conectando con el backend:", err);
    }

    const newState = {
      ...simState,
      crashed: true,
      crashCount: simState.crashCount + 1,
      timestamp: new Date().toISOString()
    };
    updateSimState(newState);
  };

  const resolveIncident = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/incidentes/resolver', { method: 'POST' });
      const result = await response.json();
      console.log("Incidentes resueltos en MySQL", result);

      const newState = { ...simState, crashed: false, resolved: true };
      updateSimState(newState);
      return result;
    } catch (err) {
      console.error("Error al resolver:", err);
      return null;
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeStep={activeStep}
        setActiveStep={handleSetActiveStep}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        {activeStep === 1 && (
          <Step1MobileCrash 
            simState={simState} 
            triggerCrash={triggerCrash} 
            nextStep={() => handleSetActiveStep(2)}
            resetSim={() => {
              const fresh = { crashed: false, resolved: false, crashCount: 0, timestamp: null };
              updateSimState(fresh);
              localStorage.removeItem('simState');
            }}
          />
        )}
        
        {activeStep === 2 && (
          <Step2RealtimeDashboard 
            simState={simState} 
          />
        )}
        
        {activeStep === 3 && (
          <Step3IncidentManagement 
            simState={simState} 
            resolveIncident={resolveIncident}
          />
        )}
        
        {activeStep === 4 && (
          <Step4UXMetrics 
            simState={simState} 
          />
        )}
        
        {activeStep === 5 && (
          <Step5Resolution 
            simState={simState} 
            resolveIncident={resolveIncident} 
          />
        )}
        {activeStep === 6 && (
          <Step6Knowledge />
        )}
      </main>
    </div>
  );
}

export default App;
