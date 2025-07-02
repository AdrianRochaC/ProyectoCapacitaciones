// components/LoadingScreen/Layout.jsx
import React from 'react';
import Menu from './Menu';
import AdminMenu from './AdminMenu';

const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Determinar si es admin
  const isAdmin = user && (user.rol === 'Admin' || user.rol === 'Administrador');

  return (
    <div className="layout-container">
      {/* Renderizar el menú apropiado según el rol */}
      {isAdmin ? <AdminMenu /> : <Menu />}
      
      {/* Contenido principal */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;