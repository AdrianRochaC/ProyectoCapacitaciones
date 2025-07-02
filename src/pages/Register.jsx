import React, { useState } from "react";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Gerente");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: name,    // ← Corregido: usaba 'nombre' pero la variable es 'name'
          email: email, 
          password: password, 
          rol: role        // ← Corregido: usaba 'rol' pero la variable es 'role'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert("✅ " + result.message);
        // Limpiar formulario después del registro exitoso
        setName("");
        setEmail("");
        setPassword("");
        setRole("Gerente");
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión. Verifica que el servidor esté funcionando.");
    }
  };

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

          <label>Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Gerente">Gerente</option>
            <option value="Contabilidad">Contabilidad</option>
            <option value="Compras">Compras</option>
            <option value="Atencion al Cliente">Atención al Cliente</option>
            <option value="Admin">Administrador</option>
          </select>

          <button type="submit">Crear cuenta</button>
        </form>
      </div>
    </div>
  );
};

export default Register;