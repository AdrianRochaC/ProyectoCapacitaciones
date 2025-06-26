import React, { useState } from "react";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Gerente");

  const handleRegister = (e) => {
    e.preventDefault();

    // Aquí luego puedes hacer la petición a la base de datos
    console.log("Registrando:", { name, email, password, role });

    // Reset formulario si quieres
    setName("");
    setEmail("");
    setPassword("");
    setRole("Gerente");
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
