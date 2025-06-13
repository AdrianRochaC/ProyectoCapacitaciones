import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CoursesPage from "./pages/CoursesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CoursesPage />} />
        <Route path="/admin" element={<AdminCoursesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
