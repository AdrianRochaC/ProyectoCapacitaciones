import React, { useState, useEffect } from "react";
import "./Perfil.css";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem("authToken");

      if (userData && token) {
        setUser(userData);

        // Obtener progreso
        const response = await fetch("api/progress", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.success) {
          setProgress(result.progress);
          console.log("📊 Progreso obtenido del backend:", result.progress); // LOG
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error cargando perfil o progreso:", error);
      setLoading(false);
    }
  };

  if (loading) return <div className="perfil-container"><div className="loading">Cargando perfil...</div></div>;
  if (!user) return <div className="perfil-container"><div className="error">No se pudieron cargar los datos del usuario</div></div>;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>👤 Mi Perfil</h1>
      </div>

      <div className="perfil-content">
        {/* Información del perfil */}
        <div className="perfil-card">
          <h2>Información Personal</h2>
          <div className="perfil-info">
            <div className="info-row"><span className="info-label">Nombre:</span><span className="info-value">{user.nombre}</span></div>
            <div className="info-row"><span className="info-label">Email:</span><span className="info-value">{user.email}</span></div>
            <div className="info-row"><span className="info-label">Rol:</span><span className="info-value role-badge">{user.rol}</span></div>
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="perfil-card">
          <h2>Información de la Cuenta</h2>
          <div className="perfil-info">
            <div className="info-row"><span className="info-label">Estado:</span><span className="info-value status-active">✅ Activa</span></div>
            <div className="info-row"><span className="info-label">Tipo de Usuario:</span><span className="info-value">{user.rol === 'Admin' ? 'Administrador del Sistema' : 'Usuario Estándar'}</span></div>
            <div className="info-row"><span className="info-label">Permisos:</span><span className="info-value">{user.rol === 'Admin' ? 'Control total del sistema' : 'Acceso a cursos y funcionalidades básicas'}</span></div>
          </div>
        </div>

        <div className="perfil-card">
  <h2 style={{ marginBottom: '1rem' }}>📈 Progreso de Cursos</h2>
  {progress.length === 0 ? (
    <p style={{ fontStyle: 'italic' }}>No tienes progreso registrado aún.</p>
  ) : (
    <div className="progreso-lista">
      {progress.map((item, index) => {
        const videoProgress = item.video_completed ? 100 : 0;
        const scorePercent = item.evaluation_total > 0 ? ((item.evaluation_score / item.evaluation_total) * 100).toFixed(1) : '0';
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
          <div key={index} className="progreso-item">
            <div className="progreso-header">
              <h3>{item.course_title || `Curso ID ${item.course_id}`}</h3>
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
              <span>🧠 Intentos usados: {item.attempts_used}</span>
              <span>🕒 Última actualización: {new Date(item.updated_at).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>


        {/* Nota informativa */}
        <div className="perfil-card info-card">
          <div className="info-message">
            <div className="info-icon">ℹ️</div>
            <div className="info-text">
              <h3>¿Necesitas cambiar tu información?</h3>
              <p>Solo los administradores pueden modificar la información de las cuentas. 
                 Si necesitas actualizar tus datos, contacta a tu administrador.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
