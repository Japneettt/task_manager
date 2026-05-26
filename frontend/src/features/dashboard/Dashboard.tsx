// import { useEffect, useState } from "react";
// import Navbar from "../../components/layout/Navbar";
// import { api } from "../../services/api";
// import { useNavigate } from "react-router-dom";
// type User = {
//   first_name: string;
//   last_name: string;
//   email: string;
// };

// type DashboardData = {
//   stats: any[];
//   boards: any[];
//   tasks: any[];
// };

// const Dashboard = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [data, setData] = useState<DashboardData | null>(null);
//   const navigate = useNavigate();
//   // ✅ FETCH USER (REAL API)
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await api.get("/users/me");
//         setUser(res.data);
//       } catch (err) {
//         console.error("User fetch failed", err);
//       }
//     };

//     fetchUser();
//   }, []);

//   // ✅ MOCK DASHBOARD DATA (TEMP)
//   useEffect(() => {
//     const mockData: DashboardData = {
//       stats: [
//         { title: "Tasks Due Today", value: 12 },
//         { title: "In Progress", value: 28 },
//         { title: "Completed", value: 45 },
//         { title: "Overdue", value: 5 },
//       ],
//       boards: [
//         { id: 1, title: "Website Redesign", taskCount: 12 },
//         { id: 2, title: "Marketing Campaign", taskCount: 18 },
//         { id: 3, title: "Product Roadmap", taskCount: 24 },
//         { id: 4, title: "Team Planning", taskCount: 8 },
//       ],
//       tasks: [
//         { id: 1, title: "Analyze dashboard UI", priority: "High" },
//         { id: 2, title: "Fix bugs", priority: "Medium" },
//         { id: 3, title: "Build board feature", priority: "High" },
//       ],
//     };

//     setTimeout(() => {
//       setData(mockData);
//     }, 300);
//   }, []);

//   // ✅ LOADING STATE
//   if (!user || !data)
//     return <div style={{ padding: "20px" }}>Loading...</div>;

//   return (
//     <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>

//       {/* ✅ NAVBAR */}
//       <Navbar />

//       <div style={{ padding: "24px" }}>

//         {/* ✅ HEADER (DYNAMIC USER) */}
//         <h3>
//           Good morning,{" "}
//           <span style={{ color: "#4f46e5" }}>
//             {user.first_name}
//           </span>{" "}
//           👋
//         </h3>
//         <p style={{ color: "#6b7280" }}>
//           Here’s what’s happening with your projects today.
//         </p>

//         <button
//           onClick={() => navigate("/teams/create")}
//           style={{
//             padding: "12px 20px",
//             background: "#4f46e5",
//             color: "#fff",
//             border: "none",
//             borderRadius: "8px",
//             marginTop: "20px",
//             cursor: "pointer",
//           }}
//         >
//           Manage Team Collaboration 🚀
//         </button>

//         <button
//           onClick={() => navigate("/teams")}
//           style={{
//             padding: "12px 20px",
//             background: "#10b981",
//             color: "#fff",
//             border: "none",
//             borderRadius: "8px",
//             marginTop: "10px",
//             cursor: "pointer",
//           }}
//         >
//           View My Team Projects 👥
//         </button>

//         {/* ✅ STATS */}
//         <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//           {data.stats.map((item: any) => (
//             <div
//               key={item.title}
//               style={{
//                 background: "#fff",
//                 padding: "20px",
//                 borderRadius: "12px",
//                 width: "200px",
//                 boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
//               }}
//             >
//               <p style={{ fontSize: "14px", color: "#6b7280" }}>
//                 {item.title}
//               </p>
//               <h3>{item.value}</h3>
//             </div>
//           ))}
//         </div>

//         {/* ✅ BOARDS */}
//         <h4 style={{ marginTop: "30px" }}>Recent Boards</h4>
//         <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
//           {data.boards.map((board: any) => (
//             <div
//               key={board.id}
//               style={{
//                 background: "#fff",
//                 padding: "16px",
//                 borderRadius: "12px",
//                 width: "220px",
//                 boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
//               }}
//             >
//               <h6>{board.title}</h6>
//               <p style={{ color: "#6b7280" }}>
//                 {board.taskCount} tasks
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* ✅ LOWER SECTION */}
//         <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>

//           {/* ✅ TASK LIST */}
//           <div
//             style={{
//               flex: 2,
//               background: "#fff",
//               padding: "20px",
//               borderRadius: "12px",
//             }}
//           >
//             <h5>My Tasks</h5>

//             {data.tasks.map((task: any) => (
//               <div
//                 key={task.id}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   marginTop: "10px",
//                 }}
//               >
//                 <span>{task.title}</span>

//                 <span
//                   style={{
//                     fontSize: "12px",
//                     padding: "4px 8px",
//                     borderRadius: "10px",
//                     background:
//                       task.priority === "High"
//                         ? "#fee2e2"
//                         : "#fef3c7",
//                   }}
//                 >
//                   {task.priority}
//                 </span>
//               </div>
//             ))}
//           </div>

//           {/* ✅ CALENDAR */}
//           <div
//             style={{
//               flex: 1,
//               background: "#fff",
//               padding: "20px",
//               borderRadius: "12px",
//             }}
//           >
//             <h5>Calendar</h5>
//             <p style={{ color: "#6b7280" }}>
//               Calendar UI coming soon
//             </p>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import TaskModal from "../../features/planner/TaskModal";
import { api } from "../../services/api";
import { PieChart, Pie, Cell } from "recharts";

type User = { first_name: string; last_name: string; email?: string };
type PlannerResponse = { assigned?: any[]; today?: any[]; overdue?: any[]; kanban?: any };
type Board = { id: string | number; title?: string; name?: string; description?: string };
type Team = { id: string; name: string; description?: string; type?: string };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [plannerData, setPlannerData] = useState<PlannerResponse | null>(null);
  const [dashboardCounts, setDashboardCounts] = useState<any | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [userRes, plannerRes, boardsRes, teamsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/planner"),
          api.get("/boards/personal"),
          api.get("/teams"),
        ]);

        setUser(userRes.data);
        setPlannerData(plannerRes.data || {});
        // fetch aggregated counts
        try {
          const dashRes = await api.get("/dashboard");
          setDashboardCounts(dashRes.data || null);
        } catch (e) {
          // ignore, planner will be fallback
        }
        setBoards(boardsRes.data || []);
        setTeams(teamsRes.data || []);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Refresh planner data on realtime events (card moved/updated)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) return;

    let parsed;
    try {
      parsed = JSON.parse(storedUser);
    } catch {
      return;
    }

    if (!parsed?.id) return;

    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/notifications/${parsed.id}?token=${encodeURIComponent(token)}`
    );

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data?.type === "card_moved" || data?.type === "card_updated" || data?.type === "card_created") {
          // refresh planner portion only
          api.get("/planner").then((res) => setPlannerData(res.data || {})).catch(() => {});
        }
      } catch {
        // ignore
      }
    };

    ws.onerror = () => {};
    return () => ws.close();
  }, []);

  const tasks = useMemo(() => {
    const items = [
      ...(plannerData?.assigned || []),
      ...(plannerData?.today || []),
      ...(plannerData?.overdue || []),
      ...(plannerData?.kanban?.done || []),
    ];
    const map = new Map<string | number, any>();
    items.forEach((item) => {
      if (item?.id && !map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  }, [plannerData]);

  const filteredTasks = useMemo(() => {
    if (!search) return tasks;
    return tasks.filter((task) => task?.title?.toLowerCase().includes(search.toLowerCase()));
  }, [search, tasks]);

  const recentTeams = useMemo(() => teams.slice(-3).reverse(), [teams]);

  const todayCount = plannerData?.today?.length || 0;
  const completedCount = dashboardCounts?.done ?? plannerData?.kanban?.done?.length ?? 0;
  const inProgressCount = dashboardCounts?.in_progress ?? plannerData?.kanban?.in_progress?.length ?? 0;
  const todoCount = dashboardCounts?.todo ?? plannerData?.kanban?.to_do?.length ?? 0;
  const totalTasks = tasks.length;
  const completedPercent = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

  const analyticsData = [
    { name: "Done", value: completedCount, color: "#2563eb" },
    { name: "In Progress", value: inProgressCount, color: "#3b82f6" },
    { name: "To Do", value: todoCount, color: "#93c5fd" },
  ];

  const teamButtons = (teamId: string) => ({
    projects: () => navigate(`/teams/${teamId}`),
    open: () => navigate(`/teams/${teamId}`),
  });

  const parseInviteEmails = (value: string) =>
    value
      .split(/[,;\s]+/)
      .map((email) => email.trim())
      .filter((email) => email.length);

  const createTeam = async () => {
    setCreateError(null);
    setInviteStatus(null);
    if (!teamName.trim()) {
      setCreateError("Team name is required");
      return;
    }

    try {
      const createRes = await api.post("/teams", {
        name: teamName,
        description: teamDesc,
        type: "private",
      });

      const createdTeamId = createRes.data?.id;
      if (createdTeamId && inviteEmails.trim()) {
        const emails = parseInviteEmails(inviteEmails);
        if (emails.length) {
          await api.post(`/teams/${createdTeamId}/invite`, { emails });
          setInviteStatus(`${emails.length} invite(s) sent`);
        }
      }

      const teamsRes = await api.get("/teams");
      setTeams(teamsRes.data || []);
      setTeamName("");
      setTeamDesc("");
      setInviteEmails("");
    } catch (err: any) {
      console.error("Team creation failed", err);
      setCreateError(err?.response?.data?.detail || "Unable to create team");
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "No date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No date";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const chartValue = `${completedPercent}%`;

  if (loading) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={loadingStyle}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Navbar />
      <main style={contentStyle}>
        <section style={heroGrid}>
          <div>
            <p style={captionStyle}>Welcome back</p>
            <h1 style={heroTitle}>Welcome back, {user?.first_name}</h1>
            <p style={heroText}>A clean overview of your task flow and teams.</p>
          </div>

          <div style={heroActions}>
            <div style={searchStyle}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks, boards, teams"
                style={searchInputStyle}
              />
            </div>
          </div>
        </section>

        <section style={statsRow}>
          {[
            { label: "Total Tasks", value: totalTasks },
            { label: "Completed", value: completedCount },
            { label: "In Progress", value: inProgressCount },
            { label: "To Do", value: todoCount },
          ].map((stat) => (
            <div key={stat.label} style={statCardStyle}>
              <div style={statLabel}>{stat.label}</div>
              <div style={statValue}>{stat.value}</div>
            </div>
          ))}
        </section>

        <section style={mainGrid}>
          <div style={leftColumn}>
            <div style={panelBlock}>
              <div style={sectionTag}>Analytics</div>
              <div style={chartWrapper}>
                <PieChart width={260} height={260}>
                  <Pie
                    data={analyticsData}
                    dataKey="value"
                    innerRadius={88}
                    outerRadius={118}
                    paddingAngle={4}
                  >
                    {analyticsData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div style={chartCenter}>{chartValue}</div>
              </div>
              <div style={legendStyle}>
                {analyticsData.map((item) => (
                  <div key={item.name} style={legendItem}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ ...legendDot, background: item.color }} />
                      <span style={legendText}>{item.name}</span>
                    </div>
                    <strong style={legendValue}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={panelBlock}>
              <div style={sectionTag}>Recent tasks</div>
              <div style={taskListStyle}>
                {filteredTasks.slice(0, 5).map((task) => (
                  <button key={task.id} style={taskRow} onClick={() => setSelectedTask(task)}>
                    <div>
                      <div style={taskTitle}>{task.title || "Untitled task"}</div>
                      <div style={taskSubtitle}>{formatDate(task.due_date)}</div>
                    </div>
                    <span style={pill(task.completed_at ? "Completed" : task.due_date ? "Upcoming" : "Pending")}>
                      {task.completed_at ? "Completed" : task.due_date ? "Upcoming" : "Pending"}
                    </span>
                  </button>
                ))}
                {!filteredTasks.length && <div style={emptyTasks}>No tasks available</div>}
              </div>
            </div>
          </div>

          <aside style={sidebarPanel}>
            <div style={sidebarCard}>
              <div style={sectionTag}>Create team</div>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                style={inputStyle}
              />
              <input
                value={teamDesc}
                onChange={(e) => setTeamDesc(e.target.value)}
                placeholder="Description"
                style={inputStyle}
              />
              <input
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Invite members (comma separated)"
                style={inputStyle}
              />
              <button onClick={createTeam} style={buttonPrimary}>
                Create team
              </button>
              {createError && <div style={errorText}>{createError}</div>}
              {inviteStatus && <div style={successText}>{inviteStatus}</div>}
            </div>

            <div style={sidebarCard}>
              <div style={sectionTag}>Quick access</div>
              {recentTeams.length ? (
                recentTeams.slice(0, 3).map((team) => (
                  <div key={team.id} style={teamCard}>
                    <div>
                      <div style={teamNameStyle}>{team.name}</div>
                      <div style={teamSubtitle}>{team.description || team.type || "No description"}</div>
                    </div>
                    <div style={teamActionRow}>
                      <button onClick={teamButtons(team.id).projects} style={ghostButton}>
                        Projects
                      </button>
                      <button onClick={teamButtons(team.id).open} style={outlineButton}>
                        Open
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={emptyTeams}>No teams yet</div>
              )}

              <button onClick={() => navigate("/teams")} style={viewTeamsButton}>
                View All Teams
              </button>
            </div>
          </aside>
        </section>
      </main>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          refresh={async () => {
            const res = await api.get("/planner");
            setPlannerData(res.data || {});
          }}
        />
      )}
    </div>
  );
}

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  background: "#ffffff",
  color: "#0f172a",
};

const contentStyle = {
  width: "100%",
  maxWidth: "none",
  padding: 20,
  boxSizing: "border-box" as const,
};

const heroGrid = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 20,
  marginBottom: 24,
};

const captionStyle = {
  textTransform: "uppercase",
  color: "#2563eb",
  letterSpacing: "0.2em",
  fontSize: 12,
  marginBottom: 10,
  fontWeight: 700,
};

const heroTitle = {
  fontSize: 34,
  margin: 0,
  color: "#0f172a",
  lineHeight: 1.05,
};

const heroText = {
  color: "#475569",
  marginTop: 12,
  maxWidth: 640,
  lineHeight: 1.6,
};

const heroActions = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  flex: 1,
  justifyContent: "flex-end",
};

const searchStyle = {
  width: "100%",
  maxWidth: 420,
  background: "#f8fafc",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  padding: "10px 14px",
};

const searchInputStyle = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#0f172a",
  fontSize: 14,
};

const statsRow = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 20,
  marginBottom: 24,
};

const statCardStyle = {
  background: "#f8fafc",
  borderRadius: 10,
  padding: 20,
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};

const statLabel = {
  color: "#64748b",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: 10,
};

const statValue = {
  fontSize: 28,
  fontWeight: 700,
  color: "#0f172a",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 20,
};

const leftColumn = {
  display: "grid",
  gap: 20,
};

const panelBlock = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #e5e7eb",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.06)",
};

const sectionTag = {
  display: "inline-flex",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  marginBottom: 18,
};

const chartWrapper = {
  position: "relative" as const,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const chartCenter = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "grid",
  placeItems: "center",
  color: "#1d4ed8",
  fontSize: 28,
  fontWeight: 800,
};

const legendStyle = {
  display: "grid",
  gap: 12,
  marginTop: 20,
};

const legendItem = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  color: "#334155",
};

const legendDot = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  display: "inline-block",
};

const legendText = {
  color: "#475569",
  fontSize: 14,
};

const legendValue = {
  color: "#0f172a",
  fontWeight: 700,
};

const taskListStyle = {
  display: "grid",
  gap: 12,
};

const taskRow = {
  width: "100%",
  textAlign: "left" as const,
  padding: "16px 18px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  color: "#0f172a",
  cursor: "pointer",
};

const taskTitle = {
  fontSize: 15,
  fontWeight: 700,
};

const taskSubtitle = {
  fontSize: 13,
  color: "#64748b",
  marginTop: 6,
};

const pill = (status: string) => ({
  padding: "8px 12px",
  borderRadius: 999,
  color: "#0f172a",
  background: status === "Completed" ? "#dbeafe" : "#bfdbfe",
  fontSize: 12,
  fontWeight: 700,
});

const emptyTasks = {
  color: "#64748b",
  padding: 24,
  borderRadius: 12,
  background: "#f8fafc",
  textAlign: "center" as const,
};

const sidebarPanel = {
  display: "grid",
  gap: 20,
};

const sidebarCard = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #e5e7eb",
  boxShadow: "0 16px 30px rgba(15, 23, 42, 0.06)",
};

const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  padding: "12px 14px",
  marginBottom: 12,
};

const buttonPrimary = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const teamCard = {
  background: "#f8fafc",
  borderRadius: 12,
  padding: 18,
  border: "1px solid #e5e7eb",
  display: "grid",
  gap: 14,
};

const teamNameStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
};

const teamSubtitle = {
  color: "#64748b",
  fontSize: 13,
};

const teamActionRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
};

const ghostButton = {
  flex: 1,
  borderRadius: 10,
  border: "1px solid transparent",
  background: "#eff6ff",
  color: "#2563eb",
  padding: "10px 12px",
  cursor: "pointer",
};

const outlineButton = {
  flex: 1,
  borderRadius: 10,
  border: "1px solid #2563eb",
  background: "transparent",
  color: "#2563eb",
  padding: "10px 12px",
  cursor: "pointer",
};

const emptyTeams = {
  color: "#64748b",
  padding: 22,
  borderRadius: 12,
  background: "#f8fafc",
  textAlign: "center" as const,
};

const viewTeamsButton = {
  width: "100%",
  marginTop: 16,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #2563eb",
  background: "#ffffff",
  color: "#2563eb",
  fontWeight: 700,
  cursor: "pointer",
};

const errorText = {
  color: "#dc2626",
  marginTop: 12,
  fontSize: 13,
};

const successText = {
  color: "#16a34a",
  marginTop: 12,
  fontSize: 13,
};

const loadingStyle = {
  color: "#475569",
  padding: 40,
};
