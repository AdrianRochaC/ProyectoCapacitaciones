import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import "./DetailPage.css";

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const foundCourse = savedCourses.find((c) => c.id === Number(id));
    if (foundCourse) {
      setCourse(foundCourse);
    } else {
      alert("Curso no encontrado.");
      navigate("/");
    }
  }, [id, navigate]);

  if (!course) return null;

  return (
    <div className="detail-page-container">
      <div className="detail-page">
        <button className="detail-back-button" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>

        <h1>{course.title}</h1>
        <p>{course.description}</p>

        {/* 1. Video introductorio */}
        <div className="detail-video">
          <ReactPlayer
            url={course.videoUrl}
            width="100%"
            height="100%"
            controls
            className="react-player"
          />
        </div>

        {/* 2. Descripción general */}
        <section className="course-overview">
          <h2>¿Qué aprenderás en este curso?</h2>
          <p>{course.overview || "Este curso te enseñará los fundamentos básicos para avanzar en el tema seleccionado."}</p>
        </section>

        {/* 3. Contenido del curso */}
        <section className="course-content">
          <h2>Contenido del Curso</h2>
          <ul>
            {course.modules?.map((mod, index) => (
              <li key={index}>{mod}</li>
            )) || <li>Contenido no disponible</li>}
          </ul>
        </section>

        {/* 4. Objetivos de aprendizaje */}
        <section className="learning-objectives">
          <h2>Objetivos del Aprendizaje</h2>
          <ul>
            {course.objectives?.map((obj, index) => (
              <li key={index}>✅ {obj}</li>
            )) || <li>Serás capaz de aplicar los conocimientos aprendidos en un contexto práctico.</li>}
          </ul>
        </section>

        {/* 5. Recursos iniciales */}
        <section className="course-resources">
          <h2>Recursos del Curso</h2>
          {course.resources?.length > 0 ? (
            <ul>
              {course.resources.map((res, index) => (
                <li key={index}>
                  <a href={res.url} target="_blank" rel="noopener noreferrer">
                    📄 {res.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay recursos disponibles.</p>
          )}
        </section>

        {/* 6. Evaluación */}
        <section className="course-evaluation">
          <p className="evaluation-message">
            🎉 ¡Has finalizado el curso! Ya puedes realizar la evaluación para poner a prueba lo aprendido.
          </p>
          <button
            className="evaluation-button"
            onClick={() => navigate(`/evaluacion/${course.id}`)}
          >
            📝 Realizar Evaluación
          </button>
        </section>
      </div>
    </div>
  );
};

export default DetailPage;
