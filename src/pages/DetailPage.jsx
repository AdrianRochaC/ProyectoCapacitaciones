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
  const [played, setPlayed] = useState(0); // progreso del video
  const [videoEnded, setVideoEnded] = useState(false); // si terminó el video

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("courses")) || [];
    const found = saved.find((c) => c.id === Number(id));
    if (found) setCourse(found);
    else {
      alert("Curso no encontrado.");
      navigate("/");
    }
  }, [id, navigate]);

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
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
    if (state.played >= 0.99) {
      setVideoEnded(true); // si casi termina, lo marcamos como terminado
    }
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

        {/* Barra de progreso personalizada */}
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
                onClick={() => setShowQuiz(true)}
                disabled={!course.evaluation?.length || !videoEnded}
              >
                📝 Realizar Evaluación
              </button>
              {!videoEnded && (
                <p className="video-warning">
                  Debes ver el video completo para habilitar la evaluación.
                </p>
              )}
            </>
          ) : (
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
          )}

          {score && (
            <div className="quiz-score">
              <p>
                Obtuviste {score.score} de {score.total} preguntas correctas.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DetailPage;
