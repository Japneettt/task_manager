import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

type User = {
  first_name: string;
  last_name: string;
  email: string;
};

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // ✅ GENERATE INITIALS (JK)
  const getInitials = (first: string, last: string) => {
    return `${first[0]}${last[0]}`.toUpperCase();
  };

  // ✅ FETCH USER FROM BACKEND
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);

        // ✅ If token invalid → logout
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

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
      <h5>TaskFlow</h5>

      {/* ✅ NAV ITEMS */}
      <div style={{ display: "flex", gap: "30px" }}>
        <span>Dashboard</span>
        <span>Boards</span>
        <span>Inbox</span>
        <span>Planner</span>
        <span>Activity</span>
      </div>

      {/* ✅ PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        
        {/* ✅ INITIALS AVATAR */}
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
          {user
            ? getInitials(user.first_name, user.last_name)
            : ".."}
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

        {/* ✅ LOGOUT */}
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

