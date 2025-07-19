import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Guardar token y datos de usuario
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        alert("✅ Bienvenido " + result.user.nombre);

        // Redirigir siempre a Home
        navigate("/home");
      } else {
        alert("❌ " + (result.message || "Credenciales incorrectas"));
      }

    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setLoading(false);
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
            disabled={loading}
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
