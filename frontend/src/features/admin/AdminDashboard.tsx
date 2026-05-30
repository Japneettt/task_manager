import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Overview {
  total_users?: number;
  total_teams?: number;
  total_boards?: number;
  total_tasks?: number;
  active_users_7d?: number;
  completed_tasks_pct?: number;
}

interface TopUser { id: string; name: string; completed_tasks: number }
interface TopTeam { id: string; name: string; boards_count: number; completed_tasks: number }
interface TrendPoint { date: string; completed: number }
interface HeatmapCell { day: number; hour: number; count: number }
interface TaskRow { id: string; title: string; assigned_user?: { id: string; name: string }; team?: { id: string; name: string }; board?: { id: string; title: string }; due_date?: string; status?: string }

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
};

const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topTeams, setTopTeams] = useState<TopTeam[]>([]);
  const [allTeams, setAllTeams] = useState<TopTeam[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [loadingAllTeams, setLoadingAllTeams] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ov, tu, tt, tr, hm, tsk, at] = await Promise.all([
          api.get("/admin/analytics/overview"),
          api.get("/admin/analytics/top-users"),
          api.get("/admin/analytics/top-teams"),
          api.get("/admin/analytics/tasks-trend"),
          api.get("/admin/analytics/activity-heatmap"),
          api.get("/admin/tasks"),
          api.get("/admin/analytics/all-teams"),
        ]);

        setOverview(ov.data || null);
        setTopUsers(tu.data || []);
        setTopTeams(tt.data || []);
        setTrend(tr.data || []);
        setHeatmap(hm.data || []);
        setTasks(tsk.data || []);
        setAllTeams(at.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleViewAllTeams = async () => {
    setShowAllTeams(true);
    setLoadingAllTeams(true);
    try {
      const res = await api.get("/admin/analytics/all-teams");
      setAllTeams(res.data || []);
    } catch (err) {
      console.error(err);
      setAllTeams([]);
    } finally {
      setLoadingAllTeams(false);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/admin/tasks", {
          params: { status: statusFilter, team_id: teamFilter }
        });
        setTasks(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, [statusFilter, teamFilter]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (search) {
          const s = search.toLowerCase();
          if (!t.title.toLowerCase().includes(s) && !(t.assigned_user?.name || "").toLowerCase().includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
  }, [tasks, search]);

  const [page, setPage] = useState(1);
  const perPage = 8;
  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / perPage));
  const pageTasks = filteredTasks.slice((page - 1) * perPage, page * perPage);

  const statusBadge = (status?: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      "To Do": { bg: "#e6e9ef", text: "#374151" },
      "In Progress": { bg: "#e6f0ff", text: "#1e3a8a" },
      Done: { bg: "#dcfce7", text: "#056e36" },
    };
    const s = status || "To Do";
    const c = map[s] || { bg: "#f3f4f6", text: "#111827" };
    return (
      <span style={{ background: c.bg, color: c.text, padding: "6px 10px", borderRadius: 999, fontSize: 12 }}>
        {s}
      </span>
    );
  };

  const heatmapMatrix = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    heatmap.forEach((cell) => {
      const d = Math.max(0, Math.min(6, cell.day));
      const h = Math.max(0, Math.min(23, cell.hour));
      matrix[d][h] = cell.count;
    });
    return matrix;
  }, [heatmap]);

  const maxHeat = Math.max(...heatmap.map((c) => c.count), 1);

  // sort by completed tasks desc and show only top 3 users
  const sortedTopUsers = useMemo(
    () => [...topUsers].sort((a, b) => (b.completed_tasks || 0) - (a.completed_tasks || 0)),
    [topUsers]
  );
  const visibleTopUsers = sortedTopUsers.slice(0, 3);
  // ensure UI always shows 3 rows: fill with placeholders if fewer than 3 users returned
  const displayedTopUsers = useMemo(() => {
    const need = Math.max(0, 3 - visibleTopUsers.length);
    if (need === 0) return visibleTopUsers;
    const placeholders = Array.from({ length: need }).map((_, i) => ({ id: `placeholder-${i}`, name: "—", completed_tasks: 0 }));
    return [...visibleTopUsers, ...placeholders];
  }, [visibleTopUsers]);

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 24, color: "#b91c1c" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24, background: "#f6f8fb", minHeight: "100vh" }}>
      <h2 style={{ fontSize: 26, marginBottom: 12, fontWeight: 700 }}>Admin Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Total Users</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{overview?.total_users ?? "—"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Total Teams</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{overview?.total_teams ?? "—"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Total Boards</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{overview?.total_boards ?? "—"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Total Tasks</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{overview?.total_tasks ?? "—"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Active Users (7d)</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{overview?.active_users_7d ?? "—"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Completed Tasks %</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{overview?.completed_tasks_pct ? `${overview.completed_tasks_pct}%` : "—"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ ...cardStyle, marginBottom: 16 }} className="w-full px-4 py-4">
            <h3 style={{ margin: 0, fontSize: 16, marginBottom: 12 }}>Top Users</h3>
            {topUsers.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No data</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {displayedTopUsers.map((u) => {
                  const total = Math.max(1, visibleTopUsers.reduce((s, x) => s + (x.completed_tasks || 0), 0));
                  const pct = total > 0 ? Math.round(((u.completed_tasks || 0) / total) * 100) : 0;
                  return (
                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: '0 0 36%', minWidth: 0 }}>
                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{u.completed_tasks} completed</div>
                      </div>
                      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                        <div style={{ height: 8, background: "#e6e9ef", borderRadius: 8, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#2563eb" }} />
                        </div>
                      </div>
                      <div style={{ width: 48, textAlign: 'right', fontSize: 12, color: '#6b7280' }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...cardStyle }} className="w-full px-4 py-4">
            <h3 style={{ margin: 0, fontSize: 16, marginBottom: 12 }}>Top Teams</h3>
            {topTeams.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No data</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {topTeams.slice(0, 5).map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{t.boards_count} boards • {t.completed_tasks} completed</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ ...cardStyle, height: 320, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, marginBottom: 12 }}>Task Completion Trend</h3>
            {trend.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={3} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ ...cardStyle, padding: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, marginBottom: 8 }}>Activity Heatmap</h3>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Hour of day ✓ Day of week</div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px repeat(24, 28px)", gap: 6, alignItems: "center" }}>
                <div />
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} style={{ fontSize: 10, textAlign: "center", color: "#6b7280" }}>{h}</div>
                ))}

                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, di) => (
                  <React.Fragment key={d}>
                    <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{d}</div>
                    {Array.from({ length: 24 }).map((_, h) => {
                      const val = heatmapMatrix[di][h] || 0;
                      const bg = `rgba(37,99,235,${Math.max(0.06, val / Math.max(1, maxHeat))})`;
                      return (
                        <div key={`${di}-${h}`} style={{ width: 28, height: 18, borderRadius: 4, background: bg }} title={`${d} ${h}:00 — ${val}`} />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Tasks</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="🔍 Search tasks or user (real-time)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #e6e9ef", minWidth: 200 }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #e6e9ef" }}
            >
              <option value="all">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #e6e9ef", maxHeight: 200 }}
            >
              <option value="all">All Teams ({allTeams.length})</option>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={handleViewAllTeams}
              style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
            >
              👥 View All Teams
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ textAlign: "left", color: "#6b7280", fontSize: 12 }}>
              <tr>
                <th style={{ padding: "8px 12px" }}>Task</th>
                <th style={{ padding: "8px 12px" }}>Assigned</th>
                <th style={{ padding: "8px 12px" }}>Team</th>
                <th style={{ padding: "8px 12px" }}>Board</th>
                <th style={{ padding: "8px 12px" }}>Due Date</th>
                <th style={{ padding: "8px 12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageTasks.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #eef2ff" }}>
                  <td style={{ padding: "12px" }}>{r.title}</td>
                  <td style={{ padding: "12px" }}>{r.assigned_user?.name ?? "—"}</td>
                  <td style={{ padding: "12px" }}>{r.team?.name ?? "—"}</td>
                  <td style={{ padding: "12px" }}>{r.board?.title ?? "—"}</td>
                  <td style={{ padding: "12px" }}>{r.due_date ? r.due_date.slice(0,10) : "—"}</td>
                  <td style={{ padding: "12px" }}>{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <div style={{ color: "#6b7280" }}>{filteredTasks.length} results</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: 8, borderRadius: 8, border: "1px solid #e6e9ef", background: "#fff" }}>Prev</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e9ef" }}>{page} / {pageCount}</div>
            <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount} style={{ padding: 8, borderRadius: 8, border: "1px solid #e6e9ef", background: "#fff" }}>Next</button>
          </div>
        </div>
      </div>

      {/* View All Teams Modal */}
      {showAllTeams && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
        }}>
          <div style={{ ...cardStyle, width: 600, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>All Teams ({allTeams.length})</h3>
              <button onClick={() => setShowAllTeams(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", padding: "4px 8px", lineHeight: "1" }}>✕</button>
            </div>
            {loadingAllTeams ? (
              <div style={{ color: "#6b7280" }}>Loading teams...</div>
            ) : allTeams.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No teams found</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {allTeams.map((t) => (
                  <div key={t.id} style={{ padding: 12, background: "#f6f8fb", borderRadius: 8, border: "1px solid #e6e9ef" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {t.boards_count} board{t.boards_count !== 1 ? 's' : ''} • {t.completed_tasks} completed task{t.completed_tasks !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;