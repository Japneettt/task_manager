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
      setBoards(res.data.boards);
    } catch (err) {
      console.error("Error fetching boards", err);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // ✅ CREATE BOARD
  const createBoard = async () => {
    if (!title) return;

    await api.post("/boards", null, {
      params: { title },
    });

    setTitle("");
    fetchBoards();
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
            }}
          />
          <button onClick={createBoard}>Create</button>
        </div>

        {/* ✅ BOARDS GRID */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {boards.map((board) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardsDashboard;