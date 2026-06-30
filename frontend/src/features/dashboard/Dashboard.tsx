// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  Layers3,
  CalendarDays,
  Users,
  UsersRound,
  ClipboardList,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { api } from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type DashboardCounts = {
  todo: number;
  in_progress: number;
  done: number;
};

type Productivity = {
  total_tasks: number;
  assigned_tasks: number;
  overdue_tasks: number;
  completed_tasks: number;
};

type TeamType = {
  team_id: string;
  team_name: string;
  members: any[];
  archived: boolean;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<DashboardCounts>({
    todo: 0,
    in_progress: 0,
    done: 0,
  });

  const [productivity, setProductivity] = useState<Productivity>({
    total_tasks: 0,
    assigned_tasks: 0,
    overdue_tasks: 0,
    completed_tasks: 0,
  });

  const [teams, setTeams] = useState<TeamType[]>([]);
  const [personalBoardsCount, setPersonalBoardsCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [allBoards, setAllBoards] = useState<any[]>([]);
  const [clickedTaskId, setClickedTaskId] = useState<string | null>(null);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  useEffect(() => {
    fetchDashboard();
  }, [currentMonth, currentWeek]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDashboard = async () => {
    try {
      const [
        dashboardRes,
        productivityRes,
        workloadRes,
        meRes,
        recentTasksRes,
        deadlinesRes,
        analyticsRes,
        personalBoardsRes,
        plannerRes,
        overviewRes,
        searchRes,
      ] = await Promise.all([
        api.get("/dashboard"),
        api.get("/activity/productivity"),
        api.get("/activity/workload"),
        api.get("/users/me"),
        api.get("/dashboard/recent-tasks"),
        api.get("/dashboard/upcoming-deadlines"),
        api.get(
          `/dashboard/analytics-graph?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}`
        ),
        api.get("/boards/personal"),
        api.get("/planner"),
        api.get(`/dashboard/task-overview?week_offset=${currentWeek}`),
        api.get("/dashboard/search-data"),
      ]);
      // setAllBoards(personalBoardsRes.data || []);
      // setAllTasks([
      //   ...(recentTasksRes.data || []),
      //   ...(deadlinesRes.data || []),
      // ]);
      setTeams(searchRes.data.teams || []);

setAllBoards(
  searchRes.data.boards || []
);

setAllTasks(
  searchRes.data.cards || []
);
      setCounts(dashboardRes.data);
      setProductivity(productivityRes.data);
      setTeams(workloadRes.data);
      setRecentTasks(recentTasksRes.data);
      setDeadlines(deadlinesRes.data);
      setAnalyticsData(analyticsRes.data);
      setOverviewData(overviewRes.data);
      setUser(meRes.data);
      setPersonalBoardsCount(personalBoardsRes.data.length);
      setPlannerData(plannerRes.data || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const [user, setUser] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamImage, setTeamImage] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState("");

  const totalTasks = counts.todo + counts.in_progress + counts.done;

  const handleCreateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append("name", teamName);
      formData.append("type", "private");
      formData.append("description", teamDescription);
      if (teamImage) formData.append("image", teamImage);
      const res = await api.post("/teams/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const createdTeam = res.data;
      if (teamMembers.trim()) {
        const emailArray = teamMembers.split(",").map((email) => email.trim()).filter(Boolean);
        await api.post(`/teams/${createdTeam.id}/invite`, { emails: emailArray });
      }
      alert("Team created successfully ✅");
      navigate(`/teams/${createdTeam.id}`);
      setTeamName("");
      setTeamDescription("");
      setTeamImage(null);
      setTeamMembers("");
      fetchDashboard();
    } catch (err) {
      console.log(err);
      alert("Failed to create team");
    }
  };

  // ✅ EXACT same search logic as previous code
  const filteredTasks = search
    ? allTasks.filter((t) => t?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : [];
  const filteredBoards = search
    ? allBoards.filter((b) => (b.title || "").toLowerCase().includes(debouncedSearch.toLowerCase()))
    : [];
  const filteredTeams = search
    ? teams.filter((t) => (t.team_name || "").toLowerCase().includes(debouncedSearch.toLowerCase()))
    : [];

  const getWeekRange = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + currentWeek * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${monday.toLocaleDateString("en-US", options)} - ${sunday.toLocaleDateString("en-US", options)}`;
  };

  const getStatusColor = (status: string) => {
    if (status?.toLowerCase().includes("progress")) return { bg: "#EAF1FF", text: "#3B82F6", label: "In Progress" };
    if (status?.toLowerCase().includes("done") || status?.toLowerCase().includes("completed"))
      return { bg: "#EAFBF0", text: "#22C55E", label: "Completed" };
    return { bg: "#FFEFE3", text: "#F08A3C", label: "To Do" };
  };

  const getPriorityDotColor = (status: string) => {
    if (status?.toLowerCase().includes("progress")) return "#3B82F6";
    if (status?.toLowerCase().includes("done") || status?.toLowerCase().includes("completed")) return "#22C55E";
    return "#EF4444";
  };

  // ✅ Graduated red intensity for "days left" — strongest red at 1 day, progressively lighter as days increase
  const getDeadlineUrgencyColor = (diff: number) => {
    if (diff <= 1) return "#DC2626"; // strongest red — most urgent
    if (diff === 2) return "#EF4444"; // slightly lighter red
    if (diff === 3) return "#F87171"; // lighter red
    if (diff <= 5) return "#FCA5A5"; // even lighter red
    return "#64748B"; // neutral gray once it's not urgent anymore
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px", color: "#7C3AED", background: "#F1F1F8" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ background: "#F1F1F8", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar />

      <style>{`
        .recent-tasks-scroll::-webkit-scrollbar { width: 5px; }
        .recent-tasks-scroll::-webkit-scrollbar-track { background: transparent; }
        .recent-tasks-scroll::-webkit-scrollbar-thumb { background: #C7B9F5; border-radius: 10px; }
        .qa-card { position: relative; overflow: hidden; }
        .qa-card-wave {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 140px;
          height: 70px;
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 28px" }}>

        {/* ── QUICK ACCESS HEADER + SEARCH ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", gap: "16px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0F1226" }}>Quick Access</h2>

          <div style={{ position: "relative", width: "320px" }}>
            {/* ✅ SEARCH — exact same logic as previous code */}
            <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #E5E4F1", borderRadius: "12px", padding: "10px 14px", gap: "10px" }}>
              <Search size={16} color="#94A3B8" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks, boards, teams..."
                style={{ border: "none", outline: "none", background: "transparent", fontSize: "14px", color: "#0F172A", width: "100%" }}
              />
            </div>

            {/* ✅ Dropdown — same conditional logic: only shows when debouncedSearch has value */}
            {debouncedSearch && (
              <div style={{ position: "absolute", top: "48px", left: 0, width: "100%", background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 8px 25px rgba(0,0,0,0.08)", zIndex: 1000, maxHeight: "300px", overflowY: "auto" }}>
                {/* Teams */}
                {filteredTeams.length > 0 && (
                  <>
                    <div style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Teams</div>
                    {filteredTeams.map((t) => (
                      <div
                        key={t.team_id}
                        style={{ padding: "8px 12px", cursor: "pointer", color: "#0f172a", fontSize: "14px" }}
                        onClick={() => navigate(`/teams/${t.team_id}`)}
                      >
                        👥 {t.team_name}
                      </div>
                    ))}
                  </>
                )}
                {/* Boards */}
                {filteredBoards.length > 0 && (
                  <>
                    <div style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Boards</div>
                    {filteredBoards.map((b) => (
                      <div
                        key={b.id}
                        style={{ padding: "8px 12px", cursor: "pointer", color: "#0f172a", fontSize: "14px" }}
                        // onClick={() => navigate(`/boards/${b.id}`)}
                        onClick={() => {
  if (b.team_id) {
    navigate(
      `/teams/${b.team_id}?boardId=${b.id}`
    );
  } else {
    navigate(`/boards/${b.id}`);
  }
}}
                      >
                        📋 {b.title}
                      </div>
                    ))}
                  </>
                )}
                {/* Tasks/Cards */}
                {filteredTasks.length > 0 && (
                  <>
                    <div style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>Cards</div>
                    {/* {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        style={{ padding: "8px 12px", cursor: "pointer", color: "#0f172a", fontSize: "14px" }}
                      >
                        ✅ {task.title}
                      </div>
                    ))} */}
                    {filteredTasks.map((task) => (
  <div
    key={task.id}
    style={{
      padding: "8px 12px",
      cursor: "pointer",
      color: "#0f172a",
      fontSize: "14px"
    }}
    onClick={() => {
      setSearch("");

      if (task.team_id) {
        navigate(
          `/teams/${task.team_id}?boardId=${task.board_id}&cardId=${task.id}`
        );
      } else {
        navigate(
          `/boards/${task.board_id}?cardId=${task.id}`
        );
      }
    }}
  >
    ✅ {task.title}
  </div>
))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "24px" }}>
          <QuickAccessCard
            icon={<Layers3 size={22} color="#fff" />}
            title="My Boards"
            subtitle="View and manage your boards"
            onClick={() => navigate("/boards")}
          />
          <QuickAccessCard
            icon={<UsersRound size={22} color="#fff" />}
            title="My Teams"
            subtitle="Collaborate with your teams"
            onClick={() => navigate("/teams")}
          />
          <QuickAccessCard
            icon={<CalendarDays size={22} color="#fff" />}
            title="Calendar"
            subtitle="View your schedule & deadlines"
            onClick={() => navigate("/planner")}
          />
        </div>

        {/* ── CREATE TEAM INLINE FORM ── matching the image layout, with a soft glass-gradient surface */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(245,243,255,0.9) 45%, rgba(255,255,255,0.96) 100%)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 28px rgba(124,58,237,0.06)",
            padding: "24px 28px",
            marginBottom: "24px",
            overflow: "hidden",
          }}
        >

          {/* decorative dot grid + ring (top right) */}
          <svg width="160" height="120" viewBox="0 0 160 120" style={{ position: "absolute", top: "14px", right: "18px", pointerEvents: "none" }}>
            <circle cx="118" cy="38" r="16" fill="none" stroke="#EDEAF7" strokeWidth="2" />
            <g fill="#D9D6EE">
              {Array.from({ length: 4 }).map((_, row) =>
                Array.from({ length: 6 }).map((_, col) => (
                  <circle key={`${row}-${col}`} cx={150 - col * 9} cy={10 + row * 9} r="1.6" />
                ))
              )}
            </g>
            <path d="M2 6 L10 6 M6 2 L6 10" stroke="#C9C4EA" strokeWidth="1.6" strokeLinecap="round" transform="translate(40,16)" />
          </svg>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #8B5CF6, #6D5CE6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 14px rgba(124,58,237,0.28)" }}>
              <Users size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0F1226" }}>Create New Team</h3>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94A3B8" }}>Collaborate with your team and get things done efficiently.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.1fr auto", gap: "18px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1E1B2E", marginBottom: "8px" }}>Team Name</label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #E5E4F1", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" as const, color: "#0F172A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1E1B2E", marginBottom: "8px" }}>Description</label>
              <input
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Enter team description"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #E5E4F1", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" as const, color: "#0F172A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1E1B2E", marginBottom: "8px" }}>Invite Members</label>
              <input
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder="john@gmail.com"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #E5E4F1", fontSize: "13px", outline: "none", background: "#fff", boxSizing: "border-box" as const, color: "#0F172A" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1E1B2E", marginBottom: "8px" }}>Team Image</label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", borderRadius: "10px", border: "1px dashed #D6D3E8", fontSize: "13px", color: "#64748B", cursor: "pointer", background: "#FAFAFC" }}>
                <Upload size={14} color="#94A3B8" />
                <span>{teamImage ? teamImage.name.slice(0, 14) + "..." : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files?.[0]) setTeamImage(e.target.files[0]); }}
                />
              </label>
              <span style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px", display: "block" }}>JPG, PNG up to 2MB</span>
            </div>
            <button
              onClick={handleCreateTeam}
              style={{ padding: "12px 26px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #5B5BD6)", color: "#fff", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" as const, height: "44px", boxShadow: "0 8px 18px rgba(99,73,222,0.28)" }}
            >
              Create Team
            </button>
          </div>
        </div>

        {/* ── MIDDLE ROW: Recent Tasks + Upcoming Deadlines + Task Progress ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "24px", alignItems: "stretch" }}>

          {/* ✅ Recent Tasks — scrollable, max 4 visible, no "view all tasks" */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #ECEBF5", padding: "20px 18px 20px 22px", height: "294px", boxSizing: "border-box" as const, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0F1226" }}>Recent Tasks</h3>
            </div>
            {/* Scrollable list showing up to 4 tasks visibly, with visible thin scrollbar */}
            <div className="recent-tasks-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", paddingRight: "10px" }}>
              {recentTasks.map((task: any, i: number) => {
                const s = getStatusColor(task.status);
                const dot = getPriorityDotColor(task.status);
                return (
                  <div
                    key={i}
                    
// onClick={() => {
//     if (task.team_id) {
//       navigate(
//         `/teams/${task.team_id}?boardId=${task.board_id}&cardId=${task.id}`
//       );
//     } else {
//       navigate(
//         `/boards/${task.board_id}`
//       );
//     }
//   }}
onClick={() => {
  setClickedTaskId(task.id);

  setTimeout(() => {
    if (task.team_id) {
      navigate(
        `/teams/${task.team_id}?boardId=${task.board_id}&cardId=${task.id}`
      );
    } else {
      navigate(
        `/boards/${task.board_id}`
      );
    }
  }, 200);
}}

                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 6px", borderRadius: "8px", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F7FC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      {/* <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2.5px solid ${dot}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {(task.status?.toLowerCase().includes("done") || task.status?.toLowerCase().includes("completed")) && (
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: dot }} />
                        )}
                      </div> */}
                      <div
  style={{
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border:
      clickedTaskId === task.id
        ? "none"
        : `2.5px solid ${dot}`,
    background:
      clickedTaskId === task.id
        ? dot
        : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    transition: "all 0.2s ease"
  }}
>
  {clickedTaskId === task.id ? (
    "✓"
  ) : (
    (task.status?.toLowerCase().includes("done") ||
      task.status?.toLowerCase().includes("completed")) && (
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: dot
        }}
      />
    )
  )}
</div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0F1226", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>{task.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
                          <ClipboardList size={11} /> {task.priority || "Task"}
                        </p>
                      </div>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: s.bg, color: s.text, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div style={{ position: "relative", background: "#fff", borderRadius: "18px", border: "1px solid #ECEBF5", padding: "20px 20px 16px 22px", height: "294px", overflow: "hidden" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0F1226", marginBottom: "14px", position: "relative", zIndex: 2 }}>Upcoming Deadlines</h3>

            {/* Clock + city illustration — pinned to bottom-right corner, sits BEHIND the deadline rows, container height never changes */}
            <div style={{ position: "absolute", right: "-6px", bottom: "-8px", width: "230px", height: "160px", zIndex: 0, pointerEvents: "none" }}>
              <svg viewBox="0 0 320 160" width="100%" height="100%" style={{ display: "block" }}>
                <defs>
                  {/* glossy blue bezel: light sky-blue highlight top-left fading to deep navy bottom-right */}
                  <linearGradient id="clockBezel" x1="0.15" y1="0.1" x2="0.9" y2="0.95">
                    <stop offset="0%" stopColor="#8FB9F5" />
                    <stop offset="30%" stopColor="#4C7EDB" />
                    <stop offset="65%" stopColor="#2E4FB8" />
                    <stop offset="100%" stopColor="#1B2E73" />
                  </linearGradient>
                  {/* thin outer rim line for extra glassiness */}
                  <linearGradient id="clockRim" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#BFD9FB" />
                    <stop offset="100%" stopColor="#16204F" />
                  </linearGradient>
                  {/* face: soft white center, faint cool-gray edge */}
                  <radialGradient id="clockFace" cx="38%" cy="35%" r="75%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="70%" stopColor="#F7F7FB" />
                    <stop offset="100%" stopColor="#E7E8F2" />
                  </radialGradient>
                  <linearGradient id="standGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CFC9EC" />
                    <stop offset="100%" stopColor="#B6AEE0" />
                  </linearGradient>
                </defs>

                {/* skyline silhouette */}
                <g opacity="0.5" fill="#D9D6EF">
                  <rect x="14" y="86" width="26" height="60" rx="3" />
                  <rect x="44" y="66" width="20" height="80" rx="3" />
                  <rect x="68" y="100" width="18" height="46" rx="3" />
                  <rect x="34" y="54" width="10" height="14" rx="2" />
                </g>
                <g opacity="0.75" fill="#C9C4E8" fillOpacity="0.7">
                  <rect x="92" y="78" width="22" height="68" rx="3" />
                  <rect x="118" y="58" width="16" height="88" rx="3" />
                </g>
                {/* window dots */}
                <g fill="#fff" opacity="0.65">
                  <circle cx="24" cy="100" r="1.6" /><circle cx="32" cy="100" r="1.6" />
                  <circle cx="24" cy="110" r="1.6" /><circle cx="32" cy="110" r="1.6" />
                  <circle cx="52" cy="80" r="1.6" /><circle cx="58" cy="80" r="1.6" />
                  <circle cx="52" cy="92" r="1.6" /><circle cx="58" cy="92" r="1.6" />
                </g>

                {/* soft contact shadow under the clock */}
                <ellipse cx="200" cy="142" rx="78" ry="9" fill="#1B2E73" opacity="0.12" />

                {/* clock stand */}
                <rect x="156" y="132" width="88" height="11" rx="5" fill="url(#standGradient)" />
                <rect x="183" y="115" width="34" height="20" rx="3" fill="#BEB7E4" />

                {/* outer glow ring */}
                <circle cx="200" cy="86" r="60" fill="none" stroke="#A9C6F7" strokeOpacity="0.35" strokeWidth="3" />

                {/* clock bezel — thick glossy ring */}
                <circle cx="200" cy="86" r="56" fill="url(#clockBezel)" />
                <circle cx="200" cy="86" r="56" fill="none" stroke="url(#clockRim)" strokeWidth="1.5" />

                {/* inner bevel ring between bezel and face */}
                <circle cx="200" cy="86" r="46" fill="none" stroke="#0F1E55" strokeOpacity="0.25" strokeWidth="2" />

                {/* clock face */}
                <circle cx="200" cy="86" r="44" fill="url(#clockFace)" />
                <circle cx="200" cy="86" r="44" fill="none" stroke="#D8D9E8" strokeWidth="1.5" />

                {/* tick marks */}
                <g stroke="#9FA3C4" strokeWidth="2" strokeLinecap="round">
                  <line x1="200" y1="46" x2="200" y2="52" />
                  <line x1="200" y1="120" x2="200" y2="126" />
                  <line x1="160" y1="86" x2="166" y2="86" />
                  <line x1="234" y1="86" x2="240" y2="86" />
                </g>
                <g stroke="#C3C6DC" strokeWidth="1.2" strokeLinecap="round">
                  <line x1="228.3" y1="57.7" x2="224.6" y2="61.4" />
                  <line x1="171.7" y1="57.7" x2="175.4" y2="61.4" />
                  <line x1="228.3" y1="114.3" x2="224.6" y2="110.6" />
                  <line x1="171.7" y1="114.3" x2="175.4" y2="110.6" />
                </g>

                {/* hands — navy, matching reference */}
                <line x1="200" y1="86" x2="200" y2="58" stroke="#1E2A63" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="200" y1="86" x2="222" y2="86" stroke="#1E2A63" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="200" cy="86" r="4.5" fill="#1E2A63" />

                {/* glossy highlight arcs on bezel */}
                <path d="M168 56 A48 48 0 0 1 212 44" stroke="#D7E6FC" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
                <path d="M250 70 A56 56 0 0 1 250 104" stroke="#16204F" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.35" />
              </svg>
            </div>

            {/* ✅ Deadline rows — functionality from original code: full list, scrollable, hover highlight.
                Sits ABOVE the clock (zIndex 2) so rows remain fully visible/readable even where they overlap the illustration. */}
            <div
              className="recent-tasks-scroll"
              style={{ position: "relative", zIndex: 2, maxHeight: "210px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px", paddingRight: "8px" }}
            >
              {deadlines.map((item: any, i: number) => {
                const dueDate = item.due_date ? new Date(item.due_date) : null;
                const today = new Date();
                const diff = dueDate
                  ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const monthLabel = dueDate ? dueDate.toLocaleString("en-US", { month: "short" }).toUpperCase() : "—";
                const dayLabel = dueDate ? dueDate.getDate() : "—";
                const urgencyColor = getDeadlineUrgencyColor(diff);
                return (
                  <div
                    key={i} 
                    onClick={() => {
  if (item.team_id) {
    navigate(
      `/teams/${item.team_id}?boardId=${item.board_id}&cardId=${item.id}`
    );
  } else {
    navigate(
      `/boards/${item.board_id}`
    );
  }
}}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "10px 10px", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease", background: "rgba(255,255,255,0.94)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F3F4F6";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.94)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Calendar date badge — matches reference image: month label + bold day number */}
                    <div style={{ width: "46px", height: "50px", borderRadius: "10px", background: "#F1F0FA", border: "1px solid #E7E4F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#8B85B8", lineHeight: 1, letterSpacing: "0.4px" }}>{monthLabel}</span>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "#1E1B2E", lineHeight: 1.3 }}>{dayLabel}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0F1226", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </h4>
                      <p style={{ margin: "4px 0 0", color: "#8B8B9E", fontSize: "12px" }}>
                        {item.description || "Upcoming task"}
                      </p>
                    </div>

                    <span style={{ color: urgencyColor, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                      {diff} day{diff === 1 ? "" : "s"} left
                    </span>
                  </div>
                );
              })}
            </div>
          </div>


          {/* ✅ Task Progress — NO "On Hold", exact same data as previous code */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #ECEBF5", padding: "20px 22px", height: "294px", boxSizing: "border-box" as const, display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: "16px", fontWeight: 800, color: "#0F1226" }}>Task Progress</h3>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
              {/* Same PieChart as previous code */}
              <div style={{ position: "relative", width: "170px", height: "170px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PieChart width={170} height={170}>
                  <Pie
                    data={[
                      { name: "To Do", value: counts.todo },
                      { name: "In Progress", value: counts.in_progress },
                      { name: "Completed", value: counts.done },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={3}
                    cornerRadius={8}
                    dataKey="value"
                  >
                    <Cell fill="#8B5CF6" />
                    <Cell fill="#3B82F6" />
                    <Cell fill="#22C55E" />
                  </Pie>
                </PieChart>
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <div style={{ fontSize: "30px", fontWeight: 800, color: "#0F1226", lineHeight: 1 }}>{totalTasks}</div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>Total Tasks</div>
                </div>
              </div>
              {/* ✅ Only 3 items, no "On Hold" */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#8B5CF6", flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "#1E1B2E", fontWeight: 700 }}>To Do</div>
                    <small style={{ color: "#9CA3AF" }}>{counts.todo} Tasks</small>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "#1E1B2E", fontWeight: 700 }}>In Progress</div>
                    <small style={{ color: "#9CA3AF" }}>{counts.in_progress} Tasks</small>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "#1E1B2E", fontWeight: 700 }}>Completed</div>
                    <small style={{ color: "#9CA3AF" }}>{counts.done} Tasks</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Task Overview Bar Chart + Analytics Area Chart ── */}
        {/* ✅ EXACT same graphs as previous code — only containers restyled */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* ✅ Tasks Overview — EXACT same BarChart as previous code */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px 24px 16px", border: "1px solid #ECEBF5" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0F1226" }}>Tasks Overview</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E1B2E" }}>
                  {getWeekRange()}
                </span>
                <button
                  style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #E5E4F1", background: "linear-gradient(135deg, #ffffff, #F1EFFB)", cursor: "pointer", fontWeight: 700, fontSize: "14px", color: "#5B5470", boxShadow: "0 1px 2px rgba(124,58,237,0.06)" }}
                  onClick={() => setCurrentWeek((prev) => prev - 1)}
                >
                  &lt;
                </button>
                <button
                  style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #E5E4F1", background: "linear-gradient(135deg, #ffffff, #F1EFFB)", cursor: "pointer", fontWeight: 700, fontSize: "14px", color: "#5B5470", boxShadow: "0 1px 2px rgba(124,58,237,0.06)" }}
                  onClick={() => setCurrentWeek((prev) => prev + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div style={{ width: "100%", height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData} barCategoryGap={18}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="todo" name="To Do" fill="#8B5CF6" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="progress" name="In Progress" fill="#60A5FA" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="done" name="Completed" fill="#BFDBFE" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ✅ Analytics Overview — EXACT same AreaChart as previous code */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px 24px 16px", border: "1px solid #ECEBF5" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0F1226" }}>Analytics Overview</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E1B2E" }}>
                  {months[currentMonth.getMonth()]}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #E5E4F1", background: "linear-gradient(135deg, #ffffff, #F1EFFB)", cursor: "pointer", fontWeight: 700, fontSize: "14px", color: "#5B5470", boxShadow: "0 1px 2px rgba(124,58,237,0.06)" }}
                >
                  &lt;
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #E5E4F1", background: "linear-gradient(135deg, #ffffff, #F1EFFB)", cursor: "pointer", fontWeight: 700, fontSize: "14px", color: "#5B5470", boxShadow: "0 1px 2px rgba(124,58,237,0.06)" }}
                >
                  &gt;
                </button>
              </div>
            </div>

            <div style={{ width: "100%", height: "190px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fill: "#8C8CA1", fontSize: 12 }} />
                  <YAxis allowDecimals={false} domain={[0, "auto"]} tick={{ fill: "#8C8CA1", fontSize: 12 }} />
                  <Tooltip />
                  {/* COMPLETED */}
                  <Area type="monotone" dataKey="completed" stroke="#22C55E" fill="url(#greenGradient)" strokeWidth={3} />
                  {/* PROGRESS */}
                  <Area type="monotone" dataKey="progress" stroke="#3B82F6" fill="url(#blueGradient)" strokeWidth={3} />
                  {/* TODO */}
                  <Area type="monotone" dataKey="todo" stroke="#8B5CF6" fill="url(#purpleGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "flex", gap: "18px", marginTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6B7280", fontSize: "13px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }}></span>
                Completed
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6B7280", fontSize: "13px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3B82F6", display: "inline-block" }}></span>
                In Progress
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6B7280", fontSize: "13px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#8B5CF6", display: "inline-block" }}></span>
                To Do
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const QuickAccessCard = ({ icon, title, subtitle, onClick }: any) => (
  <div
    className="qa-card"
    onClick={onClick}
    style={{ background: "#fff", borderRadius: "18px", border: "1px solid #ECEBF5", padding: "22px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(15,18,38,0.06)"; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 1 }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #8B5CF6, #6D5CE6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 16px rgba(124,58,237,0.28)" }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0F1226" }}>{title}</p>
        <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#94A3B8" }}>{subtitle}</p>
      </div>
    </div>
    <ChevronRight size={20} color="#CBD5E1" style={{ position: "relative", zIndex: 1 }} />

    {/* decorative wave, bottom-right, matching reference card background flourish */}
    <svg className="qa-card-wave" viewBox="0 0 140 70" preserveAspectRatio="none">
      <path d="M0 50 Q35 20 70 45 T140 30 V70 H0 Z" fill="#F4F3FB" />
    </svg>
  </div>
);

export default Dashboard;

// import React, { useEffect, useState } from "react";
// import {
//   LayoutDashboard,
//   CheckCircle2,
//   Clock3,
//   AlertCircle,
//   Layers3,
//   CalendarDays,
//   Users,
//   ClipboardList,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../../components/layout/Navbar";
// import { api } from "../../services/api";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   Legend,
// } from "recharts";
// type DashboardCounts = {
//   todo: number;
//   in_progress: number;
//   done: number;
// };

// type Productivity = {
//   total_tasks: number;
//   assigned_tasks: number;
//   overdue_tasks: number;
//   completed_tasks: number;
// };

// type TeamType = {
//   team_id: string;
//   team_name: string;
//   members: any[];
//   archived: boolean;
// };

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [counts, setCounts] = useState<DashboardCounts>({
//     todo: 0,
//     in_progress: 0,
//     done: 0,
//   });

//   const [productivity, setProductivity] = useState<Productivity>({
//     total_tasks: 0,
//     assigned_tasks: 0,
//     overdue_tasks: 0,
//     completed_tasks: 0,
//   });

//   const [teams, setTeams] = useState<TeamType[]>([]);
//   const [personalBoardsCount, setPersonalBoardsCount] =
//     useState(0);
//   const [recentTasks, setRecentTasks] = useState<any[]>([]);
//   const [deadlines, setDeadlines] = useState<any[]>([]);
//   const [plannerData, setPlannerData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentMonth, setCurrentMonth] =
//     useState(new Date());
//   const [currentWeek, setCurrentWeek] =
//   useState(0);

//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [allTasks, setAllTasks] = useState<any[]>([]);
//   const [allBoards, setAllBoards] = useState<any[]>([]);

//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   useEffect(() => {
//     fetchDashboard();
//   }, [currentMonth, currentWeek]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(search);
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [search]);

//   const fetchDashboard = async () => {
//     try {
//       const [
//         dashboardRes,
//         productivityRes,
//         workloadRes,
//         meRes,
//         recentTasksRes,
//         deadlinesRes,
//         analyticsRes,
//         personalBoardsRes,
//         plannerRes,
//         overviewRes,
  
//       ] = await Promise.all([
//         api.get("/dashboard"),
//         api.get("/activity/productivity"),
//         api.get("/activity/workload"),
//         api.get("/users/me"),

//         api.get("/dashboard/recent-tasks"),
//         api.get("/dashboard/upcoming-deadlines"),
//         api.get(
//           `/dashboard/analytics-graph?month=${currentMonth.getMonth() + 1
//           }&year=${currentMonth.getFullYear()}`
//         ),
//         api.get("/boards/personal"),
//         api.get("/planner"),
//         api.get(`/dashboard/task-overview?week_offset=${currentWeek}`),
//       ]);
//       setAllBoards(personalBoardsRes.data || []);
//       setAllTasks([
//         ...(recentTasksRes.data || []),
//         ...(deadlinesRes.data || []),
//       ]);
//       setCounts(dashboardRes.data);
//       setProductivity(productivityRes.data);
//       setTeams(workloadRes.data);
//       setRecentTasks(recentTasksRes.data);
//       setDeadlines(deadlinesRes.data);
//       setAnalyticsData(analyticsRes.data);
//       setOverviewData(overviewRes.data);
//       setUser(meRes.data);
//       setPersonalBoardsCount(personalBoardsRes.data.length);
//       setPlannerData(plannerRes.data || null);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const [user, setUser] = useState<any>(null);

//   // ✅ Calculate chart data from planner API
//   const todoCount = plannerData?.kanban?.to_do?.length || 0;
//   const inProgressCount = plannerData?.kanban?.in_progress?.length || 0;
//   const doneCount = plannerData?.kanban?.done?.length || 0;

//   const chartData = [
//     {
//       name: "To Do",
//       value: todoCount,
//       color: "#8B5CF6",
//     },
//     {
//       name: "In Progress",
//       value: inProgressCount,
//       color: "#3B82F6",
//     },
//     {
//       name: "Done",
//       value: doneCount,
//       color: "#22C55E",
//     },
//   ];

//   const [analyticsData, setAnalyticsData] =
//     useState<any[]>([]);
//   const [overviewData, setOverviewData] =
//   useState<any[]>([]);
//   const [teamName, setTeamName] = useState("");
//   const [teamDescription, setTeamDescription] =
//     useState("");

//   const [teamImage, setTeamImage] =
//     useState<File | null>(null);
//   const [teamMembers, setTeamMembers] =
//     useState("");
//   const [hoveredTaskIndex, setHoveredTaskIndex] = useState<number | null>(null);
//   const [hoveredDeadlineIndex, setHoveredDeadlineIndex] = useState<number | null>(null);

//   const handleCreateTeam = async () => {
//     try {
//       const formData = new FormData();

//       formData.append("name", teamName);

//       formData.append("type", "private");

//       formData.append(
//         "description",
//         teamDescription
//       );

//       if (teamImage) {
//         formData.append("image", teamImage);
//       }

//       // ✅ CREATE TEAM
//       const res = await api.post(
//         "/teams/upload",
//         formData,
//         {
//           headers: {
//             "Content-Type":
//               "multipart/form-data",
//           },
//         }
//       );

//       const createdTeam = res.data;
      



//       // ✅ INVITE MEMBERS
//       if (teamMembers.trim()) {

//         const emailArray = teamMembers
//           .split(",")
//           .map((email) => email.trim())
//           .filter(Boolean);

//         await api.post(
//           `/teams/${createdTeam.id}/invite`,
//           {
//             emails: emailArray,
//           }
//         );
//       }

//       alert("Team created successfully ✅");
//       // ✅ ✅ ADD THIS LINE
// navigate(`/teams/${createdTeam.id}`);

//       setTeamName("");
//       setTeamDescription("");
//       setTeamImage(null);
//       setTeamMembers("");

//       fetchDashboard();

//     } catch (err) {
//       console.log(err);

//       alert("Failed to create team");
//     }
//   };
//   const filteredTasks = search
//     ? allTasks.filter(t => t?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()))
//     : [];

//   const filteredBoards = search
//     ? allBoards.filter(b => (b.title || "").toLowerCase().includes(debouncedSearch.toLowerCase()))
//     : [];

//   const filteredTeams = search
//     ? teams.filter(t => (t.team_name || "").toLowerCase().includes(debouncedSearch.toLowerCase()))
//     : [];
// const getWeekRange = () => {
//   const today = new Date();

//   const currentDay = today.getDay();

//   const monday = new Date(today);

//   monday.setDate(
//     today.getDate() - currentDay + 1 + currentWeek * 7
//   );

//   const sunday = new Date(monday);

//   sunday.setDate(monday.getDate() + 6);

//   const options: Intl.DateTimeFormatOptions = {
//     day: "numeric",
//     month: "short",
//   };

//   return `${monday.toLocaleDateString(
//     "en-US",
//     options
//   )} - ${sunday.toLocaleDateString(
//     "en-US",
//     options
//   )}`;
// };
//   if (loading) {
//     return <div style={styles.loading}>Loading...</div>;
//   }

//   return (
//     <div style={styles.page}>
//       <Navbar />
//       {/* navbar already above */}

//       <div style={{ ...styles.container, padding: "10px" }}>
//         {/* LEFT */}
//         {/* TOP SECTION */}
//         <div style={styles.topSection}>

//           {/* LEFT CONTENT */}
//           <div style={styles.leftTop}>
//             {/* HEADER */}
//             <div style={styles.header}>
//               <div>
//                 <h1 style={styles.heading}>
//                   <span style={styles.helloText}>Hello, </span>
//                   <span style={styles.userName}>
//                     {user?.first_name}!
//                   </span>
//                 </h1>

//                 <p style={styles.subheading}>
//                   Let's turn today's plans into tomorrow's progress.
//                   <br />
//                   You've got this!
//                 </p>
//               </div>


//               {/* ✅ SEARCH */}
//               <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
//                 <div style={styles.searchContainer}>
//                   <input
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search tasks, boards, teams..."
//                     style={styles.searchInput}
//                   />
//                 </div>

//                 {debouncedSearch && (
//                   <div style={styles.dropdownResults}>
//                     {/* Teams */}
//                     {filteredTeams.length > 0 && (
//                       <>
//                         <div style={styles.dropdownLabel}>Teams</div>
//                         {filteredTeams.map((t) => (
//                           <div
//                             key={t.team_id}
//                             style={styles.dropdownItem}
//                             onClick={() => navigate(`/teams/${t.team_id}`)}
//                           >
//                             👥 {t.team_name}
//                           </div>
//                         ))}
//                       </>
//                     )}

//                     {/* Boards */}
//                     {filteredBoards.length > 0 && (
//                       <>
//                         <div style={styles.dropdownLabel}>Boards</div>
//                         {filteredBoards.map((b) => (
//                           <div
//                             key={b.id}
//                             style={styles.dropdownItem}
//                             onClick={() => navigate(`/boards/${b.id}`)}
//                           >
//                             📋 {b.title}
//                           </div>
//                         ))}
//                       </>
//                     )}

//                     {/* Tasks */}
//                     {filteredTasks.length > 0 && (
//                       <>
//                         <div style={styles.dropdownLabel}>Cards</div>
//                         {filteredTasks.map((task) => (
//                           <div
//                             key={task.id}
//                             style={styles.dropdownItem}
//                           >
//                             ✅ {task.title}
//                           </div>
//                         ))}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>




//             {/* TOP CARDS */}
//             <div style={styles.cardsGrid}>
//               <DashboardCard
//                 title="Total Tasks"
//                 value={counts.todo + counts.in_progress + counts.done}
//                 // value={productivity.total_tasks}
//                 icon={<LayoutDashboard size={18} />}
//                 color="#5B5BD6"
//               />

//               <DashboardCard
//                 title="To Do"
//                 value={counts.todo}
//                 icon={<ClipboardList size={18} />}
//                 color="#8B5CF6"
//               />

//               <DashboardCard
//                 title="In Progress"
//                 value={counts.in_progress}
//                 icon={<Clock3 size={18} />}
//                 color="#3B82F6"
//               />

//               <DashboardCard
//                 title="Completed"
//                 value={counts.done}
//                 icon={<CheckCircle2 size={18} />}
//                 color="#22C55E"
//               />

              
//             </div>

//             {/* ANALYTICS */}
//             <div style={styles.analyticsWrapper}>
//               <div style={styles.analyticsCard}>
//                 <div style={styles.cardTop}>
//                   <h3 style={styles.cardHeading}>Analytics Overview</h3>

//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "10px",
//                     }}
//                   >
//                     <button
//                       onClick={() =>
//                         setCurrentMonth(
//                           new Date(
//                             currentMonth.getFullYear(),
//                             currentMonth.getMonth() - 1,
//                             1
//                           )
//                         )
//                       }
//                       style={styles.monthBtn}
//                     >
//                       &lt;
//                     </button>

//                     <span style={styles.monthText}>
//                       {months[currentMonth.getMonth()]}
//                     </span>

//                     <button
//                       onClick={() =>
//                         setCurrentMonth(
//                           new Date(
//                             currentMonth.getFullYear(),
//                             currentMonth.getMonth() + 1,
//                             1
//                           )
//                         )
//                       }
//                       style={styles.monthBtn}
//                     >
//                       &gt;
//                     </button>
//                   </div>
//                 </div>

//                 <div
//                   style={{
//                     width: "100%",
//                     height: "300px",
//                   }}
//                 >
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart data={analyticsData}>
//                       <defs>
//                         <linearGradient
//                           id="greenGradient"
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop
//                             offset="5%"
//                             stopColor="#22C55E"
//                             stopOpacity={0.25}
//                           />
//                           <stop
//                             offset="95%"
//                             stopColor="#22C55E"
//                             stopOpacity={0}
//                           />
//                         </linearGradient>

//                         <linearGradient
//                           id="blueGradient"
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop
//                             offset="5%"
//                             stopColor="#3B82F6"
//                             stopOpacity={0.25}
//                           />
//                           <stop
//                             offset="95%"
//                             stopColor="#3B82F6"
//                             stopOpacity={0}
//                           />
//                         </linearGradient>

//                         <linearGradient
//                           id="purpleGradient"
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop
//                             offset="5%"
//                             stopColor="#8B5CF6"
//                             stopOpacity={0.25}
//                           />
//                           <stop
//                             offset="95%"
//                             stopColor="#8B5CF6"
//                             stopOpacity={0}
//                           />
//                         </linearGradient>
//                       </defs>

//                       <CartesianGrid
//                         strokeDasharray="3 3"
//                         vertical={false}
//                         stroke="#E5E7EB"
//                       />

//                       <XAxis
//                         dataKey="date"
//                         tick={{
//                           fill: "#8C8CA1",
//                           fontSize: 12,
//                         }}
//                       />

//                       <YAxis
//                         allowDecimals={false}
//                         domain={[0, "auto"]}
//                         tick={{
//                           fill: "#8C8CA1",
//                           fontSize: 12,
//                         }}
//                       />

//                       <Tooltip />

//                       {/* COMPLETED */}
//                       <Area
//                         type="monotone"
//                         dataKey="completed"
//                         stroke="#22C55E"
//                         fill="url(#greenGradient)"
//                         strokeWidth={3}
//                       />

//                       {/* PROGRESS */}
//                       <Area
//                         type="monotone"
//                         dataKey="progress"
//                         stroke="#3B82F6"
//                         fill="url(#blueGradient)"
//                         strokeWidth={3}
//                       />

//                       {/* TODO */}
//                       <Area
//                         type="monotone"
//                         dataKey="todo"
//                         stroke="#8B5CF6"
//                         fill="url(#purpleGradient)"
//                         strokeWidth={3}
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>

//                 <div style={styles.legend}>
//                   <div style={styles.legendItem}>
//                     <span
//                       style={{
//                         ...styles.dot,
//                         background: "#22C55E",
//                       }}
//                     ></span>
//                     Completed
//                   </div>

//                   <div style={styles.legendItem}>
//                     <span
//                       style={{
//                         ...styles.dot,
//                         background: "#3B82F6",
//                       }}
//                     ></span>
//                     In Progress
//                   </div>

//                   <div style={styles.legendItem}>
//                     <span
//                       style={{
//                         ...styles.dot,
//                         background: "#8B5CF6",
//                       }}
//                     ></span>
//                     To Do
//                   </div>
//                 </div>
//               </div>

//               {/* RECENT TASKS */}
//               <div style={styles.recentTasks}>
//                 <div style={styles.cardTop}>
//                   <h3 style={styles.cardHeading}>Recent Tasks</h3>
//                 </div>

//                 {recentTasks.map((task: any, i: number) => {
//                   let color = "#8B5CF6";

//                   if (
//                     task.status?.toLowerCase().includes("progress")
//                   ) {
//                     color = "#3B82F6";
//                   }

//                   if (
//                     task.status?.toLowerCase().includes("done") ||
//                     task.status?.toLowerCase().includes("completed")
//                   ) {
//                     color = "#22C55E";
//                   }

//                   return (
//                     <div
//                       key={i}
//                       style={{
//                         ...styles.taskRow,
//                         ...(hoveredTaskIndex === i ? styles.taskRowHover : {}),
//                       }}
//                       onMouseEnter={() => setHoveredTaskIndex(i)}
//                       onMouseLeave={() => setHoveredTaskIndex(null)}
//                     >
//                       <div>
//                         <h4 style={styles.taskTitle}>
//                           {task.title}
//                         </h4>

//                         <p style={styles.taskSub}>
//                           {task.priority || "Task"}
//                         </p>
//                       </div>

//                       <div
//                         style={{
//                           ...styles.status,
//                           background: `${color}15`,
//                           color,
//                         }}
//                       >
//                         {task.status}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* QUICK ACCESS */}
//             {/* QUICK ACCESS */}

//           </div>
//         </div>


//         {/* RIGHT CREATE TEAM PANEL */}
//         <div style={styles.right}>
//           <h3 style={styles.rightTitle}>Create New Team</h3>

//           <div style={styles.formGroup}>
//             <label style={styles.label}>Team Name</label>

//             <input
//               placeholder="Enter team name"
//               style={styles.input}
//               value={teamName}
//               onChange={(e) =>
//                 setTeamName(e.target.value)
//               }
//             />
//           </div>

//           <div style={styles.formGroup}>
//             <label style={styles.label}>Description</label>

//             <textarea
//               placeholder="Enter team description"
//               style={styles.textarea}
//               value={teamDescription}
//               onChange={(e) =>
//                 setTeamDescription(e.target.value)
//               }
//             />
//           </div>

//           <div style={styles.formGroup}>
//             <label style={styles.label}>Invite Members</label>

//             <input
//               placeholder="john@gmail.com"
//               style={styles.input}
//               value={teamMembers}
//               onChange={(e) =>
//                 setTeamMembers(e.target.value)
//               }
//             />
//           </div>

//           <div style={styles.uploadBox}>

//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => {
//                 if (e.target.files?.[0]) {
//                   setTeamImage(e.target.files[0]);
//                 }
//               }}
//               style={{
//                 marginBottom: "14px",
//               }}
//             />

//             <h4 style={styles.uploadIcon}>⬆</h4>

//             <p style={styles.uploadText}>
//               {teamImage
//                 ? teamImage.name
//                 : "Upload Image"}
//             </p>

//             <span style={styles.uploadSub}>
//               JPG, PNG up to 2MB
//             </span>

//           </div>

//           <button style={styles.submitBtn} onClick={handleCreateTeam}>
//             Create Team
//           </button>
//         </div>
//       </div>
//       {/* FULL WIDTH SECTION */}
//       <div style={styles.fullWidthSection}>

//         {/* QUICK ACCESS */}
//         <div style={styles.quickAccessWrapper}>

//           <div style={styles.quickAccessTop}>
//             <h3 style={styles.quickAccessHeading}>
//               Quick Access
//             </h3>
//           </div>

//           <div style={styles.quickGrid}>

//             <div onClick={() => navigate("/boards")}>
//               <QuickCard
//                 icon={<Layers3 size={18} />}
//                 title="My Boards"
//                 subtitle={`${personalBoardsCount} Boards`}
//               />
//             </div>

//             <QuickCard
//               icon={<ClipboardList size={18} />}
//               title="My Tasks"
//               subtitle={`${productivity.total_tasks} Tasks`}
//             />

//             <div onClick={() => navigate("/teams")}>
//               <QuickCard
//                 icon={<Users size={18} />}
//                 title="My Teams"
//                 subtitle={`${teams.length} Teams`}
//               />
//             </div>

//             <div onClick={() => navigate("/planner")}>
//               <QuickCard
//                 icon={<CalendarDays size={18} />}
//                 title="Calendar"
//                 subtitle="View Schedule"
//               />
//             </div>

//           </div>
//         </div>

//         {/* BOTTOM */}
//         <div style={styles.bottomSection}>

//           {/* KEEP YOUR CURRENT */}
//           {/* TASK PROGRESS CARD */}
//           <div style={styles.progressCard}>
//             <h3 style={styles.cardHeading}>Task Progress</h3>

//             <div style={styles.progressWrapper}>
//               {/* DONUT */}
//               <div style={styles.donutContainer}>
//                 <PieChart width={210} height={210}>
//                   <Pie
//                     data={[
//                       {
//                         name: "To Do",
//                         value: counts.todo,
//                       },
//                       {
//                         name: "In Progress",
//                         value: counts.in_progress,
//                       },
//                       {
//                         name: "Completed",
//                         value: counts.done,
//                       },
//                     ]}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={62}
//                     outerRadius={92}
//                     paddingAngle={3}
//                     dataKey="value"
//                   >
//                     <Cell fill="#8B5CF6" />
//                     <Cell fill="#3B82F6" />
//                     <Cell fill="#22C55E" />
//                   </Pie>
//                 </PieChart>

//                 {/* CENTER TEXT */}
//                 <div style={styles.centerText}>
//                   <h2 style={styles.centerNumber}>
//                     {counts.todo + counts.in_progress + counts.done}
//                     {/* {productivity.total_tasks} */}
//                   </h2>

//                   <p style={styles.centerLabel}>
//                     Total Tasks
//                   </p>
//                 </div>
//               </div>

//               {/* RIGHT LEGENDS */}
//               <div style={styles.progressLegendRight}>
//                 <div style={styles.progressItem}>
//                   <span
//                     style={{
//                       ...styles.dot,
//                       background: "#8B5CF6",
//                     }}
//                   ></span>

//                   <div>
//                     <div>To Do</div>
//                     <small>{counts.todo} Tasks</small>
//                   </div>
//                 </div>

//                 <div style={styles.progressItem}>
//                   <span
//                     style={{
//                       ...styles.dot,
//                       background: "#3B82F6",
//                     }}
//                   ></span>

//                   <div>
//                     <div>In Progress</div>
//                     <small>{counts.in_progress} Tasks</small>
//                   </div>
//                 </div>

//                 <div style={styles.progressItem}>
//                   <span
//                     style={{
//                       ...styles.dot,
//                       background: "#22C55E",
//                     }}
//                   ></span>

//                   <div>
//                     <div>Completed</div>
//                     <small>{counts.done} Tasks</small>
//                   </div>
//                 </div>
//               </div>
//             </div>


//           </div>


//           {/* KEEP YOUR CURRENT */}
//           {/* TASK OVERVIEW CARD */}
//           <div style={styles.barCard}>
//   <div style={styles.cardTop}>
//     <h3 style={styles.cardHeading}>
//       Tasks Overview
//     </h3>

//     <div
//   style={{
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//   }}
// >
//   <button
//     style={styles.monthBtn}
//     onClick={() =>
//       setCurrentWeek(prev => prev - 1)
//     }
//   >
//     &lt;
//   </button>

//   <span style={styles.monthText}>
//     {getWeekRange()}
//   </span>

//   <button
//     style={styles.monthBtn}
//     onClick={() =>
//       setCurrentWeek(prev => prev + 1)
//     }
//   >
//     &gt;
//   </button>
// </div>
//   </div>

//   <div style={{ width: "100%", height: 250 }}>
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart
//         data={overviewData}
//         barCategoryGap={18}
//       >
//         <CartesianGrid
//           strokeDasharray="3 3"
//           vertical={false}
//           stroke="#E5E7EB"
//         />

//         <XAxis
//           dataKey="day"
//           tick={{
//             fill: "#94A3B8",
//             fontSize: 12,
//           }}
//           axisLine={false}
//           tickLine={false}
//         />

//         <YAxis
//           tick={{
//             fill: "#94A3B8",
//             fontSize: 12,
//           }}
//           axisLine={false}
//           tickLine={false}
//         />

//         <Tooltip />

//         <Legend />

//         <Bar
//           dataKey="todo"
//           name="To Do"
//           fill="#8B5CF6"
//           radius={[10, 10, 0, 0]}
//         />

//         <Bar
//           dataKey="progress"
//           name="In Progress"
//           fill="#60A5FA"
//           radius={[10, 10, 0, 0]}
//         />

//         <Bar
//           dataKey="done"
//           name="Completed"
//           fill="#BFDBFE"
//           radius={[10, 10, 0, 0]}
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   </div>
// </div>


//           {/* KEEP YOUR CURRENT */}
//           {/* DEADLINE CARD */}
//           <div style={styles.deadlineCard}>
//             <div style={styles.cardTop}>
//               <h3 style={styles.cardHeading}>Upcoming Deadlines</h3>
//             </div>
// <div style={styles.deadlineScroll}>
//             {deadlines.map((item: any, i: number) => {
//               const dueDate = item.due_date
//                 ? new Date(item.due_date)
//                 : null;

//               const today = new Date();

//               const diff = dueDate
//                 ? Math.ceil(
//                   (dueDate.getTime() - today.getTime()) /
//                   (1000 * 60 * 60 * 24)
//                 )
//                 : 0;

//               return (
//                 <div
//                   key={i}
//                   style={{
//                     ...styles.deadlineRow,
//                     ...(hoveredDeadlineIndex === i ? styles.deadlineRowHover : {}),
//                   }}
//                   onMouseEnter={() => setHoveredDeadlineIndex(i)}
//                   onMouseLeave={() => setHoveredDeadlineIndex(null)}
//                 >
//                   <div>
//                     <h4 style={styles.deadlineTitle}>
//                       {item.title}
//                     </h4>

//                     <p style={styles.deadlineSub}>
//                       {dueDate
//                         ? dueDate.toDateString()
//                         : "No due date"}
//                     </p>
//                   </div>

//                   <span style={styles.deadlineRight}>
//                     {diff} days left
//                   </span>
//                 </div>
//               );
//             })}
//             </div>


//           </div>
//         </div>
//       </div>





//     </div >
//   );
// };

// const DashboardCard = ({
//   title,
//   value,
//   icon,
//   color,
// }: any) => {
//   return (
//     <div style={styles.dashboardCard}>
//       <div
//         style={{
//           ...styles.iconBox,
//           background: `${color}15`,
//           color,
//         }}
//       >
//         {icon}
//       </div>

//       <div>
//         <p style={styles.cardLabel}>{title}</p>
//         <h2 style={styles.cardValue}>{value}</h2>
//       </div>
//     </div>
//   );
// };

// const QuickCard = ({
//   icon,
//   title,
//   subtitle,
// }: any) => {
//   return (
//     <div style={styles.quickCard}>
//       <div style={styles.quickIcon}>{icon}</div>

//       <div>
//         <h4 style={styles.quickTitle}>{title}</h4>
//         <p style={styles.quickSub}>{subtitle}</p>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// const styles: any = {
//   page: {
//     background: "#F7F8FC",
//     minHeight: "100vh",
//   },

//   container: {
//     display: "flex",
//     gap: "20px",
//     width: "100%",
//     alignItems: "flex-start",
//   },

//   topSection: {
//     display: "flex",
//     gap: "20px",
//     width: "100%",
//     alignItems: "flex-start",
//   },
//   leftTop: {
//     flex: 1,
//     minWidth: 0,
//   },
//   fullWidthSection: {
//     width: "100%",
//     marginTop: "0px",
//   },

//   right: {
//     width: "320px",
//     minWidth: "320px",
//     background: "#fff",
//     borderRadius: "20px",
//     padding: "24px",
//     height: "fit-content",
//     border: "1px solid #ECECEC",
//   },

//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "24px",
//   },

//   heading: {
//     margin: 0,
//     fontSize: "28px",
//     fontWeight: 700,
//     color: "#1E1B4B",
//   },

//   helloText: {
//     color: "#7C3AED",
//   },


//   userName: {
//     color: "#A855F7",
//   },

//   subheading: {
//     color: "#374151",
//     marginTop: "10px",
//     fontSize: "15px",
//     fontWeight: 700,
//     lineHeight: "26px",
//   },

//   createBtn: {
//     background:
//       "linear-gradient(135deg,#7C3AED,#5B5BD6)",
//     border: "none",
//     color: "#fff",
//     padding: "12px 22px",
//     borderRadius: "12px",
//     fontWeight: 600,
//     cursor: "pointer",
//   },

//   cardsGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(4,1fr)",
//     gap: "16px",
//     marginBottom: "24px",
//   },

//   dashboardCard: {
//     background: "#fff",
//     borderRadius: "18px",
//     padding: "20px",
//     display: "flex",
//     gap: "16px",
//     alignItems: "center",
//     border: "1px solid #ECECEC",
//   },

//   iconBox: {
//     width: "48px",
//     height: "48px",
//     borderRadius: "14px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   deadlineScroll: {
//   maxHeight: "240px",
//   overflowY: "auto",
//   paddingRight: "6px",
// },

//   cardLabel: {
//     margin: 0,
//     color: "#8E8EA9",
//     fontSize: "13px",
//   },

//   cardValue: {
//     margin: "6px 0 0",
//     fontSize: "28px",
//     color: "#18181B",
//   },

//   analyticsWrapper: {
//     display: "flex",
//     gap: "18px",
//     marginBottom: "10px",
//   },

//   analyticsCard: {
//     flex: 1,
//     background: "#fff",
//     borderRadius: "20px",
//     padding: "20px",
//     border: "1px solid #ECECEC",
//   },

//   recentTasks: {
//     width: "340px",
//     background: "#fff",
//     borderRadius: "20px",
//     padding: "20px",
//     border: "1px solid #ECECEC",
//   },

//   cardTop: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "20px",
//   },

//   cardHeading: {
//     margin: 0,
//     fontSize: "16px",
//     fontWeight: 700,
//     color: "#1E1B4B",
//   },

//   select: {
//     border: "1px solid #E5E7EB",
//     padding: "8px 12px",
//     borderRadius: "10px",
//     background: "#fff",
//   },

//   fakeChart: {
//     height: "260px",
//     position: "relative",
//     overflow: "hidden",
//   },

//   line1: {
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     borderBottom: "4px solid #22C55E",
//     borderRadius: "50%",
//     top: "-40px",
//   },

//   line2: {
//     position: "absolute",
//     width: "100%",
//     height: "80%",
//     borderBottom: "4px solid #3B82F6",
//     borderRadius: "50%",
//     top: "20px",
//   },

//   line3: {
//     position: "absolute",
//     width: "100%",
//     height: "60%",
//     borderBottom: "4px solid #8B5CF6",
//     borderRadius: "50%",
//     top: "80px",
//   },

//   legend: {
//     display: "flex",
//     gap: "18px",
//     marginTop: "14px",
//   },

//   legendItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     color: "#6B7280",
//     fontSize: "13px",
//   },

//   dot: {
//     width: "10px",
//     height: "10px",
//     borderRadius: "50%",
//   },

//   taskRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "8px",
//     padding: "12px",
//     borderRadius: "8px",
//     transition: "all 0.2s ease",
//     cursor: "pointer",
//   },

//   taskRowHover: {
//     backgroundColor: "#F3F4F6",
//     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
//     transform: "translateY(-2px)",
//   },

//   taskTitle: {
//     margin: 0,
//     fontSize: "14px",
//     color: "#191919",
//   },

//   taskSub: {
//     margin: "4px 0 0",
//     color: "#8B8B9E",
//     fontSize: "12px",
//   },

//   status: {
//     padding: "8px 12px",
//     borderRadius: "10px",
//     fontSize: "12px",
//     fontWeight: 600,
//   },

//   quickGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(4,1fr)",
//     gap: "16px",
//     marginBottom: "24px",
//   },

//   quickCard: {
//     background: "#fff",
//     borderRadius: "18px",
//     padding: "18px",
//     border: "1px solid #ECECEC",
//     display: "flex",
//     gap: "14px",
//     alignItems: "center",
//     cursor: "pointer",
//     transition: "0.2s",
//   },

//   quickIcon: {
//     width: "42px",
//     height: "42px",
//     borderRadius: "12px",
//     background: "#F3F0FF",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     color: "#7C3AED",
//   },

//   quickTitle: {
//     margin: 0,
//     fontSize: "14px",
//   },

//   quickSub: {
//     marginTop: "4px",
//     color: "#8C8CA1",
//     fontSize: "12px",
//   },
// quickAccessWrapper: {
//   marginTop: "0px",
//   marginBottom: "24px",
// },

//   quickAccessTop: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "14px",
//   },

//   quickAccessHeading: {
//     margin: 0,
//     fontSize: "16px",
//     fontWeight: 700,
//     color: "#1E1B4B",
//   },

//   viewTeamsText: {
//     color: "#7C3AED",
//     fontSize: "13px",
//     fontWeight: 600,
//     cursor: "pointer",
//   },

//   bottomSection: {
//     display: "grid",
//     gridTemplateColumns: "0.9fr 1.35fr 1fr",
//     gap: "18px",
//     width: "100%",
//     alignItems: "stretch",
//   },

//   progressCard: {
//     width: "100%",
//     background: "#fff",
//     borderRadius: "20px",
//     padding: "20px",
//     border: "1px solid #ECECEC",
//   },
//   progressWrapper: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: "20px",
//     marginTop: "20px",
//   },

//   donutContainer: {
//     position: "relative",
//     width: "180px",
//     height: "180px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   centerText: {
//     position: "absolute",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//   },

//   centerNumber: {
//     margin: 0,
//     fontSize: "30px",
//     fontWeight: 700,
//     color: "#111827",
//   },

//   centerLabel: {
//     marginTop: "4px",
//     fontSize: "12px",
//     color: "#9CA3AF",
//   },

//   progressLegendRight: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "18px",
//     flex: 1,
//   },


//   progressItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     fontSize: "13px",
//   },

// barCard: {
//   width: "100%",
//   height: "fit-content",
//   background: "#fff",
//   borderRadius: "24px",
//   padding: "22px",
//   border: "1px solid #ECECEC",
//   boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
// },

//   barWrapper: {
//     display: "flex",
//     alignItems: "flex-end",
//     justifyContent: "space-between",
//     marginTop: "30px",
//     height: "220px",
//   },

//   barGroup: {
//     display: "flex",
//     gap: "6px",
//     alignItems: "flex-end",
//   },

//   bar: {
//     width: "12px",
//     borderRadius: "8px",
//   },

//   deadlineCard: {
//     width: "100%",
//     background: "#fff",
//     borderRadius: "20px",
//     padding: "20px",
//     border: "1px solid #ECECEC",
//   },

//   deadlineRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginBottom: "8px",
//     padding: "12px",
//     borderRadius: "8px",
//     transition: "all 0.2s ease",
//     cursor: "pointer",
//   },

//   deadlineRowHover: {
//     backgroundColor: "#F3F4F6",
//     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
//     transform: "translateY(-2px)",
//   },

//   deadlineTitle: {
//     margin: 0,
//     fontSize: "14px",
//   },

//   deadlineSub: {
//     marginTop: "5px",
//     color: "#8C8CA1",
//     fontSize: "12px",
//   },

//   deadlineRight: {
//     color: "#6B7280",
//     fontSize: "12px",
//   },

//   rightTitle: {
//     marginTop: 0,
//     color: "#1E1B4B",
//   },

//   formGroup: {
//     marginBottom: "18px",
//   },

//   label: {
//     display: "block",
//     marginBottom: "8px",
//     fontSize: "13px",
//     color: "#5B5B70",
//     fontWeight: 600,
//   },

//   input: {
//     width: "100%",
//     padding: "12px",
//     borderRadius: "12px",
//     border: "1px solid #E5E7EB",
//     outline: "none",
//     background: "#FAFAFA",
//   },

//   textarea: {
//     width: "100%",
//     height: "90px",
//     padding: "12px",
//     borderRadius: "12px",
//     border: "1px solid #E5E7EB",
//     resize: "none",
//     background: "#FAFAFA",
//   },

//   uploadBox: {
//     border: "2px dashed #D8CCFF",
//     borderRadius: "18px",
//     padding: "40px 20px",
//     textAlign: "center" as const,
//     background: "#FAF8FF",
//     marginTop: "20px",
//   },

//   uploadIcon: {
//     fontSize: "32px",
//     marginBottom: "8px",
//     color: "#7C3AED",
//   },

//   uploadText: {
//     margin: 0,
//     fontWeight: 700,
//     color: "#7C3AED",
//   },

//   uploadSub: {
//     color: "#8C8CA1",
//     fontSize: "12px",
//   },

//   submitBtn: {
//     marginTop: "24px",
//     width: "100%",
//     background:
//       "linear-gradient(135deg,#7C3AED,#5B5BD6)",
//     border: "none",
//     color: "#fff",
//     padding: "14px",
//     borderRadius: "14px",
//     fontWeight: 700,
//     cursor: "pointer",
//   },
//   monthBtn: {
//     width: "32px",
//     height: "32px",
//     borderRadius: "8px",
//     border: "1px solid #E5E7EB",
//     background: "#fff",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "16px",
//   },

//   monthText: {
//     fontSize: "14px",
//     fontWeight: 600,
//     color: "#1E1B4B",
//     minWidth: "90px",
//     textAlign: "center" as const,
//   },
//   searchContainer: {
//     background: "#f1f5f9",
//     borderRadius: "12px",
//     border: "1px solid #e2e8f0",
//     padding: "10px 14px",
//   } as const,

//   searchInput: {
//     width: "100%",
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     color: "#0f172a",
//     fontSize: "14px",
//   } as const,

//   dropdownResults: {
//     position: "absolute" as const,
//     top: "55px",
//     left: 0,
//     width: "100%",
//     background: "#fff",
//     borderRadius: "10px",
//     border: "1px solid #e5e7eb",
//     boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
//     zIndex: 1000,
//     maxHeight: "300px",
//     overflowY: "auto" as const,
//   } as const,

//   dropdownLabel: {
//     padding: "10px 12px",
//     fontWeight: 600,
//     fontSize: "12px",
//     color: "#64748b",
//     textTransform: "uppercase" as const,
//   } as const,

//   dropdownItem: {
//     padding: "8px 12px",
//     cursor: "pointer",
//     color: "#0f172a",
//     fontSize: "14px",
//     transition: "background 0.2s",
//   } as const,

//   loading: {
//     height: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     fontSize: "22px",
//   },
// };