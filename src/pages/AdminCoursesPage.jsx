import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CoursesPage.css";

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
          console.log("Datos de cursos recibidos:", data.courses);
          // Debug: veamos qué campos de video tenemos
          data.courses.forEach((course, index) => {
            console.log(`Curso ${index + 1}:`, {
              id: course.id,
              title: course.title,
              videoUrl: course.videoUrl,
              video_url: course.video_url,
              allKeys: Object.keys(course)
            });
          });
          setCourses(data.courses);
        } else {
          alert("Error al cargar cursos");
        }
      })
      .catch((err) => {
        console.error("Error al cargar cursos:", err);
      });
  }, []);

  // Función para asegurar que la URL esté en formato embed
  const ensureEmbedUrl = (url) => {
    if (!url) return null;
    // Si ya es una URL de embed, la devolvemos tal como está
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    // Si es una URL de watch, la convertimos a embed
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="courses-page">
      <h1>Cursos Disponibles</h1>
      <div className="courses-container">
        {courses.length === 0 ? (
          <p>No hay cursos disponibles para tu rol.</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              
              {/* Video iframe con debugging */}
              <div className="video-container">
                {(() => {
                  const videoUrl = course.videoUrl || course.video_url;
                  const embedUrl = ensureEmbedUrl(videoUrl);
                  
                  console.log(`Curso ${course.title}:`, {
                    originalUrl: videoUrl,
                    embedUrl: embedUrl,
                    hasUrl: !!(videoUrl && videoUrl.trim() !== '')
                  });
                  
                  return (videoUrl && videoUrl.trim() !== '') ? (
                    <iframe 
                      src={embedUrl} 
                      title={course.title}
                      width="100%"
                      height="315"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => console.log(`Video cargado para: ${course.title}`)}
                      onError={() => console.log(`Error cargando video para: ${course.title}`)}
                    />
                  ) : (
                    <div className="no-video">
                      <p>⚠️ No hay video disponible</p>
                      <p>URL original: {videoUrl || 'undefined'}</p>
                      <p>Todos los campos: {JSON.stringify(course, null, 2)}</p>
                    </div>
                  );
                })()}
              </div>
              
              <button onClick={() => navigate(`/curso/${course.id}`)}>
                Ver curso
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoursesPage;