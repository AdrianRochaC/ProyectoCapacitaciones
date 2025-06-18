import { Link } from "react-router-dom";
import "./Menu.css";

const Menu = () => {
  return (
    <nav className="main-menu">
      <div className="menu-links">
        <ul>
          <li><Link to="/">🏠 Inicio</Link></li>
          <li><Link to="/admin">🛠 Admin</Link></li>
          <li><Link to="/perfil">👤 Perfil</Link></li>
          <li><Link to="/bitacora">📝 Bitácora</Link></li>
          <li><Link to="/cuentas">💰 Cuentas</Link></li>
        </ul>
      </div>

      <div className="auth-buttons">
        <Link to="/login">🔐 Login</Link>
        <Link to="/register">🧾 Registro</Link>
      </div>
    </nav>
  );
};

export default Menu;
