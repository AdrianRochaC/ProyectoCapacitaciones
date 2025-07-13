import React, { useEffect, useState } from "react";
import "./Perfil.css"; // reutiliza estilos del perfil

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("authToken");

      if (userData && token) {
        setUser(userData);

        const response = await fetch("/api/progress", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.success) {
          setProgress(result.progress);
          console.log("📊 Progreso obtenido:", result.progress);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error cargando el progreso:", error);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="perfil-container">
        <div className="loading">Cargando progreso...</div>
      </div>
    );

  if (!user)
    return (
      <div className="perfil-container">
        <div className="error">No se pudieron cargar los datos del usuario</div>
      </div>
    );

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>📊 Mi Progreso (Vista Dashboard)</h1>
      </div>

      <div className="perfil-content">
        {progress.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>
            No tienes progreso registrado aún.
          </p>
        ) : (
          <div className="progreso-lista">
            {progress.map((item, index) => {
              const videoProgress = item.video_completed ? 100 : 0;
              const scorePercent =
                item.evaluation_total > 0
                  ? ((item.evaluation_score / item.evaluation_total) * 100).toFixed(1)
                  : "0";
              const status = item.evaluation_status?.toLowerCase();

              const estadoClase =
                status === "aprobado"
                  ? "estado-verde"
                  : status === "reprobado"
                  ? "estado-rojo"
                  : "estado-amarillo";

              const estadoTexto =
                status === "aprobado"
                  ? "🟢 Aprobado"
                  : status === "reprobado"
                  ? "🔴 Reprobado"
                  : "🟡 Pendiente";

              return (
                <div key={index} className="progreso-item">
                  <div className="progreso-header">
                    <h3>{item.course_title || `Curso ID ${item.course_id}`}</h3>
                    <span className={`estado-evaluacion ${estadoClase}`}>{estadoTexto}</span>
                  </div>

                  <div className="progreso-section">
                    <label>🎬 Video completado</label>
                    <div className="barra-progreso">
                      <div
                        className="barra-interna"
                        style={{ width: `${videoProgress}%` }}
                      ></div>
                    </div>
                    <span className="porcentaje-label">{videoProgress}%</span>
                  </div>

                  <div className="progreso-section">
                    <label>📊 Evaluación</label>
                    <div className="barra-progreso bg-eval">
                      <div
                        className="barra-interna barra-eval"
                        style={{ width: `${scorePercent}%` }}
                      ></div>
                    </div>
                    <span className="porcentaje-label">{scorePercent}%</span>
                  </div>

                  <div className="progreso-meta">
                    <span>🧠 Intentos usados: {item.attempts_used}</span>
                    <span>
                      🕒 Última actualización:{" "}
                      {new Date(item.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
