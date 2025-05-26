import React, { useEffect } from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3 segundos simulados

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="loading-screen">
      <div className="loading-box">
        <img
          src="/logo.png" // Coloca aquí tu logo en la carpeta "public"
          alt="Davivir Cursos"
          className="logo-img"
        />
        <h1 className="platform-title">Davivir Plataforma de Cursos</h1>
        <div className="loader"></div>
        <p className="loading-text">Cargando, por favor espera...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
