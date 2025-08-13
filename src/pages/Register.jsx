import React, { useState, useEffect } from "react";
import "./Register.css";

const API_URL = 'http://localhost:3001';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargos, setCargos] = useState([]);
  const [selectedCargoId, setSelectedCargoId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCargos();
  }, []);

  const fetchCargos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cargos/activos`);
      if (response.ok) {
        const data = await response.json();
        setCargos(data.cargos);
        if (data.cargos.length > 0) {
          setSelectedCargoId(data.cargos[0].id);
        }
      } else {
        console.error('Error obteniendo cargos');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedCargoId) {
      alert("❌ Por favor selecciona un cargo");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: name,
          email: email, 
          password: password, 
          cargo_id: parseInt(selectedCargoId)
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert("✅ " + result.message);
        // Limpiar formulario después del registro exitoso
        setName("");
        setEmail("");
        setPassword("");
        setSelectedCargoId(cargos.length > 0 ? cargos[0].id : "");
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión. Verifica que el servidor esté funcionando.");
    }
  };

  if (loading) {
    return (
      <div className="register-wrapper">
        <div className="register-container">
          <div className="loading">Cargando cargos disponibles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h1>Regístrate</h1>
        <form className="register-form" onSubmit={handleRegister}>
          <label>Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Cargo/Departamento</label>
          <select 
            value={selectedCargoId} 
            onChange={(e) => setSelectedCargoId(e.target.value)}
            required
          >
            {cargos.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.nombre} - {cargo.descripcion}
              </option>
            ))}
          </select>

          <button type="submit">Crear cuenta</button>
        </form>
      </div>
    </div>
  );
};

export default Register;