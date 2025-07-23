import React from "react";
import Layout from "../components/LoadingScreen/Layout";

export default function Documentos() {
  return (
    <div style={{
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
    }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Mis Documentos</h1>
      <p style={{ color: "#666", fontSize: "1.1rem" }}>
        Aquí aparecerán los documentos asignados a tu rol o usuario.<br />
        (Por ahora no hay documentos disponibles)
      </p>
    </div>
  );
}
