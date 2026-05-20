import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
type User = {
  first_name: string;
  last_name: string;
  email: string;
};

type DashboardData = {
  stats: any[];
  boards: any[];
  tasks: any[];
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const navigate = useNavigate();
  // ✅ FETCH USER (REAL API)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };

    fetchUser();
  }, []);

  // ✅ MOCK DASHBOARD DATA (TEMP)
  useEffect(() => {
    const mockData: DashboardData = {
      stats: [
        { title: "Tasks Due Today", value: 12 },
        { title: "In Progress", value: 28 },
        { title: "Completed", value: 45 },
        { title: "Overdue", value: 5 },
      ],
      boards: [
        { id: 1, title: "Website Redesign", taskCount: 12 },
        { id: 2, title: "Marketing Campaign", taskCount: 18 },
        { id: 3, title: "Product Roadmap", taskCount: 24 },
        { id: 4, title: "Team Planning", taskCount: 8 },
      ],
      tasks: [
        { id: 1, title: "Analyze dashboard UI", priority: "High" },
        { id: 2, title: "Fix bugs", priority: "Medium" },
        { id: 3, title: "Build board feature", priority: "High" },
      ],
    };

    setTimeout(() => {
      setData(mockData);
    }, 300);
  }, []);

  // ✅ LOADING STATE
  if (!user || !data)
    return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>

      {/* ✅ NAVBAR */}
      <Navbar />

      <div style={{ padding: "24px" }}>

        {/* ✅ HEADER (DYNAMIC USER) */}
        <h3>
          Good morning,{" "}
          <span style={{ color: "#4f46e5" }}>
            {user.first_name}
          </span>{" "}
          👋
        </h3>
        <p style={{ color: "#6b7280" }}>
          Here’s what’s happening with your projects today.
        </p>

        <button
          onClick={() => navigate("/teams/create")}
          style={{
            padding: "12px 20px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Manage Team Collaboration 🚀
        </button>

        <button
          onClick={() => navigate("/teams")}
          style={{
            padding: "12px 20px",
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          View My Team Projects 👥
        </button>

        {/* ✅ STATS */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {data.stats.map((item: any) => (
            <div
              key={item.title}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                width: "200px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                {item.title}
              </p>
              <h3>{item.value}</h3>
            </div>
          ))}
        </div>

        {/* ✅ BOARDS */}
        <h4 style={{ marginTop: "30px" }}>Recent Boards</h4>
        <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
          {data.boards.map((board: any) => (
            <div
              key={board.id}
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "12px",
                width: "220px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <h6>{board.title}</h6>
              <p style={{ color: "#6b7280" }}>
                {board.taskCount} tasks
              </p>
            </div>
          ))}
        </div>

        {/* ✅ LOWER SECTION */}
        <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>

          {/* ✅ TASK LIST */}
          <div
            style={{
              flex: 2,
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h5>My Tasks</h5>

            {data.tasks.map((task: any) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                }}
              >
                <span>{task.title}</span>

                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "10px",
                    background:
                      task.priority === "High"
                        ? "#fee2e2"
                        : "#fef3c7",
                  }}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>

          {/* ✅ CALENDAR */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h5>Calendar</h5>
            <p style={{ color: "#6b7280" }}>
              Calendar UI coming soon
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;