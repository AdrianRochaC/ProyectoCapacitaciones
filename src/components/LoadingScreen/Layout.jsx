import { Outlet, useLocation } from "react-router-dom";
import Menu from "./Menu";
import AdminMenu from "./AdminMenu"; // ✅ Importa el menú del admin

const Layout = () => {
  const location = useLocation();

  // Verifica si la ruta contiene "/admin"
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div>
      {/* Mostrar uno u otro menú */}
      {isAdminRoute ? <AdminMenu /> : <Menu />}

      {/* Aquí va el contenido de la página */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
