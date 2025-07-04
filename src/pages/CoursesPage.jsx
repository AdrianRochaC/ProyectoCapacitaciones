import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CoursesPage.css";
import ReactPlayer from "react-player";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!user || !token) {
      alert("⚠️ Debes iniciar sesión.");
      window.location.href = "/login";
      return;
    }

    const rol = user.rol;

    fetch(`/api/courses?rol=${encodeURIComponent(rol)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("⚠️ Sesión expirada. Inicia sesión nuevamente.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCourses(data.courses);
        } else {
          alert("Error al cargar cursos");
        }
      })
      .catch((err) => {
        console.error("Error al cargar cursos:", err);
      });
  }, []);

  return (
    <div className="courses-page">
      <h1 className="title">Cursos Disponibles</h1>
      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>No hay cursos disponibles para tu rol.</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              <h2>{course.title}</h2>
              <p>{course.description}</p>

              <div className="video-container" style={{ marginBottom: "1rem" }}>
                <ReactPlayer url={course.videoUrl} width="100%" height="215px" controls />
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
