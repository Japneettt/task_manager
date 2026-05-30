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
    // ✅ debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebounced(search);
            setPage(1); // ✅ reset page on search
        }, 400);
        return () => clearTimeout(t);
    }, [search]);
 
    // ✅ fetch users
    useEffect(() => {
        api.get("/admin/users", {
            params: {
                search: debounced,
                page,
                limit: 8,
                status: filter
            }
        }).then(res => {
            setUsers(res.data.data || []);
            setTotal(res.data.total || 0);
        });
    }, [debounced, page, filter]);
 
    const pages = Math.ceil(total / 8);
    const deleteUser = async (id: string) => {
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error(err);
        }
    };
 
    const openInsights = async (user: any) => {
        setSelectedUser(user);
        setShowModal(true);
        setInsights(null);
 
        try {
            const res = await api.get(`/admin/users/${user.id}/insights`);
            setInsights(res.data);
        } catch (err) {
            console.error(err);
        }
    };
 
    return (
        <div>
 
            <h2 style={{ marginBottom: "15px" }}>User Insights</h2>
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
 
            {/* ✅ SEARCH + FILTER */}
            <div className="tableHeader">
                <input
                    className="search"
                    placeholder="Search name, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
 
                <select
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        setPage(1); // ✅ reset on filter change
                    }}
                    className="filter"
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
 
            {/* ✅ TABLE */}
            <div className="tableWrapper">
                <table>
 
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Username</th>
                            <th>Status</th>
                            <th>Registered</th>
                            <th>Last Login</th>
                            <th>Active</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
 
                    <tbody>
                        {users.map((u, i) => {
 
                            const first = u.first_name || "User";
                            const last = u.last_name || "";
                            const initials = (first[0] + (last[0] || "")).toUpperCase();
 
                            const username = (first + last).toLowerCase();
 
                            return (
                                <tr key={u.id} className="row">
 
                                    <td>#{(page - 1) * 8 + i + 1}</td>
 
                                    {/* ✅ USER */}
                                    <td>
                                        <div className="userCell">
                                            <div className="avatar">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="name">
                                                    {first} {last}
                                                </div>
                                                <div className="email">
                                                    {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
 
                                    {/* ✅ USERNAME */}
                                    <td>@{username}</td>
 
                                    {/* ✅ STATUS */}
                                    <td>
                                        <span className={`badge ${u.is_active ? "green" : "gray"
                                            }`}>
                                            {u.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
 
                                    {/* ✅ REGISTERED */}
                                    <td>
                                        {u.created_at
                                            ? new Date(u.created_at).toLocaleDateString()
                                            : "-"}
                                    </td>
 
                                    {/* ✅ LAST LOGIN */}
                                    <td>
                                        {u.last_login
                                            ? new Date(u.last_login).toLocaleDateString()
                                            : "-"}
                                    </td>
 
                                    {/* ✅ ACTIVE */}
                                    <td style={{ textAlign: "center" }}>
                                        {u.is_active ? "✅" : "❌"}
                                    </td>
 
                                    {/* ✅ ACTIONS */}
                                    <td style={{ textAlign: "center" }}>
                                        <div className="dropdown">
 
                                            <span className="dots">⋯</span>
 
                                            <div className="menu">
                                                <div onClick={() => openInsights(u)}>Insights</div>
                                                <div onClick={() => deleteUser(u.id)}>Delete</div>
                                            </div>
 
                                        </div>
                                    </td>
 
                                </tr>
                            );
                        })}
                    </tbody>
 
                </table>
            </div>
 
            {/* ✅ PAGINATION */}
            <div className="pagination">
 
                <button disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}>
                    Prev
                </button>
 
                {[...Array(pages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={page === i + 1 ? "activePage" : ""}
                    >
                        {i + 1}
                    </button>
                ))}
 
                <button
                    disabled={page === pages}
                    onClick={() => setPage(p => p + 1)}>
                    Next
                </button>
 
            </div>
 
            {/* ✅ ✅ ADD MODAL HERE (INSIDE MAIN DIV) */}
            {showModal && (
                <div className="modalOverlay" onClick={() => setShowModal(false)}>
 
                    <div className="modalCard" onClick={(e) => e.stopPropagation()}>
 
                        <div className="modalHeader">
                            <h3>User Insights</h3>
                            <span onClick={() => setShowModal(false)}>✖</span>
                        </div>
 
                        {!insights ? (
                            <p>Loading...</p>
                        ) : (
                            <div className="insightsGrid">
 
                                <div className="profileCard">
                                    <div className="avatar big">
                                        {selectedUser.first_name[0]}
                                    </div>
                                    <h4>{selectedUser.first_name} {selectedUser.last_name}</h4>
                                    <p>{selectedUser.email}</p>
                                </div>
 
                                <div className="metrics">
                                    <div className="metric blue">
                                        <p>Assigned</p>
                                        <h2>{insights.assigned}</h2>
                                    </div>
 
                                    <div className="metric green">
                                        <p>Completed</p>
                                        <h2>{insights.completed}</h2>
                                    </div>
 
                                    <div className="metric red">
                                        <p>Overdue</p>
                                        <h2>{insights.overdue}</h2>
                                    </div>
 
                                    <div className="metric purple">
                                        <p>Teams</p>
                                        <h2>{insights.teams}</h2>
                                    </div>
                                </div>
 
                                <div className="radialChart">
                                    <div className="semiChart">
 
                                        <div className="semiArc">
 
                                            {[...Array(20)].map((_, i) => {
                                                const percentPerBlock = 100 / 20;
                                                const activeBlocks = insights.productivity / percentPerBlock;
 
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`block ${i < activeBlocks ? "active" : ""}`}
                                                        style={{
                                                            transform: `rotate(${i * 9 -90}deg) translateY(-90px)`
                                                        }}
                                                    />
                                                );
                                            })}
 
                                        </div>
 
                                        <div className="centerText">
                                            {insights.productivity}%
                                            <p>Achieved</p>
                                        </div>
 
                                    </div>
 
                                    <div className="streak">
                                        🔥 {insights.streak} Day Streak
                                    </div>
 
                                </div>
                            </div>
            )}
 
                </div>
            </div>
 
        )}
        </div>
    );
};
 
export default UserInsights;