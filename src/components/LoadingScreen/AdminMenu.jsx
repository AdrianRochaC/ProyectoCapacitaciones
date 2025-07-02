// components/AdminMenu.jsx
import { Link, useNavigate } from "react-router-dom";
import "./Menu.css";

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
          {/* Removido el enlace a /courses - Los admins no necesitan acceso */}
          <li><Link to="/admin-courses">🛠 Admin Cursos</Link></li>
          <li><Link to="/bitacora">📝 Bitácora</Link></li>
          <li><Link to="/cuentas">👥 Cuentas</Link></li>
          <li><Link to="/perfil">👤 Perfil</Link></li>
        </ul>
      </div>
      
      <div className="auth-buttons">
        {user ? (
          <>
            <span className="user-info">
              👋 {user.nombre} ({user.rol})
            </span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">🔐 Login</Link>
            <Link to="/register">🧾 Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default AdminMenu;