import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Step1MobileCrash from './components/Step1MobileCrash';
import Step2RealtimeDashboard from './components/Step2RealtimeDashboard';
import Step3IncidentManagement from './components/Step3IncidentManagement';
import Step4UXMetrics from './components/Step4UXMetrics';
import Step5Resolution from './components/Step5Resolution';

function App() {
  const [activeStep, setActiveStep] = useState(1);
  const [simState, setSimState] = useState({
    crashed: false,
    resolved: false,
    crashCount: 0,
    timestamp: null
  });

  const triggerCrash = () => {
    setSimState(prev => ({
      ...prev,
      crashed: true,
      crashCount: prev.crashCount + 1,
      timestamp: new Date().toISOString()
    }));
  };

  const resolveIncident = () => {
    setSimState(prev => ({
      ...prev,
      resolved: true
    }));
  };

  return (
    <div className="app-container">
      <Sidebar activeStep={activeStep} setActiveStep={setActiveStep} />
      
      <main className="main-content">
        {activeStep === 1 && (
          <Step1MobileCrash 
            simState={simState} 
            triggerCrash={triggerCrash} 
            nextStep={() => setActiveStep(2)} 
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
      </main>
    </div>
  );
}

export default App;
