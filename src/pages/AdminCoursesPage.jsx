import React, { useState, useEffect } from "react";
import "./AdminCoursesPage.css";

const AdminCoursesPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [courses, setCourses] = useState([]);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(saved);
  }, []);

  const convertToEmbedUrl = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleSubmit = (e) => {
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
      ...editingCourse,
      title,
      description,
      videoUrl: embed,
      evaluation: questions,
    };

    let updated;
    if (editingCourse) {
      updated = courses.map(c => c.id === editingCourse.id ? payload : c);
    } else {
      payload.id = Date.now();
      updated = [...courses, payload];
    }

    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));

    // limpiar
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setQuestions([]);
    setShowEvaluation(false);
    setEditingCourse(null);
  };

  const handleDelete = (id) => {
    const filtered = courses.filter(c => c.id !== id);
    setCourses(filtered);
    localStorage.setItem("courses", JSON.stringify(filtered));
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

  return (
    <div className="admin-page-container">
      <h1>Panel Admin {editingCourse ? "(Editando)" : ""}</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>Título:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Descripción:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Enlace del Video (YouTube):</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />

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
          <button
            type="button"
            onClick={() => {
              setEditingCourse(null);
              setTitle("");
              setDescription("");
              setVideoUrl("");
              setQuestions([]);
              setShowEvaluation(false);
            }}
          >
            Cancelar
          </button>
        )}
      </form>


      <div className="admin-course-list">
        {courses.map(course => (
          <div key={course.id} className="admin-course-card">
            <h3>{course.title}</h3>
            <iframe src={course.videoUrl} title={course.title} allowFullScreen />
            <button onClick={() => handleDelete(course.id)}>Eliminar</button>
            <button onClick={() => {
              setEditingCourse(course);
              setTitle(course.title);
              setDescription(course.description);
              setVideoUrl(course.videoUrl);
              setQuestions(course.evaluation || []);
              setShowEvaluation(true);
            }}>Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
