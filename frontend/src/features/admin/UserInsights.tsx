import { useEffect, useState } from "react";
import { api } from "../../services/api";

const UserInsights = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("all");

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [insights, setInsights] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("assigned");
    const [taskList, setTaskList] = useState<any[]>([]);

    // debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebounced(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    // fetch
    useEffect(() => {
        api.get("/admin/users", {
            params: { search: debounced, page, limit: 8, status: filter },
        }).then(res => {
            setUsers(res.data.data || []);
            setTotal(res.data.total || 0);
        });
    }, [debounced, page, filter]);

    const pages = Math.ceil(total / 8);

    const deleteUser = async (id: string) => {
        await api.delete(`/admin/users/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
    };


    const openModal = async (user: any) => {
        setSelectedUser(user);
        setShowModal(true);
        setInsights(null);
        setActiveTab("assigned");   // ✅ ADD THIS

        try {
            const res = await api.get(`/admin/users/${user.id}/insights`);
            setInsights(res.data);

            // ✅ LOAD DEFAULT TAB
            fetchUserData("assigned");

        } catch {
            setInsights({
                assigned: 0,
                completed: 0,
                overdue: 0,
                teams: 0,
                productivity: 0
            });
        }
    };
    const fetchUserData = async (type: string) => {
        try {
            const res = await api.get(`/admin/users/${selectedUser.id}/${type}`);
            setTaskList(res.data || []);
        } catch {
            setTaskList([]);
        }
    };

    const handleTabChange = (type: string) => {
        setActiveTab(type);
        fetchUserData(type);
    };


    return (
        <div className="page">

            {/* ✅ TITLE */}
            <h2 className="title">User Insights</h2>

            {/* ✅ ✅ KEEP YOUR CARDS */}
            <div className="statsGrid">

                <div className="statCard">
                    <p>Total Users</p>
                    <h2>{total}</h2>
                </div>

                <div className="statCard">
                    <p>Active Users</p>
                    <h2>{users.filter(u => u.is_active).length}</h2>
                </div>

                <div className="statCard">
                    <p>Admins</p>
                    <h2>{users.filter(u => u.is_admin).length}</h2>
                </div>

                <div className="statCard">
                    <p>Inactive</p>
                    <h2>{users.filter(u => !u.is_active).length}</h2>
                </div>

            </div>

            {/* ✅ SEARCH */}
            <div className="tableHeader">
                <input
                    className="search"
                    placeholder="Search name, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* ✅ TABLE */}
            <div className="gridTable">

                <div className="gridHeader">
                    <div>User</div>
                    <div>User Name</div>
                    <div>Status</div>
                    <div>Registered</div>
                    <div>Last Login</div>
                    <div>Actions</div>
                </div>

                {users.map((u) => {
                    const first = u.first_name || "User";
                    const last = u.last_name || "";
                    const initials = (first[0] + (last[0] || "")).toUpperCase();

                    return (
                        // <div
                        //     key={u.id}
                        //     className="gridRow"
                        //     onClick={() => openModal(u)}
                        // >
                        <div
                            key={u.id}
                            className="gridRow"
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal(u);
                            }}
                        >

                            {/* USER */}
                            <div className="userCell">
                                <div className="avatar">{initials}</div>
                                <div className="email">{u.email}</div>
                            </div>

                            {/* NAME */}
                            <div className="username">
                                {first} {last}
                            </div>

                            {/* STATUS */}
                            <div>
                                <span className={`badge ${u.is_active ? "green" : "gray"}`}>
                                    {u.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* REGISTERED */}
                            <div>
                                {u.created_at
                                    ? new Date(u.created_at).toLocaleDateString()
                                    : "-"}
                            </div>

                            {/* LAST LOGIN */}
                            <div>
                                {u.last_login
                                    ? new Date(u.last_login).toLocaleDateString()
                                    : "-"}
                            </div>

                            {/* ACTIONS */}
                            <div
                                className="actions"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="edit">✏️</span>
                                <span className="delete" onClick={() => deleteUser(u.id)}>🗑</span>
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* ✅ PAGINATION */}
            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                {[...Array(pages)].map((_, i) => (
                    <button
                        key={i}
                        className={page === i + 1 ? "activePage" : ""}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>

            {/* ✅ MODAL */}
            {showModal && (
                <div className="overlay" onClick={() => setShowModal(false)}>
                    <div className="modalCard" onClick={(e) => e.stopPropagation()}>

                        {!insights ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                {/* PROFILE */}
                                <div className="profileTop newProfile">

                                    <div className="profileLeft">
                                        <div className="avatar big">
                                            {`${selectedUser?.first_name?.[0] || ""}${selectedUser?.last_name?.[0] || ""}`.toUpperCase()}
                                        </div>

                                        <div className="userInfo">
                                            <h3>{selectedUser?.first_name} {selectedUser?.last_name}</h3>
                                            <p className="sub">{selectedUser?.email}</p>
                                        </div>
                                    </div>

                                    {/* ✅ CLOSE BUTTON */}
                                    <span className="closeBtn" onClick={() => setShowModal(false)}>✕</span>

                                </div>


                                <div className="mainRow">

                                    {/* ✅ LEFT GRAPH */}
                                    <div className="circleWrap advanced">

                                        <svg viewBox="0 0 200 200">
                                            <defs>
                                                <linearGradient id="grad1">
                                                    <stop offset="0%" stopColor="#6366f1" />
                                                    <stop offset="100%" stopColor="#22c55e" />
                                                </linearGradient>
                                            </defs>

                                            <circle cx="100" cy="100" r="80" className="bgArc" />

                                            <circle
                                                cx="100"
                                                cy="100"
                                                r="80"
                                                className="fgArc"
                                                style={{
                                                    strokeDasharray: 502,
                                                    strokeDashoffset:
                                                        502 - (502 * insights.productivity) / 100,
                                                }}
                                            />
                                        </svg>

                                        <div className="circleText bigText">
                                            {insights.productivity}%
                                        </div>

                                    </div>

                                    {/* ✅ RIGHT STATS */}
                                    <div className="statsBox newStats">

                                        {[
                                            { label: "Assigned", value: insights.assigned, key: "assigned" },
                                            { label: "Completed", value: insights.completed, key: "completed" },
                                            { label: "Overdue", value: insights.overdue, key: "overdue" },
                                            { label: "Teams", value: insights.teams, key: "teams" }
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className={`statCard2 ${activeTab === item.key ? "activeTab" : ""}`}
                                                onClick={() => handleTabChange(item.key)}
                                            >
                                                <h3>{item.value}</h3>
                                                <span>{item.label}</span>
                                            </div>
                                        ))}

                                    </div>

                                </div>

                                {/* ✅ DROPDOWN */}
                                <select
                                    className="dropdown"
                                    value={activeTab}
                                    onChange={(e) => handleTabChange(e.target.value)}
                                >
                                    <option value="assigned">Assigned Tasks</option>
                                    <option value="completed">Completed Tasks</option>
                                    <option value="overdue">Overdue Tasks</option>
                                    <option value="teams">Teams</option>
                                </select>

                                {/* ✅ DATA LIST */}
                                <div className="taskList">

                                    {taskList.length === 0 ? (
                                        <p>No data</p>
                                    ) : (
                                        taskList.map((item, i) => {
                                            let className = "";

                                            if (activeTab === "completed") className = "chip greenChip";
                                            else if (activeTab === "overdue") className = "chip redChip";
                                            else if (activeTab === "assigned") className = "chip blueChip";
                                            else if (activeTab === "teams") className = "chip pinkChip";

                                            return (
                                                <div key={i} className={className}>
                                                    {activeTab === "teams" ? item.name : item.title}
                                                </div>
                                            );
                                        })
                                    )}

                                </div>

                            </>
                        )}

                    </div>

                </div>
            )}


            {/* ✅ CSS */}
            <style>{`
.page { padding:20px; background:#f8fafc; }

/* CARDS */
.statsGrid {
  display:grid;
  grid-template-columns: repeat(4,1fr);
  gap:15px;
  margin-bottom:20px;
}

.statCard {
  background: linear-gradient(135deg,#cbd5f5,#bbf7d0);
  padding:20px;
  border-radius:12px;
}

.statCard h2 { margin:5px 0 }

/* header */
.tableHeader {
  display:flex;
  justify-content:space-between;
  margin-bottom:20px;
}

.search, .filter {
  padding:10px;
  border-radius:8px;
  border:1px solid #ddd;
}

/* table */
.gridTable {
  background:white;
  border-radius:12px;
  overflow:hidden;
}

.gridHeader, .gridRow {
  display:grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
  padding:14px;
  align-items:center;
}

.gridHeader {
  background:#f1f5f9;
  font-weight:600;
}

.gridRow {
  border-top:1px solid #eee;
  cursor:pointer;
  transition:0.2s;
}

.gridRow:hover {
  background:#f9fafb;
}

/* user */
.userCell {
  display:flex;
  align-items:center;
  gap:10px;
}

.avatar {
  width:36px;
  height:36px;
  border-radius:50%;
  background: linear-gradient(135deg,#6366f1,#22c55e);
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
}

/* text */
.username { font-weight:500 }
.email { font-size:13px; color:#64748b }

/* badge */
.badge {
  padding:4px 10px;
  border-radius:20px;
  font-size:12px;
}

.green { background:#dcfce7; color:#16a34a }
.gray { background:#e5e7eb; color:#6b7280 }

/* actions */
.actions span { margin-right:10px; cursor:pointer }
.delete { color:red }

/* modal */
.overlay {
  position:fixed; inset:0;
  background:rgba(0,0,0,0.5);
  display:flex; justify-content:center; align-items:center;
  z-index: 9999;
}

.modal {
  background:white;
  padding:20px;
  border-radius:16px;
  width:300px;
}

.avatar.big {
  width:70px; height:70px; margin:auto;
}

.profile { text-align:center }

.progress {
  height:6px;
  background:#eee;
  border-radius:10px;
  margin:10px 0;
}

.progress div {
  height:100%;
  background:#22c55e;
}

/* pagination */
.pagination {
  margin-top:20px;
  display:flex;
  gap:10px;
}

.activePage {
  background:#6366f1;
  color:white;
}
.modalCard {
  background:white;
  padding:25px;
  border-radius:20px;
  width:520px;
}

.mainRow {
  display:flex;
  gap:20px;
  margin-top:20px;
}

/* GRAPH */
.circleWrap.advanced {
  position:relative;
  width:180px;
  height:180px;
}

.bgArc {
  fill:none;
  stroke:#eee;
  stroke-width:12;
}

.fgArc {
  fill:none;
  stroke:url(#grad1);
  stroke-width:12;
  stroke-linecap:round;
  transform:rotate(-90deg);
  transform-origin:center;
}

.bigText {
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%, -50%);
  font-size:22px;
  font-weight:600;
}

/* STATS */
.newStats {
  display:grid;
  grid-template-columns: repeat(2,1fr);
  gap:10px;
  flex:1;
}

.statCard2 {
  background:#f1f5f9;
  padding:15px;
  border-radius:10px;
  text-align:center;
  cursor:pointer;
}

.activeTab {
  border:2px solid #6366f1;
}

/* DROPDOWN */
.dropdown {
  margin-top:20px;
  padding:10px;
  border-radius:8px;
  width:100%;
}

/* LIST */
.taskList {
  margin-top:15px;
  max-height:150px;
  overflow-y:auto;
}

.taskItem {
  padding:10px;
  border-bottom:1px solid #eee;
}
/* PROFILE HEADER */
.newProfile {
  display:flex;
  justify-content:space-between;
  align-items:center;
}

/* LEFT SIDE */
.profileLeft {
  display:flex;
  align-items:center;
  gap:12px;
}

.userInfo h3 {
  margin:0;
}

.userInfo .sub {
  margin:0;
  font-size:13px;
  color:#64748b;
}

/* CLOSE BUTTON */
.closeBtn {
  font-size:18px;
  cursor:pointer;
  color:#64748b;
  transition:0.2s;
}

.closeBtn:hover {
  color:red;
}
/* CHIP BASE */
.chip {
  padding:6px 12px;
  border-radius:20px;
  font-size:13px;
  width:fit-content;
  margin-bottom:8px;
  font-weight:500;
}

/* ✅ COMPLETED → GREEN */
.greenChip {
  background:#dcfce7;
  color:#16a34a;
}

/* ✅ OVERDUE → RED */
.redChip {
  background:#fee2e2;
  color:#dc2626;
}

/* ✅ ASSIGNED → DARK BLUE */
.blueChip {
  background:#e0e7ff;
  color:#3730a3;
}

/* ✅ TEAMS → LIGHT PINK */
.pinkChip {
  background:#fce7f3;
  color:#be185d;
}
.chip:hover {
  transform:scale(1.05);
  transition:0.2s;
}


      `}</style>
        </div>
    );
};

export default UserInsights;