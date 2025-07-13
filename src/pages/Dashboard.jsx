
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Perfil.css";

const Dashboard = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("🔑 Token obtenido:", token);
    if (!token) {
      console.error("❌ Token no encontrado");
      setLoading(false);
      return;
    }
    console.log("🌐 Llamando a:", "/api/progress/all");

    axios
      .get("/api/progress/all", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        if (res.data.success) {
          setProgress(res.data.progress);
        } else {
          alert("❌ " + res.data.message);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.error("❌ Error al obtener progreso:", err.response.status, err.response.data);
        } else {
          console.error("❌ Error al obtener progreso:", err);
        }
        alert("❌ No se pudo cargar el progreso");
      })
      .finally(() => setLoading(false));
  }, []);

  // Agrupar progreso por usuario
  const progressByUser = progress.reduce((acc, item) => {
    if (!acc[item.nombre]) acc[item.nombre] = [];
    acc[item.nombre].push(item);
    return acc;
  }, {});

  return (
    <div className="perfil-container" style={{background:'#f5f9fc', minHeight:'100vh'}}>
      <div className="perfil-header" style={{marginBottom:0}}>
        <div>
          <h1 style={{marginBottom:8, color:'#203a43'}}>Panel de Progreso General</h1>
          <div style={{color:'#4a6073', fontSize:'1.1rem', marginBottom:0}}>
            Visualiza el avance de todos los usuarios en los cursos de la plataforma. <br/>
            <span style={{fontSize:'0.98rem', color:'#6c757d'}}>Solo visible para administradores.</span>
          </div>
        </div>
      </div>
      <div className="perfil-content" style={{gap:'2.5rem'}}>
        {loading ? (
          <div className="loading">Cargando progreso...</div>
        ) : progress.length === 0 ? (
          <div className="error">No hay registros de progreso.</div>
        ) : (
          Object.entries(progressByUser).map(([nombre, cursos], idx) => (
            <div key={nombre} className="perfil-card" style={{marginBottom:0, background:'#f8f9fa', borderLeft:'6px solid #3f51b5', boxShadow:'0 2px 8px rgba(63,81,181,0.07)'}}>
              <div className="progreso-header" style={{marginBottom:18, alignItems:'flex-start', gap:8}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <span style={{fontSize:'2rem', color:'#3f51b5'}}>👤</span>
                  <h2 style={{margin:0, color:'#3f51b5', fontWeight:700, fontSize:'1.35rem'}}>{nombre}</h2>
                </div>
                <span style={{color:'#888', fontSize:'0.98rem', fontWeight:500}}>{cursos.length} curso{cursos.length > 1 ? 's' : ''}</span>
              </div>
              <div className="progreso-lista" style={{gap:18}}>
                {cursos.map((item, cidx) => {
                  const videoProgress = item.video_completed ? 100 : 0;
                  const scorePercent = item.evaluation_total > 0 && item.evaluation_score !== null ? ((item.evaluation_score / item.evaluation_total) * 100).toFixed(1) : '0';
                  const status = item.evaluation_status?.toLowerCase();
                  const estadoClase =
                    status === 'aprobado' ? 'estado-verde' :
                    status === 'reprobado' ? 'estado-rojo' :
                    'estado-amarillo';
                  const estadoTexto =
                    status === 'aprobado' ? '🟢 Aprobado' :
                    status === 'reprobado' ? '🔴 Reprobado' :
                    '🟡 Pendiente';
                  return (
                    <div key={cidx} className="progreso-item" style={{marginBottom:0, borderLeft:'4px solid #bdbdbd'}}>
                      <div className="progreso-header">
                        <h3 style={{margin:0, fontSize:'1.08rem', color:'#203a43'}}>{item.curso || `Curso ID ${item.course_id}`}</h3>
                        <span className={`estado-evaluacion ${estadoClase}`}>{estadoTexto}</span>
                      </div>
                      <div className="progreso-section">
                        <label>🎬 Video completado</label>
                        <div className="barra-progreso">
                          <div className="barra-interna" style={{ width: `${videoProgress}%` }}></div>
                        </div>
                        <span className="porcentaje-label">{videoProgress}%</span>
                      </div>
                      <div className="progreso-section">
                        <label>📊 Evaluación</label>
                        <div className="barra-progreso bg-eval">
                          <div className="barra-interna barra-eval" style={{ width: `${scorePercent}%` }}></div>
                        </div>
                        <span className="porcentaje-label">{scorePercent}%</span>
                      </div>
                      <div className="progreso-meta">
                        <span>🧠 Intentos usados: {item.attempts_used ?? '-'}</span>
                        <span>🕒 Última actualización: {item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
