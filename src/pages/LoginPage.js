// src/pages/LoginPage.js
import { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    pass: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    const { username, pass } = form;

    const q = query(collection(db, "users"), where("username", "==", username));
    const existing = await getDocs(q);
    if (!existing.empty) {
      alert("Username already exists.");
      return;
    }

    await setDoc(doc(db, "users", username), {
      username,
      password: pass,
      createdAt: Date.now(),
    });

    alert("Registered successfully!");
  };

  const login = async () => {
    const { username, pass } = form;

    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    if (snap.empty) return alert("User not found!");

    const data = snap.docs[0].data();
    if (data.password !== pass) return alert("Wrong password!");

    alert("Login success!");
    localStorage.setItem("user", JSON.stringify(data));
    window.location.href = "/tasks";
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f2f2f2",
    }}>
      <div style={{
        background: "#fff",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        textAlign: "center",
        width: "300px",
      }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Secure To-Do App</h2>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px"
          }}
        />

        <input
          name="pass"
          type="password"
          placeholder="Password"
          value={form.pass}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px"
          }}
        />

        <div>
          <button
            onClick={register}
            style={{
              padding: "10px 15px",
              border: "none",
              backgroundColor: "#6c63ff",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Register
          </button>

          <button
            onClick={login}
            style={{
              padding: "10px 15px",
              marginLeft: "10px",
              border: "none",
              backgroundColor: "#00b894",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
