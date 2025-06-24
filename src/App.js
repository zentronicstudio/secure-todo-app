// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserTaskPage from "./pages/UserTaskPage";
import VerifyPage from "./pages/VerifyPage"; // ✅ Import ni!

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tasks" element={<UserTaskPage />} />
      </Routes>
    </BrowserRouter>
  );
}
