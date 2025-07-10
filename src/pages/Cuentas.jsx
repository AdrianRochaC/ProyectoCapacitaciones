// src/pages/Cuentas.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cuentas.css";

const Cuentas = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Todos");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    nombre: "",
    email: "",
    rol: "",
    activo: true
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();

      if (!token) {
        setError("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
        setUsers([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 401) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        setUsers([]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Error al cargar usuarios');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("No se puede conectar con el servidor. Verifica que esté funcionando.");
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.");
      }

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setEditData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      activo: user.activo
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowPasswordModal(false);
    setNewPassword("");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditData({
        nombre: selectedUser.nombre,
        email: selectedUser.email,
        rol: selectedUser.rol,
        activo: selectedUser.activo
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = getAuthToken();

      if (!token) {
        alert("❌ No hay token de autenticación. Por favor, inicia sesión nuevamente.");
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        setUsers(prev => prev.map(user =>
          user.id === selectedUser.id
            ? { ...user, ...editData }
            : user
        ));
        setSelectedUser({ ...selectedUser, ...editData });
        setIsEditing(false);
        alert("✅ Usuario actualizado correctamente");
      } else {
        const result = await response.json();
        alert("❌ " + (result.message || 'Error al actualizar usuario'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert("❌ Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("❌ La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      const token = getAuthToken();

      if (!token) {
        alert("❌ No hay token de autenticación. Por favor, inicia sesión nuevamente.");
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setNewPassword("");
        alert("✅ Contraseña actualizada correctamente");
      } else {
        const result = await response.json();
        alert("❌ " + (result.message || 'Error al cambiar contraseña'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert("❌ Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setSaving(true);
    try {
      const token = getAuthToken();

      if (!token) {
        alert("❌ No hay token de autenticación. Por favor, inicia sesión nuevamente.");
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: !currentStatus })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user =>
          user.id === userId
            ? { ...user, activo: !currentStatus }
            : user
        ));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => ({ ...prev, activo: !currentStatus }));
        }
        alert(`✅ Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      } else {
        const result = await response.json();
        alert("❌ " + (result.message || 'Error al cambiar estado'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert("❌ Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "Todos" || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(users.map(user => user.rol))];
  const roles = ["Todos", ...uniqueRoles];

  if (loading) {
    return (
      <div className="cuentas-container">
        <div className="loading">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cuentas-container">
        <div className="error-message">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadUsers}>
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cuentas-container">
      <div className="cuentas-header">
        <h1>👥 Gestión de Cuentas</h1>

        {/* 🟢 Botón para crear nueva cuenta */}
        <div className="crear-cuenta-btn" style={{ margin: "10px 0" }}>
          <button className="btn btn-success" onClick={() => navigate("/register")}>
            ➕ Crear nueva cuenta
          </button>
        </div>

        <div className="cuentas-stats">
          <div className="stat-card">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Usuarios</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => u.activo).length}</span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => !u.activo).length}</span>
            <span className="stat-label">Inactivos</span>
          </div>
        </div>
      </div>

      {/* Botón para refrescar */}
      <div className="cuentas-actions">
        <button className="btn btn-outline" onClick={loadUsers} disabled={loading}>
          {loading ? '⏳ Cargando...' : '🔄 Actualizar'}
        </button>
      </div>

      {/* Filtros */}
      <div className="cuentas-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="role-filter">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="usuarios-grid">
        {filteredUsers.map(user => (
          <div 
            key={user.id} 
            className={`usuario-card ${!user.activo ? 'inactive' : ''}`}
            onClick={() => handleUserClick(user)}
          >
            <div className="usuario-avatar">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="usuario-info">
              <h3>{user.nombre}</h3>
              <p className="usuario-email">{user.email}</p>
              <span className={`usuario-rol rol-${user.rol.toLowerCase().replace(/\s+/g, '-')}`}>
                {user.rol}
              </span>
            </div>
            <div className="usuario-status">
              {user.activo ? (
                <span className="status-active">✅ Activo</span>
              ) : (
                <span className="status-inactive">❌ Inactivo</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && users.length > 0 && (
        <div className="no-results">
          <p>No se encontraron usuarios que coincidan con los filtros.</p>
        </div>
      )}

      {users.length === 0 && !loading && !error && (
        <div className="no-users">
          <h2>📝 No hay usuarios registrados</h2>
          <p>Aún no se han registrado usuarios en el sistema.</p>
        </div>
      )}

      {/* Modal de detalles del usuario */}
      {selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 {selectedUser.nombre}</h2>
              <button className="modal-close" onClick={handleCloseModal}>❌</button>
            </div>

            <div className="modal-body">
              {!isEditing ? (
                // Vista de solo lectura
                <div className="usuario-details">
                  <div className="detail-row">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{selectedUser.nombre}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Rol:</span>
                    <span className={`detail-value rol-badge rol-${selectedUser.rol.toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedUser.rol}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Estado:</span>
                    <span className={`detail-value ${selectedUser.activo ? 'status-active' : 'status-inactive'}`}>
                      {selectedUser.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </div>
                  {selectedUser.fecha_creacion && (
                    <div className="detail-row">
                      <span className="detail-label">Fecha de registro:</span>
                      <span className="detail-value">{selectedUser.fecha_creacion}</span>
                    </div>
                  )}
                </div>
              ) : (
                // Vista de edición
                <form onSubmit={handleSaveUser} className="edit-form">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={editData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Rol</label>
                    <select 
                      value={editData.rol} 
                      onChange={(e) => handleInputChange('rol', e.target.value)}
                    >
                      {uniqueRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                      <option value="Admin">Administrador</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Contabilidad">Contabilidad</option>
                      <option value="Compras">Compras</option>
                      <option value="Atencion al Cliente">Atención al Cliente</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editData.activo}
                        onChange={(e) => handleInputChange('activo', e.target.checked)}
                      />
                      <span>Usuario activo</span>
                    </label>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-actions">
              {!isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleEditToggle}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-outline" onClick={() => setShowPasswordModal(true)}>
                    🔐 Cambiar Contraseña
                  </button>
                  <button 
                    className={`btn ${selectedUser.activo ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.activo)}
                    disabled={saving}
                  >
                    {selectedUser.activo ? '⏸️ Desactivar' : '▶️ Activar'}
                  </button>
                </>
              ) : (
                <>
                  <button type="submit" className="btn btn-primary" onClick={handleSaveUser} disabled={saving}>
                    {saving ? '⏳ Guardando...' : '💾 Guardar'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleEditToggle}>
                    ❌ Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔐 Cambiar Contraseña</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>❌</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nueva Contraseña para {selectedUser.nombre}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleResetPassword} disabled={saving}>
                {saving ? '⏳ Actualizando...' : '🔐 Actualizar Contraseña'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cuentas;
