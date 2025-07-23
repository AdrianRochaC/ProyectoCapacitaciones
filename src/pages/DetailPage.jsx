import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import axios from "axios";
import "./DetailPage.css";

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [played, setPlayed] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user) navigate("/login");

  useEffect(() => {
    axios
      .get(`/api/courses?rol=${user.rol}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const found = res.data.courses.find((c) => c.id === +id);
        if (!found) {
          alert("Curso no encontrado");
          return navigate("/courses");
        }

        const questionsRes = await axios.get(`/api/courses/${id}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        found.evaluation = questionsRes.data.questions || [];
        setCourse(found);
      })
      .catch((err) => {
        console.error("Error al cargar curso:", err);
        alert("Error al cargar curso");
        navigate("/courses");
      });
  }, [id, navigate, token, user.rol]);

  // Nuevo useEffect: cargar progreso desde la base de datos
  useEffect(() => {
    if (!course || user.rol === "Admin") return;

    axios
      .get(`/api/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const p = res.data.progress;
        if (p) {
          if (p.video_completed) setVideoEnded(true);
          setAttemptsLeft(course.attempts - (p.attempts_used || 0));

          if (p.evaluation_score != null) {
            setScore({
              score: p.evaluation_score,
              total: p.evaluation_total,
            });
          }
        } else {
          setAttemptsLeft(course.attempts);
        }
      })
      .catch((err) => {
        // Si no hay progreso registrado, dejar intentos al máximo
        if (!(err.response && err.response.status === 404)) {
          console.error("Error al cargar progreso:", err);
        }
        setAttemptsLeft(course.attempts);
      });
  }, [course, id, token, user.rol]);

  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setShowQuiz(false);
      setTimerActive(false);
      alert("⏰ Se acabó el tiempo");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  if (!course) return <p>Cargando curso...</p>;

  const handleProgress = (state) => {
    setPlayed(state.played);

    // Ya no usamos localStorage para saber si el curso fue iniciado
    // Guardar progreso en la DB solo cuando el video termina
    if (state.played >= 0.99 && !videoEnded) {
      setVideoEnded(true);
      axios
        .post(
          "/api/progress",
          {
            courseId: +id,
            videoCompleted: true,
            score: score?.score ?? null,
            total: score?.total ?? null,
            status: score
              ? score.score >= Math.ceil(score.total * 0.6)
                ? "aprobado"
                : "reprobado"
              : null,
            attemptsUsed: (course.attempts - attemptsLeft) ?? 0,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(console.error);
    }
  };

  const startQuiz = () => {
    if (!videoEnded) return alert("Primero debes ver todo el video.");
    if (attemptsLeft !== null && attemptsLeft <= 0)
      return alert("Ya no tienes más intentos.");
    setAnswers({});
    setTimeLeft(course.timeLimit * 60);
    setTimerActive(true);
    setShowQuiz(true);
  };

  const submitQuiz = () => {
    const total = course.evaluation.length;
    const correct = course.evaluation.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const status =
      correct >= Math.ceil(total * 0.6) ? "aprobado" : "reprobado";

    setScore({ score: correct, total });
    setShowQuiz(false);
    setTimerActive(false);

    axios
      .post(
        "/api/progress",
        {
          courseId: +id,
          videoCompleted: true,
          score: correct,
          total,
          status,
          attemptsUsed: (course.attempts - (attemptsLeft - 1)) ?? 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAttemptsLeft((prev) => prev - 1);
      })
      .catch(console.error);
  };

  const handleSelect = (qIdx, optIdx) => {
    setAnswers({ ...answers, [qIdx]: optIdx });
  };

  return (
    <div className="detail-page-container">
      <div className="detail-page">
        <button className="detail-back-button" onClick={() => navigate(-1)}>⬅ Volver</button>
        <h1>{course.title}</h1>
        <p>{course.description}</p>

        <div className="detail-video">
          {course.videoUrl && course.videoUrl.includes('youtube.com/embed/') ? (
            <ReactPlayer
              url={course.videoUrl}
              controls
              onProgress={handleProgress}
              onEnded={() => setVideoEnded(true)}
              className="react-player"
            />
          ) : (
            <ReactPlayer
              url={`http://localhost:3001${course.videoUrl || course.video_url}`}
              controls
              onProgress={handleProgress}
              onEnded={() => setVideoEnded(true)}
              className="react-player"
            />
          )}
        </div>

        <div className="video-progress-bar">
          <div className="video-progress-filled" style={{ width: `${played * 100}%` }} />
        </div>

        {/* Solo mostrar evaluación si hay preguntas */}
        {Array.isArray(course.evaluation) && course.evaluation.length > 0 && (
          !showQuiz ? (
            <div className="course-evaluation-section">
              <button
                className="evaluation-button"
                disabled={!videoEnded || (attemptsLeft !== null && attemptsLeft <= 0)}
                onClick={startQuiz}
              >
                📝 Realizar Evaluación
              </button>
              {!videoEnded && <p className="video-warning">Debes ver todo el video.</p>}
              {attemptsLeft !== null && <p className="evaluation-message">Intentos restantes: {attemptsLeft}</p>}
            </div>
          ) : (
            <div className="quiz-container">
              {timeLeft !== null && (
                <p className="evaluation-message">
                  ⏳ Tiempo restante: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
                </p>
              )}
              {course.evaluation.map((q, idx) => (
                <div className="evaluation-question" key={idx}>
                  <p><strong>{idx + 1}. {q.question}</strong></p>
                  <ul>
                    {q.options.map((opt, i) => (
                      <li key={i}>
                        <label>
                          <input
                            type="radio"
                            name={`q${idx}`}
                            checked={answers[idx] === i}
                            onChange={() => handleSelect(idx, i)}
                          />
                          {" "}{opt}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button className="submit-quiz" onClick={submitQuiz}>Enviar respuestas</button>
            </div>
          )
        )}

        {/* Mostrar puntaje solo si hay evaluación */}
        {Array.isArray(course.evaluation) && course.evaluation.length > 0 && score && (
          <div className="quiz-score">
            ✅ Obtuviste {score.score} de {score.total} (
            {score.score >= Math.ceil(score.total * 0.6) ? "Aprobado" : "Reprobado"})
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPage;
