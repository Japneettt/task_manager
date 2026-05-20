import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import {
    getWorkload,
    getProductivity,
    api
} from "../../services/api";

import {
    BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";

const ActivityPage = () => {
    const [workload, setWorkload] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [tasks, setTasks] = useState<any>({ pending: [], completed: [] });
    const [personalPerformance, setPersonalPerformance] = useState<number>(0);
    const [teamPerformance, setTeamPerformance] = useState<number>(0);

    // ✅ FETCH EVERYTHING
    const fetchData = async () => {
        try {
            const workloadRes = await getWorkload();
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
        const userData = localStorage.getItem("user");

        let user: any = null;

        // ✅ TRY PARSE
        try {
            user = JSON.parse(userData as string);
        } catch {
            // ✅ FALLBACK: maybe it's stored as plain string/object
            console.log("⚠️ Fixing corrupted user in localStorage");

            user = {
                id: localStorage.getItem("user_id") || null
            };

            // ✅ force store correct format for future
            if (user.id) {
                localStorage.setItem("user", JSON.stringify(user));
            }
        }

        // ✅ FINAL CHECK
        if (!user?.id) {
            console.log("❌ User id missing");
            return;
        }

        // const userData = localStorage.getItem("user");

        // if (!userData || userData === "undefined") {
        //     console.log("❌ Invalid user JSON");
        //     return;
        // }

        // let user;

        // try {
        //     user = JSON.parse(userData);

        //     // ✅ EXTRA CHECK (IMPORTANT)
        //     if (!user || typeof user !== "object") {
        //         throw new Error("Invalid object");
        //     }

        // } catch (err) {
        //     console.log("❌ Invalid user JSON");
        //     return;
        // }

        // if (!user?.id) {
        //     console.log("❌ User id missing");
        //     return;
        // }



        const ws = new WebSocket(`ws://localhost:8000/ws/activity/${user.id}`);

        ws.onopen = () => {
            console.log("✅ WS connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log("🔥 LIVE UPDATE:", data);

            if (data.type === "activity") {
                fetchData();
            }
        };

        ws.onclose = () => {
            console.log("❌ WS closed");
        };

        return () => ws.close();
    }, []);

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

                {/* ✅ DUE TASKS */}
                <h3 style={{ marginTop: "30px" }}>Due Tasks</h3>
                {tasks.pending?.map((t: any) => (
                    <TaskCard key={t.id} task={t} />
                ))}

                {/* ✅ COMPLETED TASKS */}
                <h3 style={{ marginTop: "30px" }}>Completed Tasks</h3>
                {tasks.completed?.map((t: any) => (
                    <TaskCard key={t.id} task={t} completed />
                ))}

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

                {/* ✅ TEAM BOARD PERFORMANCE */}
                <h3 style={{ marginTop: "30px" }}>Team Board Performance</h3>
                <BarChart
                    width={600}
                    height={300}
                    data={[{ name: "Team", value: teamPerformance }]}
                >
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => typeof value === "number" ? value.toFixed(1) : value} />
                    <Tooltip formatter={(value) => typeof value === "number" ? value.toFixed(2) : value} />
                    <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>

                {/* ✅ TEAM WORKLOAD */}
                <h3 style={{ marginTop: "30px" }}>Team Workload</h3>
                {workload.map((team) => (
                    <div key={team.team_id} style={{ background: "#fff", padding: "15px", borderRadius: "10px", marginTop: "10px" }}>
                        <h4>{team.team_name}</h4>
                        <ul style={{ paddingLeft: "20px" }}>
                            {team.members?.map((member: any) => (
                                <li key={member.user_id}>{member.name}</li>
                            ))}
                        </ul>
                    </div>
                ))}
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
const Card = ({ label, value }: any) => (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
        <div>{label}</div>
        <div>{value}</div>
    </div>
);

export default ActivityPage;