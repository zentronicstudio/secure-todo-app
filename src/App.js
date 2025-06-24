import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import UserTaskPage from "./pages/UserTaskPage";
import VerifyPage from "./pages/VerifyPage";
import LabelPage from "./pages/LabelPage";
import { UserContext } from "./context/UserContext";

export default function App() {
  const [user, setUser] = useState(undefined); // 🚫 Bukan null — undefined sebagai default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUser(JSON.parse(data));
    } else {
      setUser(null); // ✅ Kena buat null secara jelas kalau takde
    }
    setLoading(false);
  }, []);

  // ✅ BLOCK SEMUA RENDER kalau loading
  if (loading || user === undefined) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading App...</div>;
  }

  return (
    <UserContext.Provider value={user}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/tasks" element={<UserTaskPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/label/:slug" element={<LabelPage />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}
