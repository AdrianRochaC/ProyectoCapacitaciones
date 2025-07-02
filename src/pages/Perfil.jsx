// src/pages/Perfil.jsx
import React, { useState, useEffect } from "react";
import "./Perfil.css";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      if (userData) {
        setUser(userData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="loading">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="perfil-container">
        <div className="error">No se pudieron cargar los datos del usuario</div>
      </div>
    );
  }

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
            <div className="info-row">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{user.nombre}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Rol:</span>
              <span className="info-value role-badge">{user.rol}</span>
            </div>
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="perfil-card">
          <h2>Información de la Cuenta</h2>
          <div className="perfil-info">
            <div className="info-row">
              <span className="info-label">Estado:</span>
              <span className="info-value status-active">✅ Activa</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tipo de Usuario:</span>
              <span className="info-value">{user.rol === 'Admin' ? 'Administrador del Sistema' : 'Usuario Estándar'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Permisos:</span>
              <span className="info-value">
                {user.rol === 'Admin' 
                  ? 'Control total del sistema' 
                  : 'Acceso a cursos y funcionalidades básicas'
                }
              </span>
            </div>
          </div>
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