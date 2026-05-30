import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
 
const CreateTeam = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("private");
  const [description, setDescription] = useState("");
  const [teamImage, setTeamImage] = useState<File | null>(null);
 
  const navigate = useNavigate();
 
  const handleCreate = async () => {
    if (!name) return;
 
    try {
      let res;
 
      if (teamImage) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("type", type);
        formData.append("description", description);
        formData.append("image", teamImage);

        res = await api.post("/teams", formData);
      } else {
        res = await api.post("/teams", {
          name,
          type,
          description,
        });
      }
 
      const teamId = res.data.id;
      navigate(`/teams/${teamId}/invite`);
    } catch (error) {
      console.error("Failed to create team", error);
    }
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
 
      <label style={{ display: "block", margin: "16px 0" }}>
        Team image (optional):
        <input
          type="file"
          accept="image/*"
          style={{ display: "block", marginTop: "8px" }}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setTeamImage(file);
          }}
        />
      </label>
 
      <button onClick={handleCreate}>Continue</button>
    </div>
  );
};
 
export default CreateTeam;