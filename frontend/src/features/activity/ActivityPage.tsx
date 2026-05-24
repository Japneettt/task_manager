import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import {
    getWorkload,
    getProductivity,
    api
} from "../../services/api";
 
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts";
 
const ActivityPage = () => {
    const [workload, setWorkload] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [tasks, setTasks] = useState<any>({ pending: [], completed: [] });
    const [personalPerformance, setPersonalPerformance] = useState<number>(0);
    const [teamPerformance, setTeamPerformance] = useState<number>(0);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [showArchivedTeamBoards, setShowArchivedTeamBoards] = useState(false);
 
    const [teamChartData, setTeamChartData] = useState<any>(null);
    // ✅ FETCH EVERYTHING
    const fetchData = async () => {
        try {
            // const workloadRes = await getWorkload();
            const workloadRes = showArchivedTeamBoards
                ? await api.get("/teamss/archived")
                : await getWorkload();
 
            const statsRes = await getProductivity();
 
            const tasksRes = { data: { pending: [], completed: [] } };
            const chartRes = await api.get("/analytics/boards");
 
            setWorkload(workloadRes.data || []);
            setStats(statsRes.data || {});
            setTasks(tasksRes.data || {});
            setPersonalPerformance(chartRes.data?.personal?.performance ?? 0);
            setTeamPerformance(chartRes.data?.team?.performance ?? 0);
 
        } catch (err) {
            console.error("ERROR:", err);
        }
    };
 
    // ✅ AUTO REFRESH (REAL-TIME FEEL)
    useEffect(() => {
        fetchData();
 
        const interval = setInterval(() => {
            fetchData();   // ✅ auto refresh every 5s
        }, 5000);
 
        return () => clearInterval(interval);
    }, []);
    const handleTeamClick = async (team: any) => {
        setSelectedTeam(team);
 
        try {
            const res = await api.get(`/analytics/team/${team.team_id}`);
 
            console.log("✅ Team analytics:", res.data);  // DEBUG
 
            setTeamChartData(res.data);
        } catch (err) {
            console.error("❌ Analytics error:", err);
 
            setTeamChartData({
                done: 0,
                in_progress: 0,
                todo: 0
            });
        }
    };
    // useEffect(() => {
    //     fetchData();
    //     const userData = localStorage.getItem("user");
 
    //     let user: any = null;
 
    //     // ✅ TRY PARSE
    //     try {
    //         user = JSON.parse(userData as string);
    //     } catch {
    //         // ✅ FALLBACK: maybe it's stored as plain string/object
    //         console.log("⚠️ Fixing corrupted user in localStorage");
 
    //         user = {
    //             id: localStorage.getItem("user_id") || null
    //         };
 
    //         // ✅ force store correct format for future
    //         if (user.id) {
    //             localStorage.setItem("user", JSON.stringify(user));
    //         }
    //     }
 
    //     // ✅ FINAL CHECK
    //     if (!user?.id) {
    //         console.log("❌ User id missing");
    //         return;
    //     }
    const chartData = [
        { name: "Done", value: teamChartData?.done || 0, color: "#22c55e" },
        { name: "In Progress", value: teamChartData?.in_progress || 0, color: "#3b82f6" },
        { name: "Todo", value: teamChartData?.todo || 0, color: "#a855f7" }
    ];
 
 
    return (
        <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
            <Navbar />
 
            <div style={{ padding: "20px" }}>
                <h2>Activity</h2>
 
                {/* ✅ STATS */}
                <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
                    <Card label="Total Tasks" value={stats.total_tasks} />
                    <Card label="Assigned" value={stats.assigned_tasks} />
                    <Card label="Overdue" value={stats.overdue_tasks} />
                    <Card label="Completed Tasks" value={stats.completed_tasks} />
                </div>
 
 
                {/* ✅ PERSONAL BOARD PERFORMANCE */}
                <h3 style={{ marginTop: "30px" }}>Personal Board Performance</h3>
                <BarChart
                    width={600}
                    height={300}
                    data={[{ name: "Personal", value: personalPerformance }]}
                >
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => typeof value === "number" ? value.toFixed(1) : value} />
                    <Tooltip formatter={(value) => typeof value === "number" ? value.toFixed(2) : value} />
                    <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
 
 
                {/* ✅ TEAM SPECIFIC GRAPH (ADD HERE) */}
                {selectedTeam && teamChartData && (
                    <div style={{
                        marginTop: "30px",
                        background: "#fff",
                        padding: "20px",
                        borderRadius: "12px"
                    }}>
 
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <h3 style={{ margin: 0 }}>
                                {selectedTeam.team_name} Performance
                            </h3>
 
                            {/* ✅ CLOSE BUTTON */}
                            <span
                                onClick={() => {
                                    setSelectedTeam(null);
                                    setTeamChartData(null);
                                }}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#9ca3af",
                                    transition: "0.2s"
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                            >
                                ✕
                            </span>
                        </div>
 
                        <div style={{
                            display: "flex",
                            gap: "40px",
                            alignItems: "center",
                            marginTop: "20px"
                        }}>
 
                            {/* LEFT */}
                            <div>
                                <h4>Status Summary</h4>
 
                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
 
                                    {/* ✅ DONUT CHART */}
                                    <PieChart width={180} height={180}>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
 
                                    {/* ✅ LEGEND */}
                                    <div style={{ fontSize: "14px" }}>
                                        {chartData.map((item, i) => (
                                            <div key={i} style={{ marginBottom: "6px" }}>
                                                <span style={{
                                                    display: "inline-block",
                                                    width: "10px",
                                                    height: "10px",
                                                    borderRadius: "50%",
                                                    background: item.color,
                                                    marginRight: "6px"
                                                }} />
                                                {item.name}: {item.value}
                                            </div>
                                        ))}
                                    </div>
 
                                </div>
 
 
                            </div>
 
                            {/* RIGHT */}
                            <div style={{ flex: 1 }}>
                                <h4>Team Workload</h4>
 
                                {selectedTeam.members?.map((m: any, i: number) => {
 
                                    const colors = ["#3b82f6", "#f59e0b", "#22c55e", "#a855f7"];
 
                                    const val = Math.floor(Math.random() * 100);
 
                                    return (
                                        <div key={i} style={{ marginBottom: "12px" }}>
 
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontSize: "12px"
                                            }}>
                                                <span>{m.name}</span>
                                                <span>{val}%</span>
                                            </div>
 
                                            <div style={{
                                                height: "6px",
                                                background: "#eee",
                                                borderRadius: "10px"
                                            }}>
                                                <div style={{
                                                    width: `${val}%`,
                                                    height: "100%",
                                                    background: colors[i % colors.length],
                                                    borderRadius: "10px"
                                                }} />
                                            </div>
 
                                        </div>
                                    );
                                })}
                            </div>
 
                        </div>
                    </div>
                )}
 
                <h3 style={{ marginTop: "30px" }}>Team Workload</h3>
                <button
                    onClick={() => setShowArchivedTeamBoards(!showArchivedTeamBoards)}
                    style={{
                        marginBottom: "15px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#6366f1",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    {showArchivedTeamBoards ? "Back to Active Teams" : "View Archived Teams"}
                </button>
 
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                    marginTop: "20px"
                }}>
                    {workload.map((team, index) => {
                        // console.log("TEAM DATA:", team);   // ✅ ADD HERE
 
                        // ✅ fake progress (or later connect backend)
                        const progress = Math.floor(Math.random() * 80) + 20;
 
                        return (
                            <div
                                key={team.team_id}
                                // onClick={() => handleTeamClick(team)}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    background: "#fff",
                                    padding: "18px",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                                }}
                            >
 
                                {/* ✅ ACTION ICONS */}
                                <div style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    display: "flex",
                                    gap: "10px"
                                }}>
 
                                    {/* 🗑 DELETE */}
                                    <span
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!confirm("Delete this board?")) return;
 
                                            // await api.delete(`/boards/${team.id}`);
 
                                            // const boardId = team.board_id;
                                            // if (!boardId) return;
 
                                            // await api.delete(`/teams/${team.team_id}`);
                                            try {
                                                await api.delete(`/teams/${team.team_id}`);
                                                console.log("✅ Deleted");
 
                                                setWorkload(prev => prev.filter(t => t.team_id !== team.team_id)); // ✅ instant UI update
                                            } catch (err) {
                                                console.error("❌ Delete failed:", err);
                                            }
                                            fetchData();
                                        }}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            background: "rgba(0,0,0,0.05)",
                                            padding: "4px",
                                            borderRadius: "6px"
                                        }}
                                    >
                                        🗑️
                                    </span>
 
                                    {/* 📦 ARCHIVE */}
                                    <span
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            // const boardId = team.board_id;
                                            // if (!boardId) return;
 
                                            // await api.patch(`/boards/${boardId}/archive`);
                                            // fetchData();
 
                                            await api.patch(`/teams/${team.team_id}/archive`);
                                            // await api.patch(`/boards/${team.boards[0].id}/archive`)
                                            // fetchData();
                                        }}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            background: "rgba(0,0,0,0.05)",
                                            padding: "4px",
                                            borderRadius: "6px"
                                        }}
                                    >
                                        {showArchivedTeamBoards ? "♻️" : "📦"}
                                    </span>
 
                                </div>
 
 
 
                                {/* ✅ CLICKABLE CONTENT */}
                                <div onClick={() => handleTeamClick(team)}>
 
 
 
 
                                    {/* ✅ HEADER */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "8px",
                                            background: "#6366f1",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff",
                                            fontWeight: "bold"
                                        }}>
                                            {/* {team.team_name.charAt(0)} */}
                                            {team.team_name?.charAt(0) || "?"}
                                        </div>
                                        <h4 style={{ margin: 0 }}>{team.team_name || "unnamed team"}</h4>
 
                                        {/* <h4 style={{ margin: 0 }}>{team.team_name}</h4> */}
                                    </div>
 
                                    {/* ✅ MEMBERS AVATAR STYLE */}
                                    <div style={{
                                        display: "flex",
                                        marginTop: "10px"
                                    }}>
                                        {team.members?.slice(0, 4).map((member: any, i: number) => (
                                            <div
                                                key={member.user_id}
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "50%",
                                                    background: "#ddd",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    marginLeft: i === 0 ? 0 : "-8px",
                                                    border: "2px solid white",
                                                    fontSize: "12px"
                                                }}
                                            >
                                                {member.name[0]}
                                            </div>
                                        ))}
                                    </div>
 
                                    {/* ✅ DATE */}
                                    <div style={{
                                        marginTop: "10px",
                                        fontSize: "12px",
                                        color: "#6b7280"
                                    }}>
                                        • Aug 16 2025
                                    </div>
 
                                    {/* ✅ PROGRESS */}
                                    <div style={{ marginTop: "14px" }}>
                                        <div style={{ fontSize: "12px", marginBottom: "4px" }}>
                                            Project Progress
                                        </div>
 
                                        <div style={{
                                            height: "6px",
                                            background: "#eee",
                                            borderRadius: "10px",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: "100%",
                                                background: "linear-gradient(90deg,#7c3aed,#4f46e5)"
                                            }} />
                                        </div>
 
                                        <div style={{
                                            textAlign: "right",
                                            fontSize: "12px",
                                            marginTop: "4px",
                                            color: "#555"
                                        }}>
                                            {progress}%
                                        </div>
                                    </div>
                                </div>
 
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
 
