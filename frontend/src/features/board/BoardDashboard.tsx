import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";

type Board = {
  id: string;
  title: string;
  description?: string | null;
  owner_name?: string;
  owner_email?: string;
};

const BoardsDashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  // ✅ FETCH BOARDS (✅ FIXED ENDPOINT)
  const fetchBoards = async () => {
    try {
      const url = showArchived
        ? "/boards/archived"
        : "/boards/personal";   // ✅ FIXED - use /personal for personal boards

      const res = await api.get(url);

      console.log("BOARDS API:", res.data);

      setBoards(res.data || []);
    } catch (err) {
      console.error("Error fetching boards", err);
      setBoards([]); // ✅ fallback safety
    }
  };

  // ✅ FETCH ON LOAD + TOGGLE
  useEffect(() => {
    fetchBoards();
  }, [showArchived]);

  useEffect(() => {
    console.log("Boards page loaded");
  }, []);

  // ✅ CREATE BOARD
  const createBoard = async () => {
    if (!title) return;

    try {
      console.log("Creating board:", title);
      const res = await api.post("/boards/", {
        title: title,
        description: description || null,
        team_id: null,
      });

      console.log("Board created successfully:", res.data);
      setTitle("");
      setDescription("");
      fetchBoards();
    } catch (err) {
      console.error("Error creating board", err);
    }
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Boards</h2>

        {/* ✅ TOGGLE */}
        <button
          onClick={() => setShowArchived((prev) => !prev)}
          style={{
            marginBottom: "15px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            background: "#6366f1",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {showArchived ? "Back to Active Boards" : "View Archived"}
        </button>

        {/* ✅ SEARCH */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boards or owner"
            style={{
              flex: 1,
              minWidth: "240px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => setSearch("")}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#e5e7eb",
              color: "#111827",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        {/* ✅ CREATE */}
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
          <input
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Board description"
  style={{
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginRight: "10px",
    marginTop: "10px"
  }}
/>
          <button onClick={createBoard}>Create</button>
        </div>

        {/* ✅ BOARDS GRID */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {boards.filter((board) => {
            const query = search.toLowerCase();
            return (
              board.title.toLowerCase().includes(query) ||
              board.owner_name?.toLowerCase().includes(query) ||
              board.owner_email?.toLowerCase().includes(query)
            );
          }).length === 0 ? (
            <p>No boards found 🚫</p>
          ) : (
            boards.filter((board) => {
              const query = search.toLowerCase();
              return (
                board.title.toLowerCase().includes(query) ||
                board.owner_name?.toLowerCase().includes(query) ||
                board.owner_email?.toLowerCase().includes(query)
              );
            }).map((board) => (
              <div
                key={board.id}
                style={{
                  position: "relative",
                  width: "260px",
                  minHeight: "150px",
                  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color: "#fff",
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* ✅ ACTIONS */}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "10px",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  {/* DELETE */}
                  <span
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm("Delete this board?")) return;

                      try {
                        await api.delete(`/boards/${board.id}`);
                        fetchBoards();
                      } catch (err) {
                        console.error("Delete failed", err);
                      }
                    }}
                  >
                    🗑️
                  </span>

                  {/* ARCHIVE */}
                  <span
                    onClick={async (e) => {
                      e.stopPropagation();

                      try {
                        await api.patch(`/boards/${board.id}/archive`);
                        fetchBoards();
                      } catch (err) {
                        console.error("Archive failed", err);
                      }
                    }}
                  >
                    {showArchived ? "♻️" : "📦"}
                  </span>
                </div>

                <div style={{ width: "100%" }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{board.title}</h3>
                  <p style={{ margin: "8px 0 4px", fontSize: "0.9rem", opacity: 0.9 }}>
                    {board.description || "No description yet."}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.85 }}>
                    Owner: {board.owner_name || board.owner_email || "Unknown"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/boards/${board.id}`);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "none",
                      background: "rgba(255,255,255,0.18)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    View Board
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardsDashboard;