import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  const response = await fetch("http://localhost/backend/login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();
  if (result.success) {
    localStorage.setItem("user", JSON.stringify(result.user));
    alert("Bienvenido " + result.user.nombre);
    // Redirige según el rol
  } else {
    alert(result.message);
  }
};


  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1>Iniciar Sesión</h1>
        <form className="login-form" onSubmit={handleLogin}>
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

          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
