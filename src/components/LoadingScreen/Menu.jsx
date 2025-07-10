import { Link, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUser,
  FaGraduationCap,
  FaSignInAlt,
  FaClipboardList
} from "react-icons/fa";
import "./Menu.css";

const Menu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      navigate("/login", { replace: true });
    }
  };

  return (
    <nav className="main-menu">
      <div className="menu-links">
        <ul>
          <li>
            <Link to="/courses">
              <FaGraduationCap /> Cursos
            </Link>
          </li>
          <li>
            <Link to="/bitacora">
              <FaClipboardList /> Bitácora
            </Link>
          </li>
          <li>
            <Link to="/perfil">
              <FaUser /> Perfil
            </Link>
          </li>
        </ul>
      </div>

      <div className="auth-buttons">
        {user ? (
          <>
            <span className="user-info">Hola, {user.nombre}</span>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          </>
        ) : (
          <Link to="/login">
            <FaSignInAlt /> Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Menu;
