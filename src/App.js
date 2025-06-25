import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserTaskPage from "./pages/UserTaskPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tasks" element={<UserTaskPage />} />
      </Routes>
    </Router>
  );
}
