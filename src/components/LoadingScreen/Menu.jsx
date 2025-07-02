// components/Menu.jsx
import { Link, useNavigate } from "react-router-dom";
import "./Menu.css";

const Menu = () => {
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
          <li><Link to="/courses">🏠 Cursos</Link></li>
          <li><Link to="/perfil">👤 Perfil</Link></li>
        </ul>
      </div>

      <div className="auth-buttons">
        {user ? (
          <>
            <span className="user-info">👋 {user.nombre}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Cerrar Sesión
            </button>
          </>
        ) : (
          <Link to="/login">🔐 Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Menu;