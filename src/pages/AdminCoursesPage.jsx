import React, { useState, useEffect } from "react";
import "./AdminCoursesPage.css";

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

  const API_URL = "/api";
  const token = localStorage.getItem("authToken"); // ✅ corregido

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
          localStorage.removeItem("authToken"); // ✅ actualizado
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !videoUrl) {
      alert("Completa todos los campos.");
      return;
    }

    const embed = convertToEmbedUrl(videoUrl);
    if (!embed) {
      alert("Enlace YouTube inválido.");
      return;
    }

    const payload = {
      title,
      description,
      videoUrl: embed,
      role,
      evaluation: questions,
      attempts,
      timeLimit,
    };

    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        fetchCourses();
        resetForm();
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
    console.log("ID del curso a eliminar:", id);
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


  const handleEditCourse = (course) => {
    setTitle(course.title);
    setDescription(course.description);
    setVideoUrl(course.videoUrl.replace("https://www.youtube.com/embed/", "https://www.youtube.com/watch?v="));
    setRole(course.role);
    setAttempts(course.attempts);
    setTimeLimit(course.timeLimit);
    setQuestions([]); // Se puede implementar carga de preguntas si es necesario
    setShowEvaluation(true);
    setEditingCourse(course.id);
  };

  return (
    <div className="admin-page-container">
      <h1>Panel Admin {editingCourse ? "(Editando)" : ""}</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>Título:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Descripción:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

        <label>Enlace del Video (YouTube):</label>
        <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />

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

      <div className="admin-course-list">
        {courses.map((course) => (
          <div key={course.id} className="admin-course-card">
            <h3>{course.title}</h3>
            <p>👥 Rol: {course.role}</p>
            <p>⏳ Tiempo límite: {course.timeLimit} min</p>
            <p>🔁 Intentos: {course.attempts}</p>
            <iframe src={course.videoUrl} title={course.title} allowFullScreen />
            <div className="course-actions">
              <button onClick={() => handleEditCourse(course)}>✏️ Editar</button>
              <button onClick={() => handleDeleteCourse(course.id)}>🗑️ Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
