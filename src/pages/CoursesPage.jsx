import React from "react";
import "./CoursesPage.css";

const courses = [
  { id: 1, title: "Curso de Atención al Cliente", description: "Aprende técnicas clave para mejorar la atención en droguerías." },
  { id: 2, title: "Farmacología Básica", description: "Conceptos esenciales sobre medicamentos y su uso responsable." },
  { id: 3, title: "Gestión de Inventarios", description: "Controla eficientemente el stock de productos farmacéuticos." },
  { id: 4, title: "Normativa Sanitaria", description: "Conoce la legislación vigente para establecimientos farmacéuticos." },
];

const CoursesPage = () => {
  return (
    <div className="courses-page">
      <h1 className="title">Cursos Disponibles</h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <button>Ver curso</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
