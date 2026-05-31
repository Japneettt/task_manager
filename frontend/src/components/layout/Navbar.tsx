import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
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
  useEffect(() => {
  const interval = setInterval(() => {

    if (localStorage.getItem("refreshUser")) {

      api.get("/users/me").then(res => {
        setUser(res.data);
        localStorage.removeItem("refreshUser");
      });

    }

  }, 1000);

  return () => clearInterval(interval);
}, []);
  const goToProfile = () => navigate("/profile");

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

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
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


        <span onClick={() => navigate("/planner")}>
          Planner
        </span>

        <span
          style={activeStyle("/activity")}
          onClick={() => navigate("/activity")}
        >
          Activity
        </span>
      </div>

      {/* ✅ PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* ✅ CLICKABLE AREA */}
        <div
          onClick={goToProfile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer"
          }}
        >

          {/* ✅ AVATAR */}
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ddd",
              fontWeight: 600,
              color: "#fff"
            }}

          >

            {user?.avatar ? (
              <img
                src={`http://localhost:8000/${user.avatar}`}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span>
                {user ? getInitials(user.first_name, user.last_name) : ".."}
              </span>
            )}

            {/* {user ? getInitials(user.first_name, user.last_name) : ".."} */}
          </div>

          {/* ✅ USER INFO */}
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

        </div>

        {/* ✅ LOGOUT (SEPARATE CLICK) */}
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
