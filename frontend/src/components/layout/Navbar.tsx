import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import logo from "../../assets/workivo-logo.png";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
 
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);
 
  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };
  const handleSettingsNavigate = (path: string) => {
    navigate(path);
    setSettingsOpen(false);
  };

 
  // ✅ ACTIVE STYLE
  const activeStyle = (path: string) => ({
    cursor: "pointer",
    color: location.pathname === path ? "#4f46e5" : "#374151",
    fontWeight: location.pathname === path ? 600 : 400,
    position: "relative" as const,
  });
 
  const dropdownItemStyle = {
    width: "100%",
    textAlign: "left" as const,
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    outline: "none",
    cursor: "pointer",
    color: "#0F172A",
    fontSize: 14,
    display: "block",
    transition: "background 0.15s ease",
    borderRadius: 12,
    boxSizing: "border-box" as const,
  };
 
  // const activeStyle = (path: string) => ({
  //   cursor: "pointer",
  //   color: location.pathname === path ? "#4f46e5" : "#374151",
  //   fontWeight: location.pathname === path ? 600 : 400,
  //   position: "relative" as const,
  // });

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
<div
  onClick={() => navigate("/dashboard")}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  }}
>
  <img src={logo} alt="Workivo" style={{ width: "40px", height: "40px" }} />

  <span style={{ fontWeight: 700, fontSize: "18px" }}>
    Workivo
  </span>
</div>

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
      <div style={{ display: "flex", alignItems: "center", gap: "12px" ,position:"relative"}}>

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
        <button
          type="button"
          aria-label="Open settings menu"
          onClick={() => setSettingsOpen((prev) => !prev)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.35)",
            background: settingsOpen ? "#F8FAFB" : "#FFFFFF",
            cursor: "pointer",
            transition: "transform 0.2s ease, background 0.2s ease, color 0.2s ease",
            color: "#475569",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
          >
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.13-.38.3-.73.51-1.05a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.43.43.98.64 1.53.58H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 4 0v.09c.38.13.73.3 1.05.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.43.43-.64.98-.58 1.53V9c.63.18 1.19.57 1.56 1.05a1.65 1.65 0 0 0-.33 1.82z" />
          </svg>
        </button>
 
        {settingsOpen && (
          <div
           ref={dropdownRef}   // ✅ IMPORTANT (you forgot this!)
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 10,
              width: 224,
              background: "rgba(255,255,255,0.97)",
              borderRadius: 18,
              border: "1px solid rgba(226,232,240,1)",
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.16)",
              overflow: "hidden",
              zIndex: 99999,
              transformOrigin: "top right",
              opacity: 1,
              transform: "translateY(0) scale(1)",
              transition: "opacity 180ms ease-in-out, transform 180ms ease-in-out",
            }}
          >
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleSettingsNavigate("/profile")}
              style={dropdownItemStyle}
            >
              View Profile
            </button>
            <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleSettingsNavigate("/change-password")}
              style={dropdownItemStyle}
            >
              Change Password
            </button>
            <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleSettingsNavigate("/faq")}
              style={dropdownItemStyle}
            >
              FAQ
            </button>
            <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />

{/* ✅ HELP */}
<button
  type="button"
  className="dropdown-item"
  onClick={() => handleSettingsNavigate("/help")}
  style={dropdownItemStyle}
>
  Help
</button>
            <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />
            <button
              type="button"
              className="dropdown-item"
              onClick={handleLogout}
              style={{
                ...dropdownItemStyle,
                color: "#dc2626",
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </div>
        )}
 

      </div>
    </div>
  );
};

export default Navbar;
