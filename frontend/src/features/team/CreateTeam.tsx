import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const CreateTeam = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("private");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  const handleCreate = async () => {
    const res = await api.post("/teams", {
      name,
      type,
      description,
    });

    const teamId = res.data.id;

    navigate(`/teams/${teamId}/invite`);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Let's Build a Team 🚀</h2>

      <input
        placeholder="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select onChange={(e) => setType(e.target.value)}>
        <option value="private">Private</option>
        <option value="public">Public</option>
      </select>

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={handleCreate}>Continue</button>
    </div>
  );
};

export default CreateTeam;