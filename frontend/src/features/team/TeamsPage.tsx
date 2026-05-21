import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const TeamsPage = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchTeams = async () => {
    const res = await api.get("/teams");
    setTeams(res.data);
  };
  useEffect(() => {
  fetchTeams();

  const interval = setInterval(() => {
    fetchTeams();
  }, 5000);

  return () => clearInterval(interval);
}, []);

// useEffect(() => {
//   fetchTeams();

//   const userData = localStorage.getItem("user");

//   // ✅ FIX: check for valid JSON
//   if (!userData || userData === "undefined") return;

//   let user;
//   try {
//     user = JSON.parse(userData);
//   } catch (err) {
//     console.error("Invalid user JSON:", userData);
//     return;
//   }

//   if (!user?.id) return;

//   const ws = new WebSocket(`ws://localhost:8000/ws/activity/${user.id}`);

//   ws.onmessage = () => {
//     fetchTeams();
//   };

//   return () => ws.close();
// }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Team Projects 👥</h2>

      {/* ✅ CREATE TEAM */}
      <button
        onClick={() => navigate("/teams/create")}
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#4f46e5",
          color: "#fff",
          borderRadius: "8px",
          border: "none",
        }}
      >
        + Create New Team
      </button>

      {/* ✅ LIST TEAMS */}
      <div style={{ display: "flex", gap: "20px" }}>
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => navigate(`/teams/${team.id}`)}
            style={{
              padding: "20px",
              background: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              width: "200px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h4>{team.name}</h4>
            <p>{team.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsPage;