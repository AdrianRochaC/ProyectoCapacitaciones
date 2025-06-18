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

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("courses")) || [];
    const found = saved.find((c) => c.id === Number(id));
    if (found) setCourse(found);
    else {
      alert("Curso no encontrado.");
      navigate("/");
    }
  }, [id, navigate]);

  if (!course) return null;

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
            className="react-player"
          />
        </div>

        {/* ... omito secciones anteriores por brevedad ... */}

        <section className="course-evaluation-section">
          {!showQuiz ? (
            <button
              className="evaluation-button"
              onClick={() => setShowQuiz(true)}
              disabled={!course.evaluation?.length}
            >
              📝 Realizar Evaluación
            </button>
          ) : (
            <div className="quiz-container">
              {course.evaluation.map((q, idx) => (
                <div key={idx} className="evaluation-question">
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
              <p>Obtuviste {score.score} de {score.total} preguntas correctas.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DetailPage;
