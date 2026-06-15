import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
 
const HelpPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
 
  const submitQuery = async () => {
    if (!message.trim()) {
      alert("Please enter your query");
      return;
    }
 
    setLoading(true);
 
    try {
      await api.post("/users/query", { message });
      alert("Query sent to admin ✅");
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send");
    }
 
    setLoading(false);
  };
 
  return (
    <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100vh" }}>
     
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>←</span>
        <h2>Help & Support</h2>
      </div>
 
      {/* QUERY BOX */}
      <div
        style={{
          marginTop: 30,
          background: "#fff",
          padding: 20,
          borderRadius: 12
        }}
      >
        <h4>Ask Admin</h4>
 
        <textarea
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            width: "100%",
            height: "120px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            marginTop: "10px"
          }}
        />
 
        <button
          onClick={submitQuery}
          disabled={loading}
          style={{
            marginTop: 15,
            padding: "12px 16px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            cursor: "pointer"
          }}
        >
          {loading ? "Sending..." : "Send to Admin"}
        </button>
      </div>
 
    </div>
  );
};
 
export default HelpPage;
 