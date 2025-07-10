// src/pages/AdminBitacora.jsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaCircle } from "react-icons/fa";
import "./AdminBitacora.css";

const AdminBitacora = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    estado: "rojo",
  });

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchTareas();
  }, []);

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
        alert("❌ Error al obtener tareas");
      }
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingTarea
      ? `/api/bitacora/${editingTarea.id}`
      : "/api/bitacora";
    const method = editingTarea ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        fetchTareas();
        setShowModal(false);
        setEditingTarea(null);
        setFormData({ titulo: "", descripcion: "", estado: "rojo" });
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("Error al guardar tarea:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;

    try {
      const response = await fetch(`/api/bitacora/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchTareas();
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  const handleEdit = (tarea) => {
    setEditingTarea(tarea);
    setFormData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      estado: tarea.estado,
    });
    setShowModal(true);
  };

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

  return (
    <div className="admin-body bitacora-container">
      <div className="bitacora-header">
        <h1>🚦 Bitácora Global (Admin)</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Nueva Tarea
        </button>
      </div>

      {loading ? (
        <p>Cargando tareas...</p>
      ) : tareas.length === 0 ? (
        <p>No hay tareas registradas.</p>
      ) : (
        <div className="bitacora-grid">
          {tareas.map((t) => (
            <div key={t.id} className={`tarea-card ${getColorClass(t.estado)}`}>
              <h3>{t.titulo}</h3>
              <p>{t.descripcion}</p>
              <div className="badge">
                <FaCircle /> {t.estado.toUpperCase()}
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => handleEdit(t)}>
                  <FaEdit />
                </button>
                <button className="btn-delete" onClick={() => handleDelete(t.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTarea ? "Editar Tarea" : "Nueva Tarea"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Título"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                required
              />
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
              >
                <option value="rojo">Pendiente</option>
                <option value="amarillo">En Progreso</option>
                <option value="verde">Completado</option>
              </select>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingTarea ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTarea(null);
                    setFormData({ titulo: "", descripcion: "", estado: "rojo" });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBitacora;
