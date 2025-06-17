// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CoursesPage from "./pages/CoursesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import DetailPage from "./pages/DetailPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";       // crea estos componentes
import Bitacora from "./pages/Bitacora";
import Cuentas from "./pages/Cuentas";
import Layout from "./components/LoadingScreen/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CoursesPage />} />
          <Route path="/admin" element={<AdminCoursesPage />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/bitacora" element={<Bitacora />} />
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/curso/:id" element={<DetailPage />} />
        </Route>

        {/* Rutas sin menú */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
