// src/pages/Bitacora.jsx
import React, { useEffect, useState } from "react";
import "./Bitacora.css";
import { FaCircle } from "react-icons/fa";

const Bitacora = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");

  const fetchTareas = async () => {
    try {
      const response = await fetch("/api/bitacora", {
        headers: {
          Authorization: `Bearer ${token}`
        }
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

  useEffect(() => {
    fetchTareas();
  }, []);

  const getColorClass = (estado) => {
    switch (estado) {
      case "verde":
        return "status-verde";
      case "amarillo":
        return "status-amarillo";
      case "rojo":
      default:
        return "status-rojo";
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

  return (
    <div className="bitacora-body">
    <div className="bitacora-container">
      <h1>📋 Bitácora de Tareas</h1>

      {loading ? (
        <p>Cargando tareas...</p>
      ) : tareas.length === 0 ? (
        <p>No hay tareas disponibles.</p>
      ) : (
        <div className="bitacora-grid">
          {tareas.map((tarea) => (
            <div key={tarea.id} className={`tarea-card ${getColorClass(tarea.estado)}`}>
              <h3>{tarea.titulo}</h3>
              <p>{tarea.descripcion}</p>
              <span className="badge">
                <FaCircle /> {getStatusText(tarea.estado)}
              </span>
              <small>Creado: {new Date(tarea.created_at).toLocaleDateString("es-ES")}</small>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default Bitacora;
