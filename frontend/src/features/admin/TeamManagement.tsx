import { useEffect, useState } from "react";
import { api } from "../../services/api";

const TeamManagement = () => {
  const [teams, setTeams] = useState<any[]>([]);

  const fetchTeams = async () => {
    try {
      const res = await api.get("/admin/teams");
      console.log("TEAMS:", res.data);
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const deleteTeam = async (id: string) => {
    await api.delete(`/admin/teams/${id}`);
    fetchTeams();
  };

  // ✅ FIX: validate image URL properly
  // const getValidImage = (url?: string, id?: string) => {
  //   if (url && url.startsWith("http")) return url;
  //   return `https://picsum.photos/400/200?random=${id}`;
  // };
  const getValidImage = (url?: string, id?: string) => {
  if (url) {
    if (url.startsWith("http")) {
      return url;
    }

    return `http://localhost:8000${url}`;
  }

  return `https://source.unsplash.com/800x600/?team,workspace&sig=${id}`;
};

  return (
    <div style={{ padding: "24px", background: "#f5f7fb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px" }}>Team Management</h2>

      {teams.length === 0 ? (
        <div
          style={{
            padding: "40px",
            background: "#f8fafc",
            borderRadius: "16px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          No teams found
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: "20px",
          }}
        >
          {teams.map((team) => {
            const imageSrc = getValidImage(team.image_url, team.id);

            return (
              <div
                key={team.id}
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.2s",
                }}
              >
                {/* ✅ FIXED IMAGE */}
                <img
                  src={imageSrc}
                  alt={team.name || "Team"}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    backgroundColor: "#f1f5f9",
                  }}
                  onError={(e) => {
                    // ✅ fallback ONLY if real image fails
                    (e.target as HTMLImageElement).src =
                      `https://picsum.photos/400/200?random=${team.id}`;
                  }}
                />

                <div style={{ padding: "18px", flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                    {team.name}
                  </h3>

                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#64748b",
                      minHeight: "48px",
                    }}
                  >
                    {team.description || "No description"}
                  </p>

                  <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
                    <div style={infoRow}>
                      <strong>Owner</strong>
                      <span>{team.owner || "Unknown"}</span>
                    </div>

                    <div style={infoRow}>
                      <strong>Members</strong>
                      <span>{team.members_count}</span>
                    </div>
                  </div>
                </div>

                {/* ✅ BETTER BUTTON UI */}
                <div
                  style={{
                    padding: "16px",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() =>
                      window.location.assign(`/teams/${team.id}`)
                    }
                    style={viewButton}
                  >
                    View
                  </button>

                  <button
                    onClick={() => deleteTeam(team.id)}
                    style={deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  color: "#475569",
};

const viewButton = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#3b82f6",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const deleteButton = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

export default TeamManagement;