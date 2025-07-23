import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { initializePreferences } from '../utils/preferencesApi';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Limpiar estilos personalizados al cargar la página de login
  useEffect(() => {
    // Solo si NO hay usuario autenticado
    const user = localStorage.getItem('user');
    if (!user || user === 'null') {
      // Limpiar preferencias del localStorage
      localStorage.removeItem('theme');
      localStorage.removeItem('colorScheme');
      localStorage.removeItem('fontSize');
      localStorage.removeItem('fontFamily');
      localStorage.removeItem('spacing');
      localStorage.removeItem('animations');
      localStorage.removeItem('backgroundType');
      localStorage.removeItem('backgroundImageUrl');
      localStorage.removeItem('backgroundColor');
      localStorage.removeItem('storageCleared');
      localStorage.removeItem('backgroundImageTooLarge');

      // Restablecer estilos del DOM
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('data-color-scheme', 'default');
      document.documentElement.setAttribute('data-font-size', 'medium');
      document.documentElement.setAttribute('data-font-family', 'inter');
      document.documentElement.setAttribute('data-spacing', 'normal');
      document.documentElement.setAttribute('data-animations', 'enabled');
      document.documentElement.setAttribute('data-background-type', 'color');
      document.documentElement.setAttribute('data-background-color', 'default');
      document.documentElement.style.removeProperty('--background-image');
    }
  }, []);

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

        // Inicializar/aplicar preferencias personalizadas del usuario
        await initializePreferences();

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
