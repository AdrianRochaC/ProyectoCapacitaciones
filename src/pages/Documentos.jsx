import React, { useEffect, useState } from 'react';
const API_URL = 'http://localhost:3001';

const Documentos = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/api/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setDocuments(data.documents);
        else setError('No se pudieron cargar los documentos');
      } catch (err) {
        setError('Error al cargar documentos');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="user-documentos-page" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        margin: '56px auto',
        background: 'rgba(30,32,44,0.92)',
        borderRadius: 18,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '36px 28px 36px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, marginBottom: 18 }}>Mis Documentos</h1>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>Cargando documentos...</div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#dc2626' }}>{error}</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>No tienes documentos asignados.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--bg-primary, #18181b)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border-color, #333)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #23232b)' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Nombre</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Tamaño</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Fecha</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color, #333)' }}>
                    <td style={{ padding: '10px 10px' }}>{doc.name}</td>
                    <td style={{ padding: '10px 10px' }}>{doc.mimetype.split('/')[1]}</td>
                    <td style={{ padding: '10px 10px' }}>{(doc.size / 1024).toFixed(1)} KB</td>
                    <td style={{ padding: '10px 10px' }}>{new Date(doc.created_at).toLocaleString('es-CO', { hour12: false })}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <a
                        href={`${API_URL}/uploads/documents/${doc.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        Ver/Descargar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentos;
