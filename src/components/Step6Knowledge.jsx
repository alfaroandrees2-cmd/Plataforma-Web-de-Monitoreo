import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

function Step6Knowledge() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKnowledge = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3001/api/conocimiento');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setRecords(json);
      } catch (err) {
        console.error('Error fetching knowledge base:', err);
        setError('No se pudo cargar la base de conocimiento.');
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ gap: '1rem' }}>
      <div className="panel-header">
        <BookOpen color="var(--text-main)" /> Base de Conocimiento
      </div>

      <p className="text-muted mb-6">
        Artículos y soluciones documentadas asociadas a incidentes resueltos.
      </p>

      <div className="panel flex-1">
        {loading ? (
          <div className="text-muted">Cargando registros de conocimiento...</div>
        ) : error ? (
          <div className="text-[#f87171]">{error}</div>
        ) : records.length === 0 ? (
          <div className="text-muted">No hay registros de conocimiento disponibles.</div>
        ) : (
          <div className="space-y-4">
            {records.map(record => (
              <div key={record.registro_id} className="panel" style={{ padding: '1rem' }}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-main">{record.titulo}</h3>
                    <p className="text-xs text-muted mt-1">
                      {new Date(record.fecha_creacion).toLocaleDateString('es-PE', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                      {record.Incidente ? ` · Incidente ${record.Incidente.codigo}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted mt-4" style={{ whiteSpace: 'pre-line' }}>
                  {record.solucion}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Step6Knowledge;
