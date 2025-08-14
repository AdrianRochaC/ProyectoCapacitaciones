import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaCircle, FaUser } from "react-icons/fa";
import "./AdminBitacora.css";

const AdminBitacora = () => {
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    estado: "rojo",
    asignados: [],
    deadline: "",
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchTareas();
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const fetchTareas = async () => {
    try {
      const response = await fetch("/api/bitacora", {
        headers: { Authorization: `Bearer ${token}` },
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
        setFormData({
          titulo: "",
          descripcion: "",
          estado: "rojo",
          asignados: [],
          deadline: "",
        });
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) fetchTareas();
      else alert("❌ " + data.message);
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
      asignados: (() => {
        try {
          return Array.isArray(tarea.asignados)
            ? tarea.asignados
            : JSON.parse(tarea.asignados || "[]");
        } catch (error) {
          console.warn(`Error parseando asignados para tarea ${tarea.id}:`, error);
          return [];
        }
      })(),
      deadline: tarea.deadline?.split("T")[0] || "",
    });
    setShowModal(true);
  };

  const handleCheckboxChange = (id) => {
    setFormData((prev) => {
      const asignados = prev.asignados.includes(id)
        ? prev.asignados.filter((uid) => uid !== id)
        : [...prev.asignados, id];
      return { ...prev, asignados };
    });
  };

  const getStatusClass = (estado) => {
    return `status-${estado}`;
  };

  const estados = [
    { key: "rojo", label: "🔴 Pendientes" },
    { key: "amarillo", label: "🟡 En Progreso" },
    { key: "verde", label: "✅ Completadas" },
  ];

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "verde":
        return "COMPLETADO";
      case "amarillo":
        return "EN PROGRESO";
      case "rojo":
      default:
        return "PENDIENTE";
    }
  };

  return (
    <div className="admin-body bitacora-container">
      <div className="bitacora-header">
        <h1>🚦 Bitácora Global</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Nueva Tarea
        </button>
      </div>

      {loading ? (
        <p>Cargando tareas...</p>
      ) : tareas.length === 0 ? (
        <p>No hay tareas registradas.</p>
      ) : (
        <div className="bitacora-columns">
          {estados.map(({ key, label }) => (
            <div key={key} className="bitacora-column">
              <h2 className={`titulo-columna ${getStatusClass(key)}`}>
                {label} ({tareas.filter((t) => t.estado === key).length})
              </h2>
              {tareas
                .filter((t) => t.estado === key)
                .map((t) => {
                  let asignados = [];
                  try {
                    asignados = Array.isArray(t.asignados)
                      ? t.asignados
                      : JSON.parse(t.asignados || "[]");
                  } catch (error) {
                    console.warn(`Error parseando asignados para tarea ${t.id}:`, error);
                    asignados = [];
                  }
                  return (
                    <div key={t.id} className={`admin-tarea-card admin-status-${t.estado}`}>
                      <div className="admin-tarea-title">{t.titulo}</div>
                      <p>{t.descripcion}</p>
                      <div className="admin-badge">
                        <FaCircle /> {getEstadoLabel(t.estado)}
                      </div>
                      <div className="tarea-info">
                        <div className="info-item">
                          <strong>📅 Límite:</strong>{" "}
                          {new Date(t.deadline).toLocaleDateString("es-ES")}
                        </div>
                        <div className="info-item">
                          <strong>👥 Asignados:</strong>{" "}
                          <div className="asignados-container">
                            {asignados.length === 0 ? (
                              <span className="no-asignados">Sin asignar</span>
                            ) : (
                              asignados.map((id) => {
                                const user = usuarios.find((u) => u.id === id);
                                return (
                                  <span key={id} className="asignado-badge">
                                    <FaUser /> {user?.nombre || `ID ${id}`}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => handleEdit(t)} title="Editar tarea">
                          <FaEdit />
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(t.id)} title="Eliminar tarea">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTarea ? "✏️ Editar Tarea" : "➕ Nueva Tarea"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>📝 Título de la tarea:</label>
                <input
                  type="text"
                  placeholder="Ingresa el título de la tarea"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>📄 Descripción:</label>
                <textarea
                  placeholder="Describe los detalles de la tarea"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>🚦 Estado:</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="rojo">🔴 Pendiente</option>
                  <option value="amarillo">🟡 En Progreso</option>
                  <option value="verde">✅ Completado</option>
                </select>
              </div>

              <div className="form-group">
                <label>📅 Fecha Límite:</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>👥 Asignar usuarios:</label>
                <div className="usuarios-checkboxes">
                  {usuarios.length === 0 ? (
                    <p className="no-usuarios">No hay usuarios disponibles</p>
                  ) : (
                    usuarios.map((u) => (
                      <label key={u.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.asignados.includes(u.id)}
                          onChange={() => handleCheckboxChange(u.id)}
                        />
                        <span className="checkmark"></span>
                        {u.nombre}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingTarea ? "💾 Actualizar" : "✨ Crear"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTarea(null);
                    setFormData({
                      titulo: "",
                      descripcion: "",
                      estado: "rojo",
                      asignados: [],
                      deadline: "",
                    });
                  }}
                >
                  ❌ Cancelar
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