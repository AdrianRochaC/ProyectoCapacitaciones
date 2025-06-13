import React, { useState, useEffect } from "react";
import "./AdminCoursesPage.css";


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

  const handleDelete = (id) => {
    const filteredCourses = courses.filter((course) => course.id !== id);
    setCourses(filteredCourses);
    localStorage.setItem("courses", JSON.stringify(filteredCourses));
  };

  const convertToEmbedUrl = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="admin-page-container">
      <h1>Panel del Administrador - Agregar Curso</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
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
          />
        </div>
        <button type="submit">Agregar Curso</button>
      </form>

      <div className="admin-course-list">
        <h2>Cursos Guardados</h2>
        {courses.length === 0 && <p>No hay cursos registrados aún.</p>}
        {courses.map((course) => (
          <div key={course.id} className="admin-course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <iframe
              src={course.videoUrl}
              title={`Video del curso: ${course.title}`}
              allowFullScreen
            ></iframe>
            <button onClick={() => handleDelete(course.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
