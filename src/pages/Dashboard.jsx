
import React, { useEffect, useState } from "react";
import axios from "axios";
<<<<<<< HEAD
import "./Dashboard.css";

=======
import "./Perfil.css";
>>>>>>> b759618499ce49bf81cf9f18afd3a02ffdb88646

const Dashboard = () => {
  const [progress, setProgress] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargoFiltro, setCargoFiltro] = useState('todos');


  useEffect(() => {
    const token = localStorage.getItem("authToken");
<<<<<<< HEAD
    if (!token) {
      setLoading(false);
      return;
    }
    // Obtener usuarios y progreso en paralelo
    Promise.all([
      axios.get("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/progress/all", { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(([usersRes, progressRes]) => {
        if (usersRes.data.success && progressRes.data.success) {
          setUsers(usersRes.data.users);
          setProgress(progressRes.data.progress);
        } else {
          alert("❌ Error al cargar usuarios o progreso");
        }
      })
      .catch((err) => {
        alert("❌ No se pudo cargar usuarios o progreso");
=======
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
>>>>>>> b759618499ce49bf81cf9f18afd3a02ffdb88646
      })
      .finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD

  // Agrupar progreso por usuario (nombre)
=======
  // Agrupar progreso por usuario
>>>>>>> b759618499ce49bf81cf9f18afd3a02ffdb88646
  const progressByUser = progress.reduce((acc, item) => {
    if (!acc[item.nombre]) acc[item.nombre] = [];
    acc[item.nombre].push(item);
    return acc;
  }, {});
<<<<<<< HEAD

  // Filtrar usuarios: solo los que no son admin ni Admin
  let nonAdminUsers = users.filter(u => u.rol !== 'admin' && u.rol !== 'Admin');
  // Filtro por cargo
  if (cargoFiltro !== 'todos') {
    nonAdminUsers = nonAdminUsers.filter(u => u.rol === cargoFiltro);
  }

  return (
    <div className="dashboard-container-bg">
      <div className="dashboard-header">
        <h1>Panel de Progreso General</h1>
        <div className="dashboard-description">
          Visualiza el avance de todos los usuarios en los cursos de la plataforma. <br />
          <span className="dashboard-subtitle">Solo visible para administradores.</span>
        </div>
        {/* Filtro de cargos */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <label style={{ fontWeight: 500, marginRight: 8 }}>Filtrar por cargo:</label>
          <select value={cargoFiltro} onChange={e => setCargoFiltro(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 8, border: '1.5px solid #bcd2f7', fontSize: '1rem' }}>
            <option value="todos">Todos</option>
            {[...new Set(users.filter(u => u.rol !== 'admin' && u.rol !== 'Admin').map(u => u.rol))].map(rol => (
              <option key={rol} value={rol}>{rol.charAt(0).toUpperCase() + rol.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="dashboard-loading">Cargando progreso...</div>
      ) : nonAdminUsers.length === 0 ? (
        <div className="dashboard-error">No hay usuarios para mostrar.</div>
      ) : (
        <div className="dashboard-users-grid">
          {nonAdminUsers.map((user, idx) => {
            const cursos = progressByUser[user.nombre] || [];
            return (
              <div key={user.id} className="dashboard-user-group">
                <div className="dashboard-user-header" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                  <span className="dashboard-user-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#3f51b5" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" />
                    </svg>
                  </span>
                  <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.18rem', color: '#2a3b4d', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nombre}</h2>
                  <span className="dashboard-user-role" style={{ marginLeft: 8, fontSize: '0.98rem', fontWeight: 600, background: '#eaf1fa', color: '#3f51b5', borderRadius: 7, padding: '2px 10px', border: '1px solid #d2e3f7', display: 'inline-flex', alignItems: 'center', letterSpacing: '0.01em' }}>
                    {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                  </span>
                </div>
                <div className="dashboard-user-count">
                  {cursos.length > 0 ? `${cursos.length} curso${cursos.length > 1 ? 's' : ''}` : 'Sin progreso aún'}
                </div>
                <div className="dashboard-grid">
                  {cursos.length > 0 ? cursos.map((item, cidx) => {
                    const videoProgress = item.video_completed ? 100 : 0;
                    const scorePercent =
                      item.evaluation_total > 0 && item.evaluation_score !== null
                        ? ((item.evaluation_score / item.evaluation_total) * 100).toFixed(1)
                        : '0';
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
                      <div key={cidx} className="dashboard-curso-card">
                        <div className="dashboard-progreso-header">
                          <h3>{item.curso || `Curso ID ${item.course_id}`}</h3>
                          <span className={`dashboard-estado-evaluacion dashboard-estado-${estadoClase.split('-')[1]}`}>{estadoTexto}</span>
                        </div>
                        <div className="dashboard-progreso-section">
                          <label>🎬 Video completado</label>
                          <div className="dashboard-barra-progreso">
                            <div className="dashboard-barra-interna" style={{ width: `${videoProgress}%` }}></div>
                          </div>
                          <span className="dashboard-porcentaje-label">{videoProgress}%</span>
                        </div>
                        <div className="dashboard-progreso-section">
                          <label>📊 Evaluación</label>
                          <div className="dashboard-barra-progreso dashboard-bg-eval">
                            <div className="dashboard-barra-interna dashboard-barra-eval" style={{ width: `${scorePercent}%` }}></div>
                          </div>
                          <span className="dashboard-porcentaje-label">{scorePercent}%</span>
                        </div>
                        <div className="dashboard-progreso-meta">
                          <span>🧠 Intentos usados: {item.attempts_used ?? '-'}</span>
                          <span>🕒 Última actualización: {item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}</span>
                        </div>
                      </div>
                    );
                  }) : <div className="dashboard-error">Este usuario aún no tiene progreso registrado.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
=======

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
>>>>>>> b759618499ce49bf81cf9f18afd3a02ffdb88646
    </div>
  );
};

export default Dashboard;
