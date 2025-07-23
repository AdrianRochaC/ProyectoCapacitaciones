import React, { useState, useEffect } from "react";
import "./AdminCoursesPage.css";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, ClipboardList, Users2, BarChart3, User } from "lucide-react";

const AdminCoursesPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [role, setRole] = useState("Gerente");
  const [courses, setCourses] = useState([]);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState(1);
  const [timeLimit, setTimeLimit] = useState(30);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCourses, setShowCourses] = useState(false); // NUEVO
  const [videoFile, setVideoFile] = useState(null); // Nuevo estado para archivo
  const [useFile, setUseFile] = useState(false); // Nuevo estado para alternar entre link y archivo

  const API_URL = "/api";
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    fetch(`${API_URL}/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Sesión expirada. Inicia sesión nuevamente.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) setCourses(data.courses);
      })
      .catch(console.error);
  };

  const convertToEmbedUrl = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const convertToWatchUrl = (embedUrl) => {
    if (!embedUrl) return null;
    const match = embedUrl.match(/youtube\.com\/embed\/([^?&]+)/);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : embedUrl;
  };

  const ensureEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) {
      return url;
    }
    return convertToEmbedUrl(url);
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  // Nuevo handler para alternar entre enlace y archivo
  const handleUseFileChange = (value) => {
    setUseFile(value);
    if (value) {
      setVideoUrl(""); // Limpiar enlace si se va a usar archivo
    } else {
      setVideoFile(null); // Limpiar archivo si se va a usar enlace
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || (!videoUrl && !videoFile)) {
      alert("Completa todos los campos y elige un link o archivo de video.");
      return;
    }

    let formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("role", role);
    formData.append("attempts", attempts);
    formData.append("timeLimit", timeLimit);
    formData.append("evaluation", JSON.stringify(questions));

    if (useFile && videoFile) {
      formData.append("videoFile", videoFile);
    } else if (videoUrl) {
      // Si es link de YouTube, convertir a embed
      const embed = convertToEmbedUrl(videoUrl);
      if (!embed) {
        alert("Enlace YouTube inválido.");
        return;
      }
      formData.append("videoUrl", embed);
    }

    try {
      const url = editingCourse ? `${API_URL}/courses/${editingCourse}` : `${API_URL}/courses`;
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        fetchCourses();
        resetForm();
        alert(editingCourse ? "Curso actualizado exitosamente" : "Curso creado exitosamente");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error al enviar curso:", err);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setVideoFile(null);
    setUseFile(false);
    setRole("Gerente");
    setQuestions([]);
    setAttempts(1);
    setTimeLimit(30);
    setShowEvaluation(false);
    setEditingCourse(null);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctIndex: 0 }]);
  };

  const updateQuestionText = (i, val) => {
    const cp = [...questions];
    cp[i].question = val;
    setQuestions(cp);
  };

  const updateOption = (qi, oi, val) => {
    const cp = [...questions];
    cp[qi].options[oi] = val;
    setQuestions(cp);
  };

  const updateCorrectIndex = (qi, val) => {
    const cp = [...questions];
    cp[qi].correctIndex = parseInt(val);
    setQuestions(cp);
  };

  const handleDeleteCourse = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este curso?");
    if (!confirmDelete) return;

    if (!token) {
      alert("⚠️ Token no encontrado. Inicia sesión nuevamente.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert("⚠️ Sesión expirada. Inicia sesión nuevamente.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert("✅ Curso eliminado exitosamente.");
        fetchCourses();
      } else {
        alert(`❌ Error: ${data.message || "No se pudo eliminar el curso."}`);
      }
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      alert("❌ Error al eliminar el curso. Intenta nuevamente.");
    }
  };

  const handleEditCourse = async (course) => {
    setTitle(course.title);
    setDescription(course.description);

    const videoUrl = course.videoUrl || course.video_url;
    const watchUrl = convertToWatchUrl(videoUrl);
    setVideoUrl(watchUrl);

    setRole(course.role || "Gerente");
    setAttempts(course.attempts || 1);
    setTimeLimit(course.timeLimit || course.time_limit || 30);
    setEditingCourse(course.id);
    setShowEvaluation(true);

    if (course.evaluation && course.evaluation.length > 0) {
      setQuestions(course.evaluation);
    } else {
      try {
        const res = await fetch(`${API_URL}/courses/${course.id}/questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("❌ Error al cargar preguntas:", err);
        setQuestions([]);
      }
    }

    setShowModal(true);
  };

  // --- DASHBOARD VISUAL ---
  const dashboardCards = [
    {
      title: "Gestión de Cursos",
      icon: <BookOpenCheck size={36} color="#2962ff" />,
      description: "Crea, edita y elimina cursos y evaluaciones.",
      route: "/admin-courses",
      enabled: true,
    },
    {
      title: "Bitácora",
      icon: <ClipboardList size={36} color="#43e97b" />,
      description: "Gestiona tareas y seguimiento de actividades.",
      route: "/AdminBitacora",
      enabled: true,
    },
    {
      title: "Cuentas",
      icon: <Users2 size={36} color="#ff9800" />,
      description: "Administra usuarios y permisos.",
      route: "/cuentas",
      enabled: true,
    },
    {
      title: "Dashboard",
      icon: <BarChart3 size={36} color="#00bcd4" />,
      description: "Visualiza el progreso general de la plataforma.",
      route: "/dashboard",
      enabled: true,
    },
    {
      title: "Perfil",
      icon: <User size={36} color="#607d8b" />,
      description: "Ver y editar tu perfil de administrador.",
      route: "/perfil",
      enabled: true,
    },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-main-container">
        <h1>Panel Admini {editingCourse ? "(Editando)" : ""}</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>Título:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Descripción:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

        {/* Selector para elegir entre link o archivo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "10px",
            padding: "1rem 1.5rem",
            margin: "1.2rem 0 1.5rem 0",
            border: "1px solid #333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          <label style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#43e97b", cursor: "pointer" }}>
            <input
              type="radio"
              checked={!useFile}
              onChange={() => handleUseFileChange(false)}
              style={{ marginRight: "0.6rem", accentColor: "#43e97b", width: 18, height: 18 }}
            />
            Usar enlace de YouTube
          </label>
          <label style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#43e97b", cursor: "pointer" }}>
            <input
              type="radio"
              checked={useFile}
              onChange={() => handleUseFileChange(true)}
              style={{ marginRight: "0.6rem", accentColor: "#43e97b", width: 18, height: 18 }}
            />
            Subir archivo de video
          </label>
        </div>

        {/* Ambos inputs, solo uno visible */}
        <div style={{ display: useFile ? "none" : "block" }}>
          <label style={{ color: "#43e97b", fontWeight: 600, marginBottom: 6 }}>Enlace del Video (YouTube):</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            style={{
              background: "#23243a",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "0.5rem",
              marginBottom: "1rem"
            }}
          />
        </div>
        <div style={{ display: useFile ? "block" : "none" }}>
          <label style={{ color: "#43e97b", fontWeight: 600, marginBottom: 6 }}>Archivo de Video:</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{
              background: "#23243a",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "0.5rem",
              marginBottom: "1rem"
            }}
          />
          {videoFile && <p style={{ color: '#2962ff', marginTop: 0 }}>Archivo seleccionado: {videoFile.name}</p>}
        </div>

        <label>Rol del Empleado:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Gerente">Gerente</option>
          <option value="Contabilidad">Contabilidad</option>
          <option value="Compras">Compras</option>
          <option value="Atencion al Cliente">Atención al Cliente</option>
        </select>

        <button
          type="button"
          onClick={() => setShowEvaluation(!showEvaluation)}
          className="create-eval-button"
        >
          {showEvaluation ? "Ocultar Evaluación" : "Crear Evaluación"}
        </button>

        {showEvaluation && (
          <div className="evaluation-section">
            <h3>Evaluación</h3>

            <label>Intentos permitidos:</label>
            <input
              type="number"
              value={attempts}
              onChange={(e) => setAttempts(parseInt(e.target.value))}
              min={1}
              required
            />

            <label>Tiempo límite (minutos):</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              min={1}
              required
            />

            {questions.map((q, i) => (
              <div key={i} className="question-block">
                <label>Pregunta {i + 1}:</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestionText(i, e.target.value)}
                  required
                />
                {q.options.map((opt, j) => (
                  <input
                    key={j}
                    type="text"
                    placeholder={`Opción ${j + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, j, e.target.value)}
                    required
                  />
                ))}
                <label>Respuesta correcta:</label>
                <select
                  value={q.correctIndex}
                  onChange={(e) => updateCorrectIndex(i, e.target.value)}
                >
                  {[0, 1, 2, 3].map((idx) => (
                    <option key={idx} value={idx}>
                      Opción {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button type="button" onClick={handleAddQuestion}>
              + Agregar Pregunta
            </button>
          </div>
        )}

        <button type="submit">
          {editingCourse ? "Guardar Cambios" : "Agregar Curso"}
        </button>

        {editingCourse && (
          <button type="button" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={() => setShowCourses(!showCourses)}
        className="toggle-courses-button"
      >
        {showCourses ? "Ocultar cursos creados" : "Mostrar cursos creados"}
      </button>

      {showCourses && (
        <div className="admin-course-list">
          {courses.map((course) => (
            <div key={course.id} className="admin-course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>👥 Rol: {course.role}</p>
              <p>⏳ Tiempo límite: {course.timeLimit || course.time_limit} min</p>
              <p>🔁 Intentos: {course.attempts}</p>

              {/* Mostrar video según tipo en la lista de cursos */}
              <div className="video-container">
                {(course.videoUrl || course.video_url) && (course.videoUrl || course.video_url).trim() !== '' ? (
                  (course.videoUrl || course.video_url).includes('youtube.com/embed/') ? (
                    <iframe
                      src={course.videoUrl || course.video_url}
                      title={course.title}
                      width="100%"
                      height="315"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={`http://localhost:3001${course.videoUrl || course.video_url}`}
                      controls
                      width="100%"
                      height="315"
                      style={{ background: '#000' }}
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  )
                ) : (
                  <div className="no-video">
                    <p>⚠️ No hay video disponible</p>
                    <p>La URL del video está vacía en la base de datos</p>
                  </div>
                )}
              </div>

              <div className="course-actions">
                <button onClick={() => handleEditCourse(course)}>✏️ Editar</button>
                <button onClick={() => handleDeleteCourse(course.id)}>🗑️ Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
