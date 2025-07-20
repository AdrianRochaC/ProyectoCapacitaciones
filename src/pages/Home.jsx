import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, ClipboardList, Users2, BarChart3, User } from "lucide-react";
import { FaGraduationCap, FaClipboardList, FaUser, FaBell } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [currentTheme, setCurrentTheme] = useState('dark');
  
  if (!user) {
    navigate("/login");
    return null;
  }
  
  const isAdmin = user.rol === "Admin" || user.rol === "Administrador";

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Tarjetas para admin
  const adminCards = [
    {
      title: "Gestión de Cursos",
      icon: <BookOpenCheck size={36} color="#2962ff" />,
      description: "Crea, edita y elimina cursos y evaluaciones.",
      route: "/admin-courses",
    },
    {
      title: "Bitácora",
      icon: <ClipboardList size={36} color="#43e97b" />,
      description: "Gestiona tareas y seguimiento de actividades.",
      route: "/AdminBitacora",
    },
    {
      title: "Cuentas",
      icon: <Users2 size={36} color="#ff9800" />,
      description: "Administra usuarios y permisos.",
      route: "/cuentas",
    },
    {
      title: "Dashboard",
      icon: <BarChart3 size={36} color="#00bcd4" />,
      description: "Visualiza el progreso general de la plataforma.",
      route: "/dashboard",
    },
    {
      title: "Perfil",
      icon: <User size={36} color="#607d8b" />,
      description: "Ver y editar tu perfil de administrador.",
      route: "/perfil",
    },
  ];

  // Tarjetas para usuario normal
  const userCards = [
    {
      title: "Mis Cursos",
      icon: <FaGraduationCap size={36} color="#2962ff" />,
      description: "Accede a los cursos disponibles para ti.",
      route: "/courses",
    },
    {
      title: "Bitácora",
      icon: <FaClipboardList size={36} color="#43e97b" />,
      description: "Consulta tus tareas y actividades asignadas.",
      route: "/bitacora",
    },
    {
      title: "Perfil",
      icon: <FaUser size={36} color="#607d8b" />,
      description: "Ver y editar tu perfil personal.",
      route: "/perfil",
    },
  ];

  const cards = isAdmin ? adminCards : userCards;

  return (
    <div className="home-dashboard-bg">
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
      >
        {currentTheme === 'light' ? '🌙' : '☀️'}
      </button>
      
      <div className="home-dashboard-title">
        <h1>Bienvenido, {user.nombre}</h1>
        <p>Selecciona una opción para continuar</p>
      </div>
      <div className="home-dashboard-cards">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="home-dashboard-card"
            onClick={() => navigate(card.route)}
            style={{ cursor: 'pointer' }}
          >
            <div className="home-dashboard-icon">{card.icon}</div>
            <div className="home-dashboard-title-card">{card.title}</div>
            <div className="home-dashboard-desc">{card.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 