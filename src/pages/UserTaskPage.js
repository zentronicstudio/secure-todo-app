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

// ✅ Tambah URL backend yang betul
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
    // ... (UI kekal sama, tak sentuh)
  );
}