// ✅ TASK CARD
const TaskCard = ({ task, completed }: any) => (
    <div
        style={{
            background: completed ? "#dcfce7" : "#fff",
            padding: "10px",
            borderRadius: "6px",
            marginTop: "5px"
        }}
    >
        <b>{task.title}</b>
        <div style={{ fontSize: "12px" }}>{task.due_date}</div>
    </div>
);
 
// ✅ CARD
const Card = ({ label, value }: any) => {
 
    const config: any = {
        "Total Tasks": { color: "#22c55e", icon: "✅", sub: "in the last 7 days" },
        "Assigned": { color: "#3b82f6", icon: "🖊️", sub: "recent updates" },
        "Overdue": { color: "#ef4444", icon: "⏰", sub: "need attention" },
        "Completed Tasks": { color: "#a855f7", icon: "➕", sub: "recently added" },
    };
 
    const item = config[label] || config["Total Tasks"];
 
    return (
        <div
            style={{
                background: "#fff",
                padding: "18px",
                borderRadius: "14px",
                minWidth: "220px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
            }}
        >
 
            {/* ✅ ICON */}
            <div
                style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: `${item.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px"
                }}
            >
                {item.icon}
            </div>
 
            {/* ✅ TEXT */}
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "16px" }}>
                    {value} {label.toLowerCase()}
                </div>
 
                <div style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "2px"
                }}>
                    {item.sub}
                </div>
            </div>
        </div>
    );
};
 
export default ActivityPage;