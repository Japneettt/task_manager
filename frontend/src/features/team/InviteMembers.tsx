import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
 
const InviteMembers = () => {
  const { id } = useParams(); // teamId
  const navigate = useNavigate();
 
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState("");
 
  const addEmail = () => {
    if (!input) return;
    setEmails([...emails, input]);
    setInput("");
  };
 
  const invite = async () => {
    if (emails.length===0) {
      alert("Please add an email first ❗");
      return;
    }
 
    try {
      await api.post(`/teams/${id}/invite`, {
        emails: emails,
      });
 
      alert("Invite sent ✅");
      navigate(`/teams/${id}`);
    } catch (err: any) {
      console.error("Invite error:", err.response?.data || err.message);
      alert("Failed to send invite ❌");
    }
  };
 
  return (
    <div style={{ padding: "40px" }}>
      <h2>Invite Your Team 👥</h2>
 
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter email"
      />
 
      <button onClick={addEmail}>Add</button>
 
      <div>
        {emails.map((email, i) => (
          <div key={i}>{email}</div>
        ))}
      </div>
 
      <button onClick={invite}>Invite to Team</button>
    </div>
  );
};
 
export default InviteMembers;

 