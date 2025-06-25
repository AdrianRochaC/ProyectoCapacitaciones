import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import "./DetailPage.css";

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [played, setPlayed] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  // Cargar curso
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("courses")) || [];
    const found = saved.find((c) => c.id === Number(id));
    if (found) {
      setCourse(found);

      // intentos
      const allAttempts = JSON.parse(localStorage.getItem("attempts")) || {};
      const used = allAttempts[id] || 0;
      const remaining = found.intentosPermitidos
        ? found.intentosPermitidos - used
        : null;
      setAttemptsLeft(remaining);
    } else {
      alert("Curso no encontrado.");
      navigate("/");
    }
  }, [id, navigate]);

  // Temporizador
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setShowQuiz(false);
      alert("⏰ Tiempo agotado para esta evaluación.");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleSelect = (qIndex, optIndex) => {
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const submitQuiz = () => {
    const total = course.evaluation?.length || 0;
    let correct = 0;
    course.evaluation.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    setScore({ score: correct, total });

    // Guardar intento
    const allAttempts = JSON.parse(localStorage.getItem("attempts")) || {};
    allAttempts[id] = (allAttempts[id] || 0) + 1;
    localStorage.setItem("attempts", JSON.stringify(allAttempts));

    setAttemptsLeft((prev) => prev - 1);
    setTimerActive(false);
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
    if (state.played >= 0.99) {
      setVideoEnded(true);
    }
  };

  const startEvaluation = () => {
    if (!course.evaluation?.length) return;
    if (attemptsLeft !== null && attemptsLeft <= 0) {
      alert("Has agotado todos los intentos permitidos.");
      return;
    }

    setTimeLeft(course.timeLimit * 60); // en segundos
    setTimerActive(true);
    setShowQuiz(true);
  };

  if (!course) return null;

  return (
    <div className="detail-page-container">
      <div className="detail-page">
        <button className="detail-back-button" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>

        <h1>{course.title}</h1>
        <p>{course.description}</p>

        <div className="detail-video">
          <ReactPlayer
            url={course.videoUrl}
            width="100%"
            height="100%"
            controls
            onProgress={handleProgress}
            onEnded={() => setVideoEnded(true)}
            className="react-player"
          />
        </div>

        <div className="video-progress-bar">
          <div
            className="video-progress-filled"
            style={{ width: `${played * 100}%` }}
          />
        </div>

        <section className="course-evaluation-section">
          {!showQuiz ? (
            <>
              <button
                className="evaluation-button"
                onClick={startEvaluation}
                disabled={!videoEnded || (attemptsLeft !== null && attemptsLeft <= 0)}
              >
                📝 Realizar Evaluación
              </button>
              {!videoEnded && (
                <p className="video-warning">
                  Debes ver el video completo para habilitar la evaluación.
                </p>
              )}
              {attemptsLeft !== null && (
                <p className="attempts-left">
                  Intentos disponibles: {attemptsLeft}
                </p>
              )}
            </>
          ) : (
            <>
              {timeLeft !== null && (
                <p className="countdown-timer">
                  ⏳ Tiempo restante: {Math.floor(timeLeft / 60)}:
                  {("0" + (timeLeft % 60)).slice(-2)}
                </p>
              )}
              <div className="quiz-container">
                {course.evaluation.map((q, idx) => (
                  <div key={idx} className="evaluation-question">
                    <p>
                      <strong>
                        {idx + 1}. {q.question}
                      </strong>
                    </p>
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
                            {opt}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <button className="submit-quiz" onClick={submitQuiz}>
                  Enviar respuestas
                </button>
              </div>
            </>
          )}

          {score && (
            <div className="quiz-score">
              <p>
                Obtuviste {score.score} de {score.total} preguntas correctas.
              </p>
              {attemptsLeft > 0 && (
                <button
                  onClick={() => {
                    setAnswers({});
                    setScore(null);
                    startEvaluation();
                  }}
                >
                  Reintentar
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DetailPage;
