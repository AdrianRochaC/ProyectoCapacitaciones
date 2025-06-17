// components/Menu.jsx
import { Link } from "react-router-dom";
import "./Menu.css";

const Menu = () => {
  return (
    <nav className="main-menu">
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/perfil">Perfil</Link></li>
        <li><Link to="/bitacora">Bitácora</Link></li>
        <li><Link to="/cuentas">Cuentas</Link></li>
      </ul>
    </nav>
  );
};

export default Menu;
