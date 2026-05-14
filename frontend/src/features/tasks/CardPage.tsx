import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";

type Task = {
  id: string;
  title: string;
  assigned_to: string | null;
};

type User = {
  id: string
  email: string;
};

const CardPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState("");

  // ✅ FETCH TASKS
  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  // ✅ FETCH USERS
  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // ✅ CREATE TASK
  const createTask = async () => {
    if (!title) return;

    await api.post("/tasks", null, {
      params: { title }
    });

    setTitle("");
    fetchTasks();
  };

  // ✅ ASSIGN TASK
  const assignTask = async (taskId: string, userId: string) => {
    await api.patch(`/tasks/${taskId}/assign`, null, {
      params: { user_id: userId },
    });

    fetchTasks();
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Tasks</h2>

        {/* ✅ CREATE TASK */}
        <div style={{ marginBottom: "20px" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          />

          <button onClick={createTask}>
            Create Task
          </button>
        </div>

        {/* ✅ TASK LIST */}
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              background: "#fff",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "10px",
            }}
          >
            <h4>{task.title}</h4>

            <p>
              Assigned to:{" "}
              {task.assigned_to ? task.assigned_to : "None"}
            </p>

            {/* ✅ USER DROPDOWN */}
            <select
              onChange={(e) =>
                assignTask(task.id, e.target.value)
              }
              defaultValue=""
            >
              <option value="" disabled>
                Assign user
              </option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardPage;
