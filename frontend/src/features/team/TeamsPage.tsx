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


  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

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
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {teams.map((team) => {
          const imageUrl =
            team.image_url ||
            "https://source.unsplash.com/random/800x600?abstract";

          return (
            <div
              key={team.id}
              onClick={() => navigate(`/teams/${team.id}`)}
              onMouseEnter={() => setHoveredTeam(team.id)}
              onMouseLeave={() => setHoveredTeam(null)}
              style={{
                width: "260px",
                borderRadius: "18px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
                transform:
                  hoveredTeam === team.id ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                background: "#fff",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "140px",
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    color: "#fff",
                    zIndex: 1,
                  }}
                >
                  <h4 style={{ margin: 0 }}>{team.name}</h4>
                  <p style={{ margin: "6px 0 0", opacity: 0.9 }}>
                    {team.type}
                  </p>
                </div>
              </div>
              <div style={{ padding: "16px" }}>
                <p
                  style={{
                    margin: 0,
                    color: "#475569",
                    minHeight: "48px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {team.description || "A modern team workspace."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamsPage;
