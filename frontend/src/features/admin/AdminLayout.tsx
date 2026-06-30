import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  // Determine if route is active
  const isActive = (path: string) => location.pathname === path;

  // Menu items with icons
  const menuItems = [
    { icon: "📊", label: "Dashboard", path: "/admin" },
    { icon: "👥", label: "Teams", path: "/admin/teams" },
    { icon: "👤", label: "Users", path: "/admin/users" },
    { icon: "❓", label: "User Queries", path: "/admin/queries" },
  ];

  const sidebarWidth = collapsed ? "70px" : "220px";
  const contentPadding = collapsed ? "20px" : "20px";

  // Handle logout
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("chat_owner");
    window.dispatchEvent(new Event("workivo:logout"));
    sessionStorage.clear();
    
    // Redirect to login
    navigate("/login");
  };

  return (
    // <div style={{
    //   display: "flex",
    //   background: "#f9fafb",
    //   minHeight: "100vh",
    //   fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    // }}>
    <div
  style={{
    background: "#f9fafb",
    minHeight: "100vh",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  }}
>
     
      {/* SIDEBAR */}
      {/* <div style={{
        width: sidebarWidth,
        background: "#ffffff",
        padding: "16px",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        transition: "all 0.3s ease",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}> */}
      <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: sidebarWidth,
    height: "100vh",
    background: "#ffffff",
    padding: "16px",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    zIndex: 1000,
  }}
>
        {/* HEADER WITH TOGGLE */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: "24px",
          transition: "all 0.3s ease"
        }}>
          {!collapsed && <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>Admin</h2>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "6px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              color: "#6b7280",
              fontSize: "16px"
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "#f3f4f6";
              (e.target as HTMLButtonElement).style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "transparent";
              (e.target as HTMLButtonElement).style.color = "#6b7280";
            }}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* MENU ITEMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  background: active ? "#eef2ff" : "transparent",
                  color: active ? "#2563eb" : "#6b7280",
                  fontWeight: active ? "600" : "500",
                  fontSize: "14px"
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  if (!active) {
                    el.style.background = "#f3f4f6";
                    el.style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  if (!active) {
                    el.style.background = "transparent";
                    el.style.color = "#6b7280";
                  }
                }}
              >
                <span style={{ fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px" }}>
                  {item.icon}
                </span>
                {!collapsed && <span style={{ transition: "opacity 0.3s ease" }}>{item.label}</span>}
              </div>
            );
          })}
        </div>

        {/* LOGOUT BUTTON - Fixed at bottom */}
        <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
          <div
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "12px",
              padding: "10px 12px",
              cursor: "pointer",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              background: "transparent",
              color: "#6b7280",
              fontWeight: "500",
              fontSize: "14px"
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = "#fee2e2";
              el.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = "transparent";
              el.style.color = "#6b7280";
            }}
            title={collapsed ? "Logout" : ""}
          >
            <span style={{ fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px" }}>
              👋
            </span>
            {!collapsed && <span style={{ transition: "opacity 0.3s ease" }}>Logout</span>}
          </div>
        </div>
      </div>
 
      {/* CONTENT */}
      {/* <div style={{
        flex: 1,
        padding: "30px",
        overflowY: "auto",
        transition: "all 0.3s ease"
      }}> */}
      <div
  style={{
    flex: 1,
    marginLeft: sidebarWidth,
    padding: "30px",
    transition: "all 0.3s ease",
    minHeight: "100vh",
  }}
>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;