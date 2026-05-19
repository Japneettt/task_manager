import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts";

import {
  getAdminStats,
  getAdminUsers,
  getAdminTeams,
  getAdminActivity,
  getAdminAnalytics,
} from "../../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

  // ✅ ✅ ✅ FIXED ADMIN PROTECTION (SAFE VERSION)
  useEffect(() => {
    const userString = localStorage.getItem("user");

    if (!userString || userString === "undefined") {
      navigate("/");
      return;
    }

    let user: any = null;

    try {
      user = JSON.parse(userString);
    } catch (error) {
      console.error("Invalid user JSON:", error);
      navigate("/");
      return;
    }

    if (!user?.is_admin) {
      navigate("/");
      return;
    }

    fetchAll();
  }, [navigate]);

  // ✅ FETCH DATA
  const fetchAll = async () => {
    try {
      setLoading(true);

      const [s, u, t, a, an] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminTeams(),
        getAdminActivity(),
        getAdminAnalytics(),
      ]);

      setStats(s.data);
      setUsers(u.data);
      setTeams(t.data);
      setActivity(a.data);
      setAnalytics(an.data);

    } catch (err) {
      console.error("ADMIN ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOADING STATE
  if (loading) {
    return <div style={{ padding: 20 }}>Loading Admin Dashboard...</div>;
  }

  // ✅ PIE DATA FIX
  const pieData = analytics.card_status_distribution
    ? Object.entries(analytics.card_status_distribution).map(
        ([key, value]: any) => ({
          name: key,
          value,
        })
      )
    : [];

  const COLORS = ["#4f46e5", "#f59e0b", "#10b981"];

  return (
    <div style={{ padding: 20, background: "#f6f8fb", minHeight: "100vh" }}>
      <h2>Admin Dashboard</h2>

      {/* ✅ STATS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {Object.entries(stats).map(([k, v]: any) => (
          <div key={k} style={card}>
            <div style={{ color: "#6b7280" }}>
              {k.replace(/_/g, " ")}
            </div>
            <h2>{v}</h2>
          </div>
        ))}
      </div>

      {/* ✅ ANALYTICS */}
      <div style={{ display: "flex", gap: 40, marginTop: 40 }}>

        {/* ✅ PIE CHART */}
        <div style={card}>
          <h4>Status Distribution</h4>
          <PieChart width={250} height={250}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
            >
              {pieData.map((entry: any, index: number) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* ✅ BAR CHART */}
        <div style={card}>
          <h4>Team Productivity</h4>
          <BarChart
            width={320}
            height={250}
            data={analytics.team_productivity || []}
          >
            <XAxis dataKey="team_name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed_count" fill="#4f46e5" />
          </BarChart>
        </div>

      </div>

      {/* ✅ USERS */}
      <h3 style={{ marginTop: 40 }}>Users</h3>
      <table style={table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? "Active" : "Disabled"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ TEAMS */}
      <h3 style={{ marginTop: 40 }}>Teams</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
        {teams.map((t) => (
          <div key={t.id} style={teamCard}>
            <b>{t.name}</b>
            <div>{t.member_count} members</div>
          </div>
        ))}
      </div>

      {/* ✅ ACTIVITY */}
      <h3 style={{ marginTop: 40 }}>Activity</h3>
      <div>
        {activity.length === 0 ? (
          <p>No activity found</p>
        ) : (
          activity.map((a) => (
            <div key={a.id} style={activityCard}>
              {a.message}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

/* ✅ STYLES */
const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  minWidth: 180,
};

const table = {
  width: "100%",
  background: "#fff",
  borderRadius: 10,
  marginTop: 10,
  padding: 10,
};

const teamCard = {
  background: "#fff",
  padding: 15,
  borderRadius: 8,
};

const activityCard = {
  background: "#fff",
  padding: 10,
  marginTop: 5,
  borderLeft: "4px solid #4f46e5",
};

export default AdminDashboard;
