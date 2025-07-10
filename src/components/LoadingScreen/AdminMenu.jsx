// components/AdminMenu.jsx
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  ClipboardList,
  Users2,
  BarChart3,
  UserCircle,
  LogOut
} from "lucide-react";
import "./AdminMenu.css";

const AdminMenu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    const confirmLogout = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      navigate('/login', { replace: true });
    }
  };

  return (
    <nav className="main-menu">
      <div className="menu-links">
        <ul>
          <li>
            <Link to="/admin-courses">
              <BookOpenCheck size={18} /> <span>Gestión Cursos</span>
            </Link>
          </li>
          <li>
            <Link to="/bitacora">
              <ClipboardList size={18} /> <span>Bitácora</span>
            </Link>
          </li>
          <li>
            <Link to="/cuentas">
              <Users2 size={18} /> <span>Cuentas</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <BarChart3 size={18} /> <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/perfil">
              <UserCircle size={18} /> <span>Perfil</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="auth-buttons">
        {user ? (
          <>
            <span className="user-info">
              {user.nombre} ({user.rol})
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} /> <span>Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <Link to="/login">Iniciar Sesión</Link>
        )}
      </div>
    </nav>
  );
};

export default AdminMenu;
