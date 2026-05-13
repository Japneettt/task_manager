import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";

type User = {
  first_name: string;
  last_name: string;
  email: string;
};

type Notification = {
  id: string;
  is_read: boolean;
};

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ NEW
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ INITIALS
  const getInitials = (first: string, last: string) => {
    return `${first[0]}${last[0]}`.toUpperCase();
  };

  // ✅ FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        handleLogout();
      }
    };

    fetchUser();
  }, []);

  // ✅ FETCH NOTIFICATION COUNT
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications"); // ✅ use correct endpoint
      const unread = res.data.filter(
        (n: Notification) => !n.is_read
      );
      setUnreadCount(unread.length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  // ✅ ACTIVE STYLE
  const activeStyle = (path: string) => ({
    cursor: "pointer",
    color: location.pathname === path ? "#4f46e5" : "#374151",
    fontWeight: location.pathname === path ? 600 : 400,
    position: "relative" as const,
  });

  return (
    <div
      style={{
        width: "100%",
        padding: "12px 30px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* ✅ LOGO */}
      <h5 style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
        TaskFlow
      </h5>

      {/* ✅ NAV */}
      <div style={{ display: "flex", gap: "30px" }}>
        {/* Dashboard */}
        <span
          style={activeStyle("/dashboard")}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </span>

        {/* Boards */}
        <span
          style={activeStyle("/boards")}
          onClick={() => navigate("/boards")}
        >
          Boards
        </span>

        {/* ✅ Inbox with Badge */}
        <span
          style={activeStyle("/inbox")}
          onClick={() => navigate("/inbox")}
        >
          Inbox
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-14px",
                background: "red",
                color: "#fff",
                borderRadius: "50%",
                fontSize: "10px",
                padding: "3px 6px",
              }}
            >
              {unreadCount}
            </span>
          )}
        </span>

        <span style={{ cursor: "pointer" }}>Planner</span>
        <span style={{ cursor: "pointer" }}>Activity</span>
      </div>

      {/* ✅ PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        
        {/* Avatar */}
        <div
          style={{
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
          }}
        >
          {user ? getInitials(user.first_name, user.last_name) : ".."}
        </div>

        {/* User Info */}
        <div>
          <div>
            {user
              ? `${user.first_name} ${user.last_name}`
              : "Loading..."}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {user?.email}
          </div>
        </div>

        {/* Logout */}
        <span
          onClick={handleLogout}
          style={{
            color: "red",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Logout
        </span>
      </div>
    </div>
  );
};

export default Navbar;

