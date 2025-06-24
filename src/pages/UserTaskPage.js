import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const BACKEND_URL = "https://secure-todo-server.onrender.com";

export default function UserTaskPage() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      alert("You must login first.");
      window.location.href = "/";
      return;
    }

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const q = query(collection(db, "tasks"), where("user", "==", user.username));
    const snap = await getDocs(q);

    const all = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data();
        const res = await fetch(`${BACKEND_URL}/decrypt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            encrypted: data.encryptedTask,
            encryptedKey: data.encryptedKey,
            iv: data.iv,
          }),
        });
        const result = await res.json();
        return { id: d.id, text: result.decrypted };
      })
    );

    setTasks(all);
  };

  const addTask = async () => {
    if (!task) return;

    const res = await fetch(`${BACKEND_URL}/encrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: task }),
    });

    const { encrypted, encryptedKey, iv } = await res.json();

    const taskRef = doc(collection(db, "tasks"));
    await setDoc(taskRef, {
      user: user.username,
      encryptedTask: encrypted,
      encryptedKey,
      iv,
      createdAt: Date.now(),
    });

    setTask("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
    fetchTasks();
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f2f2f2",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
          width: "400px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          Welcome, {user.username}
        </h2>

        <input
          type="text"
          placeholder="Enter task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <button
            onClick={addTask}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#00b894",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Add Task
          </button>

          <button
            onClick={logout}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#d63031",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <h3 style={{ marginTop: "30px", color: "#333" }}>Your Tasks</h3>
        <div style={{ textAlign: "left", marginTop: "10px" }}>
          {tasks.map((t) => (
            <div
              key={t.id}
              style={{
                backgroundColor: "#f1f2f6",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{t.text}</span>
              <button
                onClick={() => deleteTask(t.id)}
                style={{
                  backgroundColor: "#d63031",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  lineHeight: "0",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
