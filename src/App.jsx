import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CoursesPage from "./pages/CoursesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import DetailPage from "./pages/DetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CoursesPage />} />
        <Route path="/admin" element={<AdminCoursesPage />} />
        <Route path="/curso/:id" element={<DetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
