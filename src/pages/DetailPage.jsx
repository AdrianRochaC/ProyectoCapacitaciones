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
        <div className="detail-video">
          <ReactPlayer
            url={course.videoUrl}
            width="100%"
            height="100%"
            controls
            className="react-player"
          />
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
