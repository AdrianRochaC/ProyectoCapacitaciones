// App.jsx - Versión con admin sin acceso a courses
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CoursesPage from "./pages/CoursesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import DetailPage from "./pages/DetailPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Bitacora from "./pages/Bitacora";
import Cuentas from "./pages/Cuentas";
import Layout from "./components/LoadingScreen/Layout";

// Hook personalizado para manejar la autenticación
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'null') {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const isAdmin = user && (user.rol === 'Admin' || user.rol === 'Administrador');

  return { user, isAdmin, loading };
};

// Componente para proteger rutas
const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Si es una ruta solo para admins y no es admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin-courses" replace />;
  }
  
  // Si es una ruta solo para usuarios normales y es admin
  if (userOnly && isAdmin) {
    return <Navigate to="/admin-courses" replace />;
  }
  
  return children;
};

// Componente para rutas públicas
const PublicRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  if (user) {
    const redirectPath = isAdmin ? '/admin-courses' : '/courses';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

// Componente para redirección por defecto
const DefaultRedirect = () => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const redirectPath = isAdmin ? '/admin-courses' : '/courses';
  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Rutas solo para usuarios normales (NO admins) */}
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute userOnly={true}>
              <Layout>
                <CoursesPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas solo para admins */}
        <Route 
          path="/admin-courses" 
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <AdminCoursesPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/bitacora" 
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <Bitacora />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cuentas" 
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <Cuentas />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Rutas compartidas (tanto admin como usuario normal) */}
        <Route 
          path="/detail/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <DetailPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Layout>
                <Perfil />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<DefaultRedirect />} />
        
        {/* Ruta 404 */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;