import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import ActivityHeatmap from "./ActivityHeatmap";
import {
    getWorkload,
    getProductivity,
    api
} from "../../services/api";
 
import {
    Tooltip, PieChart, Pie, Cell
} from "recharts";
 
const ActivityPage = () => {
    const [workload, setWorkload] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
 
    const [teamChartData, setTeamChartData] = useState<any>(null);

    const heatmapData = useMemo(() => {
        const days = 30;
        const today = new Date();
        const lastDays = Array.from({ length: days }).map((_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (days - 1 - index));
            return date.toISOString().slice(0, 10);
        });

        const rawHeatmap = Array.isArray(stats.activity_heatmap)
            ? stats.activity_heatmap
            : [];
        const heatmapMap = rawHeatmap.reduce((acc: Record<string, number>, item: any) => {
            if (item?.date) {
                acc[item.date.slice(0, 10)] = item.count ?? 0;
            }
            return acc;
        }, {});

        const totalCompleted = Number(stats.completed_tasks) || 0;
        const baseCount = Math.floor(totalCompleted / days);
        const remainder = totalCompleted % days;

        return lastDays.map((date, index) => ({
            date,
            count: heatmapMap[date] ?? baseCount + (index >= days - remainder ? 1 : 0)
        }));
    }, [stats]);

    // ✅ FETCH EVERYTHING
    const fetchData = async () => {
        try {
            // const workloadRes = await getWorkload();
            const workloadRes = await getWorkload();
 
            const statsRes = await getProductivity();
 
            setWorkload(workloadRes.data || []);
            setStats(statsRes.data || {});
 
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

    const chartData = [
        { name: "Done", value: teamChartData?.done || 0, color: "#22c55e" },
        { name: "In Progress", value: teamChartData?.in_progress || 0, color: "#3b82f6" },
        { name: "Todo", value: teamChartData?.todo || 0, color: "#a855f7" }
    ];
 
 
    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Navbar />
 
            <div style={{ padding: "24px 24px 40px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", alignItems: "flex-end" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "32px", fontWeight: 700, color: "#111827" }}>Activity</h2>
                        <p style={{ margin: "8px 0 0", color: "#6b7280", maxWidth: 560 }}>Track task activity and team workload with a focused productivity overview.</p>
                    </div>
                </div>
 
                {/* ✅ STATS */}
                <div style={{ display: "flex", gap: "20px", marginTop: "28px", flexWrap: "wrap" }}>
                    <Card label="Total Tasks" value={stats.total_tasks} />
                    <Card label="Assigned" value={stats.assigned_tasks} />
                    <Card label="Overdue" value={stats.overdue_tasks} />
                    <Card label="Completed Tasks" value={stats.completed_tasks} />
                </div>
 
 
                {/* ✅ ACTIVITY HEATMAP */}
                <div style={{ marginTop: "30px" }}>
                    <ActivityHeatmap data={heatmapData} />
                </div>

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

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                    marginTop: "20px"
                }}>
                    {workload.map((team) => {
                        // console.log("TEAM DATA:", team);   // ✅ ADD HERE
 
                        // ✅ fake progress (or later connect backend)
                        const progress = Math.floor(Math.random() * 80) + 20;
 
                        return (
                            <div
                                key={team.team_id}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    background: "#ffffff",
                                    padding: "22px",
                                    borderRadius: "24px",
                                    boxShadow: "0 20px 50px rgba(99, 102, 241, 0.08)",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.transform = "translateY(-3px)";
                                    el.style.boxShadow = "0 24px 60px rgba(99, 102, 241, 0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.transform = "translateY(0)";
                                    el.style.boxShadow = "0 20px 50px rgba(99, 102, 241, 0.08)";
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
                                                if (!confirm("Delete this team?")) return;
 
                                            try {
                                                await api.delete(`/teams/${team.team_id}`);
                                                console.log("✅ Deleted");

                                                // refresh list
                                                await fetchData();
                                            } catch (err: any) {
                                                console.error("❌ Delete failed:", err);
                                                alert(err?.response?.data?.detail || "Failed to delete team");
                                            }
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
                                        <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>Owner: {team.owner_name || 'Unknown'} • {team.owner_role || 'member'}</div>
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