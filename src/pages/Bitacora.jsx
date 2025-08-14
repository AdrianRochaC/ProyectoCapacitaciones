import React, { useEffect, useState } from "react";
import "./Bitacora.css";
import { FaCircle } from "react-icons/fa";

const Bitacora = () => {
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTareas = async () => {
    try {
      const response = await fetch("/api/bitacora", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTareas(data.tareas || []);
      } else {
        alert("❌ Error al obtener las tareas");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ No se pudo cargar la bitácora.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsuarios(data.usuarios);
    } catch (e) {
      console.error("Error al cargar usuarios:", e);
    }
  };

  const cambiarEstado = async (tarea, nuevoEstado) => {
    try {
      const response = await fetch(`/api/bitacora/${tarea.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...tarea, estado: nuevoEstado }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTareas();
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const getNombreUsuario = (id) => {
    const u = usuarios.find((user) => user.id === id);
    return u ? u.nombre : "Desconocido";
  };

  const getColorClass = (estado) => {
    switch (estado) {
      case "verde":
        return "usuario-verde";
      case "amarillo":
        return "usuario-amarillo";
      case "rojo":
      default:
        return "usuario-rojo";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "verde":
        return "Completado";
      case "amarillo":
        return "En Progreso";
      case "rojo":
      default:
        return "Pendiente";
    }
  };

  useEffect(() => {
    fetchTareas();
    fetchUsuarios();
  }, []);

  // Agrupar por estado
  const tareasAsignadas = tareas.filter((t) =>
                (() => {
              try {
                return JSON.parse(t.asignados || "[]").includes(user.id);
              } catch (error) {
                console.warn(`Error parseando asignados para tarea ${t.id}:`, error);
                return false;
              }
            })()
  );

  const tareasPorEstado = {
    rojo: tareasAsignadas.filter((t) => t.estado === "rojo"),
    amarillo: tareasAsignadas.filter((t) => t.estado === "amarillo"),
    verde: tareasAsignadas.filter((t) => t.estado === "verde"),
  };

  return (
    <div className="bitacora-body">
      <div className="bitacora-container">
        <h1>📋 Bitácora de Tareas</h1>

        {loading ? (
          <p>Cargando tareas...</p>
        ) : tareasAsignadas.length === 0 ? (
          <p>No tienes tareas asignadas.</p>
        ) : (
          <div className="usuario-bitacora-columns">
            {Object.entries(tareasPorEstado).map(([estado, tareasEstado]) => (
              <div key={estado} className="usuario-bitacora-column">
                <h2 className={`usuario-titulo-columna ${getColorClass(estado)}`}>
                  {getStatusText(estado)} ({tareasEstado.length})
                </h2>
                {tareasEstado.map((tarea) => {
                  let asignadoId = null;
    try {
      const asignados = JSON.parse(tarea.asignados || "[]");
      asignadoId = asignados[0];
    } catch (error) {
      console.warn(`Error parseando asignados para tarea ${tarea.id}:`, error);
    }
                  return (
                    <div
                      key={tarea.id}
                      className={`usuario-tarea-card usuario-${getColorClass(tarea.estado)}`}
                    >
                      <h3>{tarea.titulo}</h3>
                      <p>{tarea.descripcion}</p>
                      <p>
                        <strong>Asignado a:</strong>{" "}
                        {getNombreUsuario(asignadoId)}
                      </p>
                      <span className="usuario-badge">
                        <FaCircle /> {getStatusText(tarea.estado)}
                      </span>
                      <p>Fecha límite: {new Date(tarea.deadline).toLocaleDateString("es-ES")}</p>
                      <small>
                        Creado:{" "}
                        {new Date(tarea.created_at).toLocaleDateString("es-ES")}
                      </small>

                      {tarea.estado !== "verde" && (
                        <div className="estado-select">
                          <label>Actualizar estado:</label>
                          <select
                            value={tarea.estado}
                            onChange={(e) =>
                              cambiarEstado(tarea, e.target.value)
                            }
                          >
                            <option value="rojo">Pendiente</option>
                            <option value="amarillo">En Progreso</option>
                            <option value="verde">Completado</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bitacora;
