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
  updateDoc,
} from "firebase/firestore";

const BACKEND_URL = "https://secure-todo-server.onrender.com";

export default function UserTaskPage() {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [label, setLabel] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
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

    const now = new Date();
    const todayDate = now.toDateString();
    const tomorrowDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    ).toDateString();

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

        const due = data.dueDate ? new Date(data.dueDate) : null;
        const isToday = due && due.toDateString() === todayDate;
        const isTomorrow = due && due.toDateString() === tomorrowDate;

        return {
          id: d.id,
          text: result.decrypted,
          dueDate: data.dueDate || null,
          completed: data.completed || false,
          label: data.label || "",
          isToday,
          isTomorrow,
        };
      })
    );

    all.sort((a, b) => {
      if (a.dueDate && b.dueDate)
        return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

    setTasks(all);

    const dueTodayTasks = all.filter(t => t.isToday && !t.completed);
    const dueTomorrowTasks = all.filter(t => t.isTomorrow && !t.completed);

    if (dueTodayTasks.length || dueTomorrowTasks.length) {
      setTimeout(() => {
        const sound = document.getElementById("reminder-sound");
        if (sound) sound.play();

        const parts = [];
        if (dueTodayTasks.length)
          parts.push(`${dueTodayTasks.length} task(s) due today`);
        if (dueTomorrowTasks.length)
          parts.push(`${dueTomorrowTasks.length} task(s) due tomorrow`);

        alert(`📅 You have ${parts.join(" and ")}. Don't forget!`);
      }, 500);
    }
  };

  const addTask = async () => {
    if (!task) return;
    if (!label) {
      alert("Please select a label.");
      return;
    }

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
      dueDate,
      completed: false,
      label,
      createdAt: Date.now(),
    });

    setTask("");
    setDueDate("");
    setLabel("");
    fetchTasks();
  };

  const toggleCompletion = async (task) => {
    await updateDoc(doc(db, "tasks", task.id), {
      completed: !task.completed,
    });
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

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return t.label.toLowerCase().includes(filter);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f2f2f2" }}>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 0 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>Welcome, {user.username}</h2>

          <input type="text" placeholder="Enter task" value={task} onChange={(e) => setTask(e.target.value)} style={inputStyle} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          <select value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle}>
            <option value="">Select a label</option>
            <option value="🔴 Work">🔴 Work</option>
            <option value="🟠 Personal">🟠 Personal</option>
            <option value="🟡 Study">🟡 Study</option>
            <option value="🟢 Bills">🟢 Bills</option>
            <option value="🔵 Errands">🔵 Errands</option>
            <option value="🟣 Appointment">🟣 Appointment</option>
            <option value="⚫️ Event">⚫️ Event</option>
          </select>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
            <button style={addBtn} onClick={addTask}>Add Task</button>
            <button style={logoutBtn} onClick={logout}>Logout</button>
          </div>

          <h3 style={{ marginTop: "30px", color: "#333" }}>Your Tasks</h3>
          <div style={{ textAlign: "left", marginTop: "10px" }}>
            {filteredTasks.map((t) => (
              <div key={t.id} style={{
                backgroundColor: t.completed ? "#dfe6e9" : "#f1f2f6",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>
                  {t.label && <strong style={{ marginRight: "5px" }}>{t.label}</strong>}
                  {t.text}
                  {t.dueDate && <small style={{ marginLeft: "8px", color: "#888" }}>(Due: {new Date(t.dueDate).toLocaleDateString()})</small>}
                  {t.isToday && <small style={{ marginLeft: "8px", color: "#e74c3c", fontWeight: "bold" }}>TODAY</small>}
                  {t.isTomorrow && <small style={{ marginLeft: "8px", color: "#f1c40f", fontWeight: "bold" }}>TOMORROW</small>}
                  {t.completed && <small style={{ marginLeft: "8px", color: "green" }}>✔ Completed</small>}
                </span>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button style={markBtn} onClick={() => toggleCompletion(t)}>{t.completed ? "Undo" : "Done"}</button>
                  <button style={deleteBtn} onClick={() => deleteTask(t.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Legend setFilter={setFilter} />

      <audio id="reminder-sound" src="/sounds/reminder.mp3" preload="auto"></audio>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};
const addBtn = {
  flex: 1,
  padding: "10px",
  backgroundColor: "#00b894",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
const logoutBtn = { ...addBtn, backgroundColor: "#d63031" };
const markBtn = {
  backgroundColor: "#0984e3",
  border: "none",
  color: "#fff",
  borderRadius: "5px",
  padding: "4px 8px",
  cursor: "pointer",
};
const deleteBtn = {
  backgroundColor: "#d63031",
  border: "none",
  color: "#fff",
  borderRadius: "50%",
  width: "24px",
  height: "24px",
  cursor: "pointer",
  fontWeight: "bold",
  lineHeight: "0",
};

function Legend({ setFilter }) {
  const items = [
    { emoji: "🔴", name: "work" },
    { emoji: "🟠", name: "personal" },
    { emoji: "🟡", name: "study" },
    { emoji: "🟢", name: "bills" },
    { emoji: "🔵", name: "errands" },
    { emoji: "🟣", name: "appointment" },
    { emoji: "⚫️", name: "event" },
  ];
  return (
    <div style={{ width: "100%", padding: "15px 20px", backgroundColor: "#fff", borderTop: "1px solid #ddd", textAlign: "center" }}>
      <h4 style={{ marginBottom: "10px", color: "#333" }}>Label Legend</h4>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px" }}>
        {items.map((i) => (
          <button key={i.name} onClick={() => setFilter(i.name)} style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
            cursor: "pointer"
          }}>
            {i.emoji} {i.name.charAt(0).toUpperCase() + i.name.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px" }}>
        <button onClick={() => setFilter("completed")} style={{
          padding: "10px 20px",
          backgroundColor: "#2d3436",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}>✅ Completed Tasks</button>

        <button onClick={() => setFilter("pending")} style={{
          padding: "10px 20px",
          backgroundColor: "#e17055",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}>🕒 Pending Tasks</button>

        <button onClick={() => setFilter("all")} style={{
          padding: "10px 20px",
          backgroundColor: "#00cec9",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}>🔁 All Tasks</button>
      </div>
    </div>
  );
}
