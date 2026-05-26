import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      background: "#f5f7fb",
      minHeight: "100vh"
    }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: "230px",
        background: "#ffffff",
        padding: "20px",
        borderRight: "1px solid #eee"
      }}>
        <h2 style={{ color: "#4f46e5" }}>Admin ⚡</h2>

        <div onClick={() => navigate("/admin")} style={navStyle}>Dashboard</div>
        <div onClick={() => navigate("/admin/teams")} style={navStyle}>Teams</div>
        <div onClick={() => navigate("/admin/users")} style={navStyle}>Users</div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "30px" }}>
        <Outlet />
      </div>
    </div>
  );
};

const navStyle = {
  padding: "10px",
  cursor: "pointer",
  borderRadius: "8px",
  marginTop: "10px"
};

export default AdminLayout;