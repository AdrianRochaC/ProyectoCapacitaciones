import React from "react";
import Layout from "../components/LoadingScreen/Layout";

export default function AdminDocumentos() {
  return (
    <div style={{
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
    }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Gestión de Documentos</h1>
      <button
        style={{
          background: "linear-gradient(90deg, #8e24aa, #43e97b)",
          color: "#fff",
          padding: "0.8rem 2rem",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        + Agregar archivo
      </button>
      {/* Aquí podrías mostrar la lista de archivos en el futuro */}
    </div>
  );
}
