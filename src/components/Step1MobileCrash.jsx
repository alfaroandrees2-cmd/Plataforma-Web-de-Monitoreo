import React, { useState, useEffect } from 'react';
import { RefreshCw, WifiOff, AlertTriangle } from 'lucide-react';

function Step1MobileCrash({ simState, triggerCrash, nextStep, resetSim }) {
  const [syncing, setSyncing] = useState(false);

  // Logs persistentes en localStorage
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('crashLogs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveLogs = (newLogs) => {
    setLogs(newLogs);
    localStorage.setItem('crashLogs', JSON.stringify(newLogs));
  };

  useEffect(() => {
    if (simState.crashed && logs.length === 0) {
      addLogs();
    }
  }, [simState.crashed]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      triggerCrash();
      addLogs();
    }, 2000);
  };

  const addLogs = () => {
    const newLogs = [
      "[INFO] Inicializando DataSyncController...",
      "[INFO] Conectando endpoint: /api/v1/sync/piura_region",
      "[WARN] Ancho de banda bajo detectado: 120kbps",
      "[INFO] Iniciando descarga de lote...",
      "[ERROR] Memoria insuficiente al instanciar buffer de 150MB",
      "Exception in thread 'main' java.lang.OutOfMemoryError: Failed to allocate a 157286400 byte allocation with 4194304 free bytes",
      "  at com.corp.app.DataSyncController.sync(DataSyncController.java:45)",
      "  at com.corp.app.MainActivity.onSyncClick(MainActivity.java:112)",
      "-> Enrutando stacktrace al backend NOC..."
    ];
    let accumulated = [];
    newLogs.forEach((log, index) => {
      setTimeout(() => {
        accumulated = [...accumulated, log];
        saveLogs(accumulated);
      }, index * 300);
    });
  };

  const handleReset = () => {
    localStorage.removeItem('crashLogs');
    setLogs([]);
    resetSim();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header mb-4">
        <SmartphoneIcon /> Simulación: App Móvil (Región Piura)
      </div>
      <p className="text-muted mb-6">
        Simula a un colaborador de campo intentando sincronizar datos bajo condiciones inestables de red, 
        lo que desencadenará un "Out of Memory Exception" capturado por nuestro SDK.
      </p>

      <div className="flex gap-6 justify-center flex-1">
        
        {/* Mobile Device Mockup */}
        <div className="mobile-device">
          <div className="mobile-notch"></div>
          <div className="mobile-screen">
            <div className="mobile-header">
              CorpApp Movil
            </div>
            <div className="mobile-content relative">
              <div className="flex justify-between items-center bg-gray-200 p-2 rounded text-sm text-gray-700">
                <span>Zona: Piura Rural</span>
                <WifiOff size={14} className="text-red-500" />
              </div>
              
              <div className="mt-8 text-center text-gray-600">
                <p>150 registros pendientes</p>
                <p>de sincronización</p>
              </div>

              <div className="mt-auto mb-8">
                <button 
                  className="btn-sync w-full"
                  onClick={handleSync}
                  disabled={syncing || simState.crashed}
                >
                  <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
                </button>
              </div>

              {simState.crashed && (
                <div className="crash-dialog">
                  <AlertTriangle size={32} className="text-red mx-auto mb-2" />
                  <h3 className="font-bold mb-1">La aplicación se ha detenido</h3>
                  <p className="text-sm text-gray-600">CorpApp Movil dejó de funcionar inesperadamente.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SDK Monitor View */}
        <div className="flex-1 panel">
          <div className="panel-header">
            SDK de Monitoreo (Background)
          </div>
          <div className="sdk-log-panel">
            {logs.length === 0 && <span className="text-gray-500">Esperando eventos...</span>}
            {logs.map((log, i) => (
              <div key={i} className={log.includes('ERROR') || log.includes('Exception') ? 'text-red' : ''}>
                {log}
              </div>
            ))}
          </div>
          
          {simState.crashed && logs.length > 5 && (
            <div className="mt-6">
              <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
                <h4 className="text-red font-bold mb-2">Evento Crítico Capturado</h4>
                <p className="text-sm">Metadata enviada a NOC: Dispositivo (Samsung S21), SO (Android 12), Región (Piura).</p>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={nextStep}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition-colors"
                  >
                    Ver Impacto en Dashboard NOC &rarr;
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-4 py-2 rounded border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-colors text-sm"
                    title="Reiniciar simulación"
                  >
                    ↺ Reiniciar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SmartphoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
);

export default Step1MobileCrash;
