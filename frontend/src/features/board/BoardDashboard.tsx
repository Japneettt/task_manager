import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";

type Board = {
  id: string;
  title: string;
};

const BoardsDashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  // ✅ FETCH BOARDS
  const fetchBoards = async () => {
    try {
      const res = await api.get("/boards");
      setBoards(res.data.boards || res.data); // ✅ support both formats
    } catch (err) {
      console.error("Error fetching boards", err);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // ✅ CREATE BOARD (FIXED 🔥)
  const createBoard = async () => {
    if (!title.trim()) return;

    try {
      await api.post("/boards", {
        title: title,  // ✅ CORRECT
        description: "",  // ✅ matches schema
      });

      setTitle("");
      fetchBoards(); // ✅ refresh list
    } catch (err: any) {
      console.error("Create board error:", err);
      alert(err.response?.data?.detail || "Failed to create board");
    }
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Boards</h2>

        {/* ✅ CREATE BOARD */}
        <div style={{ marginBottom: "20px" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Create new board"
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginRight: "10px",
              width: "250px",
            }}
          />

          <button
            onClick={createBoard}
            style={{
              padding: "8px 14px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Create
          </button>
        </div>

        {/* ✅ BOARDS GRID */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {boards.length === 0 ? (
            <p>No boards yet</p>
          ) : (
            boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/boards/${board.id}`)}
                style={{
                  width: "220px",
                  height: "120px",
                  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-end",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                {board.title}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardsDashboard;