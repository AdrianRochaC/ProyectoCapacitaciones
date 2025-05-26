import React, { useState } from "react";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import CoursesPage from "./pages/CoursesPage";


function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="App">
      {isLoading ? (
        <LoadingScreen onFinish={() => setIsLoading(false)} />
      ) : (
        <CoursesPage />
      )}
    </div>
  );
}

export default App;
