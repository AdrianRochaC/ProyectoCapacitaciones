// components/Layout.jsx
import Menu from "./Menu";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Menu />
      <div className="page-content">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
