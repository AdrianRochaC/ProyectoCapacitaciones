// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CoursesPage from "./pages/CoursesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminBitacora from "./pages/AdminBitacora";
import Bitacora from "./pages/Bitacora";
import DetailPage from "./pages/DetailPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Cuentas from "./pages/Cuentas";
import Layout from "./components/LoadingScreen/Layout";
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import AdminDocumentos from "./pages/AdminDocumentos";
import Documentos from "./pages/Documentos";
import AdminCargos from "./pages/AdminCargos";

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

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/courses" replace />;
  if (userOnly && isAdmin) return <Navigate to="/admin-courses" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const DefaultRedirect = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <Register />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Nueva ruta Home Dashboard visual */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Rutas para usuarios */}
        <Route path="/courses" element={
          <ProtectedRoute userOnly={true}>
            <Layout>
              <CoursesPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/bitacora" element={
          <ProtectedRoute userOnly={true}>
            <Layout>
              <Bitacora />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Rutas para admins */}
        <Route path="/admin-courses" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <AdminCoursesPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/AdminBitacora" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <AdminBitacora />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/cuentas" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <Cuentas />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin-documentos" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <AdminDocumentos />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin-cargos" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <AdminCargos />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/documentos" element={
          <ProtectedRoute userOnly={true}>
            <Layout>
              <Documentos />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Compartidas */}
        <Route path="/detail/:id" element={
          <ProtectedRoute>
            <Layout>
              <DetailPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/perfil" element={
          <ProtectedRoute>
            <Layout>
              <Perfil />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Redirecciones */}
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
