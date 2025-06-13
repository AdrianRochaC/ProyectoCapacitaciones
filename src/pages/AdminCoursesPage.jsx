import React, { useState, useEffect } from "react";

const AdminCoursesPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(savedCourses);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !description || !videoUrl) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const newCourse = {
      id: Date.now(),
      title,
      description,
      videoUrl: convertToEmbedUrl(videoUrl),
    };

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));

    setTitle("");
    setDescription("");
    setVideoUrl("");
    alert("Curso agregado exitosamente.");
  };

  const convertToEmbedUrl = (url) => {
    // Convierte un link de YouTube normal a embed
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Panel del Administrador - Agregar Curso</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        <div>
          <label>Enlace de YouTube:</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            placeholder="https://www.youtube.com/watch?v=..."
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        <button type="submit">Agregar Curso</button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Cursos Guardados</h2>
      {courses.map((course) => (
        <div key={course.id} style={{ marginBottom: "2rem" }}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <iframe
            width="100%"
            height="215"
            src={course.videoUrl}
            title={`Video del curso: ${course.title}`}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      ))}
    </div>
  );
};

export default AdminCoursesPage;
