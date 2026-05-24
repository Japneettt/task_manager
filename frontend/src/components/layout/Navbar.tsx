import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api, getWebSocketUrl } from "../../services/api";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  is_admin?: boolean;
};

type Notification = {
  id: string;
  is_read: boolean;
};

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ INITIALS
  const getInitials = (first: string, last: string) =>
    `${first[0]}${last[0]}`.toUpperCase();

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") {
      setIsAdmin(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setIsAdmin(parsedUser?.is_admin === true);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const getDefaultRoute = () => (isAdmin ? "/admin" : "/dashboard");

  // ✅ FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      return;
    }

    const token = localStorage.getItem("token");
    if (!parsedUser?.id || !token) {
      return;
    }

    const ws = new WebSocket(
      getWebSocketUrl(
        `/ws/notifications/${parsedUser.id}?token=${encodeURIComponent(token)}`
      )
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_INVITE" || data.type === "NEW_NOTIFICATION") {
          fetchNotifications();
        }
      } catch (err) {
        console.error("WebSocket message parse error", err);
      }
    };

    ws.onerror = (event) => {
      console.warn("WebSocket error", event);
    };

    return () => ws.close();
  }, []);

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
      <h5
        style={{ cursor: "pointer" }}
        onClick={() => navigate(getDefaultRoute())}
      >
        TaskFlow
      </h5>

      {/* ✅ NAV LINKS */}
      <div style={{ display: "flex", gap: "30px" }}>
        {/* Dashboard */}
        <span
          style={activeStyle(getDefaultRoute())}
          onClick={() => navigate(getDefaultRoute())}
        >
          Dashboard
        </span>

        {isAdmin && (
          <span
            style={activeStyle("/admin")}
            onClick={() => navigate("/admin")}
          >
            Admin Panel
          </span>
        )}

        {/* Boards */}
        <Link to="/boards" style={activeStyle("/boards") as any}>
          Boards
        </Link>

        {/* ✅ Inbox with badge */}
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

        {/* ✅ FIXED Planner */}
        <span
          style={activeStyle("/planner")}
          onClick={() => navigate("/planner")}
        >
          Planner
        </span>

        {/* ✅ FIXED Activity */}
        <span
          style={activeStyle("/activity")}
          onClick={() => navigate("/activity")}
        >
          Activity
        </span>
      </div>

      {/* ✅ PROFILE SECTION */}
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

