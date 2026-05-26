import { useEffect, useState } from "react";
import { api } from "../../services/api";

const TeamManagement = () => {
  const [teams, setTeams] = useState<any[]>([]);

  const fetchTeams = async () => {
    const res = await api.get("/teams");
    setTeams(res.data);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const deleteTeam = async (id: string) => {
    await api.delete(`/teams/${id}`);
    fetchTeams();
  };

  return (
    <div>
      <h2>Team Management</h2>

      <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
  gap: "20px"
}}>
  {teams.map(team => (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
    }}>
      <h3>{team.name}</h3>

      {/* progress bar */}
      <div style={{ background: "#eee", height: "8px", borderRadius: "5px" }}>
        <div style={{
          width: "70%",
          height: "100%",
          background: "#22c55e",
          borderRadius: "5px"
        }} />
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default TeamManagement;