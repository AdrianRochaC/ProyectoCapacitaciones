// src/pages/Bitacora.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [progressData, setProgressData] = useState([]); // array por defecto
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                console.log("📡 Obteniendo progreso de /api/progress/all...");
                const response = await axios.get("/api/progress/all", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const rawData = response.data;
                const progressList = Array.isArray(rawData?.progress) ? rawData.progress : [];

                if (!Array.isArray(rawData?.progress)) {
                    console.warn("⚠️ 'progress' no es un array. Se recibió:", rawData?.progress);
                }

                setProgressData(progressList);
            } catch (error) {
                console.error("❌ Error al cargar el progreso:", error);
                setError("No se pudo cargar el progreso. Verifica tu conexión o el servidor.");
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);


    if (loading) return <p>Cargando progreso...</p>;
    if (error) return <p style={{ color: "red" }}>❌ {error}</p>;
    if (!progressData || progressData.length === 0) return <p>No hay progreso registrado aún.</p>;

    return (
        <div className="dashboard-container">
            <h1>📊 Progreso de Usuarios</h1>
            <div className="dashboard-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Curso</th>
                            <th>Video</th>
                            <th>Evaluación</th>
                            <th>Intentos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {progressData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.nombre || "Desconocido"}</td>
                                <td>{item.curso || "Sin curso"}</td>
                                <td>{item.video_completed ? "✅" : "❌"}</td>
                                <td>
                                    {item.evaluation_status === "aprobado" ? "✅ Aprobado" :
                                        item.evaluation_status === "reprobado" ? "❌ Reprobado" :
                                            "⏳ Pendiente"}
                                    {" "}
                                    ({item.evaluation_score ?? 0}/{item.evaluation_total ?? 0})
                                </td>
                                <td>{item.attempts_used ?? 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
