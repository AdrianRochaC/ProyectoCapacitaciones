import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CoursesPage.css";
import ReactPlayer from "react-player"; // ✅ Importación correcta

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(savedCourses);
  }, []);

  return (
    <div className="courses-page">
      <h1 className="title">Cursos Disponibles</h1>
      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>No hay cursos disponibles por ahora.</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              <h2>{course.title}</h2>
              <p>{course.description}</p>

              {/* ✅ Reproductor de video funcional */}
              <div className="video-container" style={{ marginBottom: "1rem" }}>
                <ReactPlayer
                  url={course.videoUrl}
                  width="100%"
                  height="215px"
                  controls
                />
              </div>

              <button onClick={() => navigate(`/curso/${course.id}`)}>Ver curso</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
