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

/* ─────────────────────────────────────────────────────────
   ✅ ONE-TIME STYLE INJECTION (hover states, animations)
   Pure CSS only — no functionality, no logic changes.
───────────────────────────────────────────────────────── */
const STYLE_ID = "wkv-boards-dashboard-styles";
function injectBoardsStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lexend:wght@500;600;700;800&display=swap');

    .bwd * { box-sizing: border-box; }

    .bwd-board-card {
      transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s cubic-bezier(.4,0,.2,1), border-color 0.25s ease;
    }
    .bwd-board-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(124,58,237,0.16), 0 2px 8px rgba(76,29,149,0.06);
      border-color: rgba(124,58,237,0.28) !important;
    }

    .bwd-icon-btn {
      transition: background 0.15s ease, transform 0.15s ease, color 0.15s ease;
    }
    .bwd-icon-btn:hover {
      transform: translateY(-1px);
    }
    .bwd-icon-btn.delete:hover {
      background: rgba(239,68,68,0.12) !important;
      color: #DC2626 !important;
    }
    .bwd-icon-btn.archive:hover {
      background: rgba(124,58,237,0.14) !important;
      color: #6D28D9 !important;
    }

    .bwd-view-btn {
      transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.15s ease;
    }
    .bwd-view-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(124,58,237,0.38);
    }
    .bwd-view-btn:active { transform: translateY(0) scale(0.98); }

    .bwd-primary-btn {
      transition: transform 0.15s ease, box-shadow 0.2s ease;
    }
    .bwd-primary-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 26px rgba(124,58,237,0.40);
    }
    .bwd-primary-btn:active { transform: translateY(0) scale(0.98); }

    .bwd-secondary-btn {
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }
    .bwd-secondary-btn:hover {
      background: #F5F3FF !important;
      border-color: rgba(124,58,237,0.30) !important;
    }

    .bwd-input:focus {
      border-color: #8b5cf6 !important;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.14) !important;
    }

    .bwd-toggle-btn {
      transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }
    .bwd-toggle-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(124,58,237,0.28);
    }

    @keyframes bwd-fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .bwd-fadeup { animation: bwd-fadeUp 0.4s cubic-bezier(.4,0,.2,1) both; }

    .bwd-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .bwd-scroll::-webkit-scrollbar-track { background: transparent; }
    .bwd-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.22); border-radius: 8px; }
  `;
  document.head.appendChild(tag);
}

/* ── Soft decorative blob/star shapes for the hero ── */
const HeroDecoration = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 900 220"
    preserveAspectRatio="none"
    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
  >
    <defs>
      <linearGradient id="bwdBlobA" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="bwdBlobB" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
      </linearGradient>
    </defs>
    <circle cx="760" cy="30" r="170" fill="url(#bwdBlobA)" />
    <circle cx="120" cy="210" r="150" fill="url(#bwdBlobB)" />
    <circle cx="480" cy="-40" r="120" fill="url(#bwdBlobA)" />
    {/* sparkle marks */}
    <g fill="#ffffff" opacity="0.55">
      <path d="M120 50 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" />
      <path d="M540 40 l2.4 7 7 2.4 -7 2.4 -2.4 7 -2.4 -7 -7 -2.4 7 -2.4 z" />
      <path d="M610 130 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" />
    </g>
  </svg>
);

/* ── small reusable icon set (inline svg, theme-matched) ── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A89FC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconArchive = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <line x1="10" y1="13" x2="14" y2="13" />
  </svg>
);

const IconRestore = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <polyline points="3 4 3 9 8 9" />
  </svg>
);

const IconBoard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const boardGradients = [
  "linear-gradient(135deg,#7C3AED,#6366F1)",
  "linear-gradient(135deg,#A78BFA,#7C3AED)",
  "linear-gradient(135deg,#EC4899,#A78BFA)",
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#8B5CF6,#6D28D9)",
];
const gradientFor = (key: string) =>
  boardGradients[
    key.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % boardGradients.length
  ];

const BoardsDashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    injectBoardsStyles();
  }, []);

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

  const filteredBoards = boards.filter((board) => {
    const query = search.toLowerCase();
    return (
      board.title.toLowerCase().includes(query) ||
      board.owner_name?.toLowerCase().includes(query) ||
      board.owner_email?.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="bwd"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #f3effe 0%, transparent 60%), radial-gradient(1000px 600px at 100% 0%, #eef2ff 0%, transparent 55%), #f8f7fc",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <Navbar />

      <div style={{ padding: "24px 30px 40px", maxWidth: 1180, margin: "0 auto" }}>
        {/* ══════════════════ HERO ══════════════════ */}
        <div
          className="bwd-fadeup"
          style={{
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            padding: "36px 40px",
            background:
              "linear-gradient(135deg, #ddd6fe 0%, #ede9fe 45%, #e0e7ff 100%)",
            boxShadow: "0 20px 50px rgba(124,58,237,0.14), 0 2px 8px rgba(31,16,72,0.05)",
            border: "1px solid rgba(124,58,237,0.10)",
          }}
        >
          <HeroDecoration />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Lexend', 'Inter', sans-serif",
                fontSize: "30px",
                fontWeight: 800,
                color: "#1E1B4B",
                letterSpacing: "-0.6px",
              }}
            >
              Personal Boards
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "14px",
                color: "#6B5B95",
                fontWeight: 500,
                maxWidth: "440px",
              }}
            >
              Create, organize and manage boards to track your work.
            </p>
          </div>
        </div>

        {/* ══════════════════ SEARCH ══════════════════ */}
        <div
          className="bwd-fadeup"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap" as const,
            marginTop: "24px",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <IconSearch />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards or owner..."
              className="bwd-input"
              style={{
                width: "100%",
                padding: "12px 14px 12px 40px",
                borderRadius: "12px",
                border: "1.5px solid #E5E0F5",
                outline: "none",
                fontSize: "13.5px",
                background: "#ffffff",
                color: "#1E1B4B",
              }}
            />
          </div>

          <button
            onClick={() => setSearch("")}
            className="bwd-secondary-btn"
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1.5px solid #E5E0F5",
              background: "#ffffff",
              color: "#4C3D7A",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            Clear
          </button>

          {/* ✅ archive toggle — same functionality, restyled */}
          <button
            onClick={() => setShowArchived((prev) => !prev)}
            className="bwd-toggle-btn"
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg,#7C3AED,#6366F1)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              boxShadow: "0 6px 16px rgba(124,58,237,0.30)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            {showArchived ? <IconRestore /> : <IconArchive />}
            {showArchived ? "Back to Active Boards" : "View Archived"}
          </button>
        </div>

        {/* ══════════════════ CREATE BOARD ══════════════════ */}
        <div
          className="bwd-fadeup"
          style={{
            background: "rgba(124,58,237,0.045)",
            marginTop: "20px",
            padding: "22px 24px",
            borderRadius: "20px",
            boxShadow: "0 8px 26px rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.12)",
          }}
        >
          <h4
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              fontWeight: 700,
              color: "#1E1B4B",
              letterSpacing: "-0.2px",
            }}
          >
            Create New Board
          </h4>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" as const }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#8B82A8",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.04em",
                  marginBottom: "6px",
                }}
              >
                Board Name
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter board name"
                className="bwd-input"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid #E5E0F5",
                  outline: "none",
                  fontSize: "13.5px",
                  background: "#FBFAFE",
                  color: "#1E1B4B",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "220px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#8B82A8",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.04em",
                  marginBottom: "6px",
                }}
              >
                Board Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter board description"
                className="bwd-input"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid #E5E0F5",
                  outline: "none",
                  fontSize: "13.5px",
                  background: "#FBFAFE",
                  color: "#1E1B4B",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={createBoard}
                className="bwd-primary-btn"
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                  border: "none",
                  color: "white",
                  padding: "11px 26px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  boxShadow: "0 6px 16px rgba(124,58,237,0.30)",
                  whiteSpace: "nowrap" as const,
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════ BOARDS GRID ══════════════════ */}
        <div style={{ marginTop: "32px" }}>
          <h3
            style={{
              fontSize: "16.5px",
              fontWeight: 700,
              color: "#1E1B4B",
              marginBottom: "16px",
              letterSpacing: "-0.2px",
            }}
          >
            {showArchived ? "Archived Boards" : "Your Boards"}
          </h3>

          {filteredBoards.length === 0 ? (
            <div
              className="bwd-fadeup"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(124,58,237,0.10)",
                borderRadius: "20px",
                padding: "48px 24px",
                textAlign: "center" as const,
                color: "#A89FC4",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#6B5B95" }}>
                No boards found 🚫
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredBoards.map((board, idx) => (
                <div
                  key={board.id}
                  className="bwd-board-card bwd-fadeup"
                  style={{
                    position: "relative",
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1px solid rgba(124,58,237,0.14)",
                    boxShadow: "0 4px 18px rgba(124,58,237,0.07)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "190px",
                  }}
                >
                  {/* ✅ ACTIONS — Delete + Archive, top-right, no three-dot menu */}
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    <button
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
                      className="bwd-icon-btn delete"
                      title="Delete board"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "9px",
                        border: "none",
                        background: "rgba(124,58,237,0.06)",
                        color: "#A89FC4",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconTrash />
                    </button>

                    <button
                      // onClick={async (e) => {
                      //   e.stopPropagation();

                      //   try {
                      //     await api.patch(`/boards/${board.id}/archive`);
                      //     fetchBoards();
                      //   } catch (err) {
                      //     console.error("Archive failed", err);
                      //   }
                      // }}
                      onClick={async (e) => {
  e.stopPropagation();

  try {
    if (showArchived) {
      await api.patch(`/boards/${board.id}/restore`);
    } else {
      await api.patch(`/boards/${board.id}/archive`);
    }

    fetchBoards();
  } catch (err) {
    console.error("Board action failed", err);
  }
}}
                      className="bwd-icon-btn archive"
                      title={showArchived ? "Restore board" : "Archive board"}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "9px",
                        border: "none",
                        background: "rgba(124,58,237,0.06)",
                        color: "#A89FC4",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {showArchived ? <IconRestore /> : <IconArchive />}
                    </button>
                  </div>

                  {/* ✅ ICON + INFO */}
                  <div>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: gradientFor(board.title + board.id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "14px",
                        boxShadow: "0 6px 16px rgba(124,58,237,0.28)",
                      }}
                    >
                      <IconBoard />
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "15.5px",
                        fontWeight: 700,
                        color: "#1E1B4B",
                        letterSpacing: "-0.2px",
                        paddingRight: "70px", // keep title clear of action icons
                      }}
                    >
                      {board.title}
                    </h3>

                    <p
                      style={{
                        margin: "6px 0 10px",
                        fontSize: "12.5px",
                        color: "#8B82A8",
                        lineHeight: 1.5,
                      }}
                    >
                      {board.description || "No description yet."}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "11.5px",
                        color: "#A89FC4",
                        fontWeight: 600,
                      }}
                    >
                      Owner: {board.owner_name || board.owner_email || "Unknown"}
                    </p>
                  </div>

                  {/* ✅ VIEW BOARD */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/boards/${board.id}`);
                    }}
                    className="bwd-view-btn"
                    style={{
                      marginTop: "16px",
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "11px",
                      border: "none",
                      background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "13px",
                      boxShadow: "0 6px 16px rgba(124,58,237,0.28)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                    }}
                  >
                    View Board
                    <IconArrowRight />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardsDashboard;
// import { useEffect, useState } from "react";
// import { api } from "../../services/api";
// import Navbar from "../../components/layout/Navbar";
// import { useNavigate } from "react-router-dom";

// type Board = {
//   id: string;
//   title: string;
//   description?: string | null;
//   owner_name?: string;
//   owner_email?: string;
// };

// const BoardsDashboard = () => {
//   const [boards, setBoards] = useState<Board[]>([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [search, setSearch] = useState("");
//   const [showArchived, setShowArchived] = useState(false);
//   const navigate = useNavigate();

//   // ✅ FETCH BOARDS (✅ FIXED ENDPOINT)
//   const fetchBoards = async () => {
//     try {
//       const url = showArchived
//         ? "/boards/archived"
//         : "/boards/personal";   // ✅ FIXED - use /personal for personal boards

//       const res = await api.get(url);

//       console.log("BOARDS API:", res.data);

//       setBoards(res.data || []);
//     } catch (err) {
//       console.error("Error fetching boards", err);
//       setBoards([]); // ✅ fallback safety
//     }
//   };

//   // ✅ FETCH ON LOAD + TOGGLE
//   useEffect(() => {
//     fetchBoards();
//   }, [showArchived]);

//   useEffect(() => {
//     console.log("Boards page loaded");
//   }, []);

//   // ✅ CREATE BOARD
//   const createBoard = async () => {
//     if (!title) return;

//     try {
//       console.log("Creating board:", title);
//       const res = await api.post("/boards/", {
//         title: title,
//         description: description || null,
//         team_id: null,
//       });

//       console.log("Board created successfully:", res.data);
//       setTitle("");
//       setDescription("");
//       fetchBoards();
//     } catch (err) {
//       console.error("Error creating board", err);
//     }
//   };

//   return (
//     <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
//       <Navbar />

//       <div style={{ padding: "20px" }}>
//         <h2>Boards</h2>

//         {/* ✅ TOGGLE */}
//         <button
//           onClick={() => setShowArchived((prev) => !prev)}
//           style={{
//             marginBottom: "15px",
//             padding: "8px 12px",
//             borderRadius: "6px",
//             border: "none",
//             background: "#6366f1",
//             color: "#fff",
//             cursor: "pointer",
//           }}
//         >
//           {showArchived ? "Back to Active Boards" : "View Archived"}
//         </button>

//         {/* ✅ SEARCH */}
//         <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search boards or owner"
//             style={{
//               flex: 1,
//               minWidth: "240px",
//               padding: "10px",
//               borderRadius: "8px",
//               border: "1px solid #ccc",
//             }}
//           />
//           <button
//             onClick={() => setSearch("")}
//             style={{
//               padding: "10px 16px",
//               borderRadius: "8px",
//               border: "none",
//               background: "#e5e7eb",
//               color: "#111827",
//               cursor: "pointer",
//             }}
//           >
//             Clear
//           </button>
//         </div>

//         {/* ✅ CREATE */}
//         <div style={{ marginBottom: "20px" }}>
//           <input
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Create new board"
//             style={{
//               padding: "10px",
//               borderRadius: "8px",
//               border: "1px solid #ccc",
//               marginRight: "10px",
//             }}
//           />
//           <input
//   value={description}
//   onChange={(e) => setDescription(e.target.value)}
//   placeholder="Board description"
//   style={{
//     padding: "10px",
//     borderRadius: "8px",
//     border: "1px solid #ccc",
//     marginRight: "10px",
//     marginTop: "10px"
//   }}
// />
//           <button onClick={createBoard}>Create</button>
//         </div>

//         {/* ✅ BOARDS GRID */}
//         <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
//           {boards.filter((board) => {
//             const query = search.toLowerCase();
//             return (
//               board.title.toLowerCase().includes(query) ||
//               board.owner_name?.toLowerCase().includes(query) ||
//               board.owner_email?.toLowerCase().includes(query)
//             );
//           }).length === 0 ? (
//             <p>No boards found 🚫</p>
//           ) : (
//             boards.filter((board) => {
//               const query = search.toLowerCase();
//               return (
//                 board.title.toLowerCase().includes(query) ||
//                 board.owner_name?.toLowerCase().includes(query) ||
//                 board.owner_email?.toLowerCase().includes(query)
//               );
//             }).map((board) => (
//               <div
//                 key={board.id}
//                 style={{
//                   position: "relative",
//                   width: "260px",
//                   minHeight: "150px",
//                   background: "linear-gradient(135deg, #4f46e5, #6366f1)",
//                   color: "#fff",
//                   borderRadius: "16px",
//                   padding: "20px",
//                   cursor: "pointer",
//                   boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 {/* ✅ ACTIONS */}
//                 <div
//                   style={{
//                     position: "absolute",
//                     top: "8px",
//                     right: "10px",
//                     display: "flex",
//                     gap: "10px",
//                   }}
//                 >
//                   {/* DELETE */}
//                   <span
//                     onClick={async (e) => {
//                       e.stopPropagation();
//                       if (!confirm("Delete this board?")) return;

//                       try {
//                         await api.delete(`/boards/${board.id}`);
//                         fetchBoards();
//                       } catch (err) {
//                         console.error("Delete failed", err);
//                       }
//                     }}
//                   >
//                     🗑️
//                   </span>

//                   {/* ARCHIVE */}
//                   <span
//                     onClick={async (e) => {
//                       e.stopPropagation();

//                       try {
//                         await api.patch(`/boards/${board.id}/archive`);
//                         fetchBoards();
//                       } catch (err) {
//                         console.error("Archive failed", err);
//                       }
//                     }}
//                   >
//                     {showArchived ? "♻️" : "📦"}
//                   </span>
//                 </div>

//                 <div style={{ width: "100%" }}>
//                   <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{board.title}</h3>
//                   <p style={{ margin: "8px 0 4px", fontSize: "0.9rem", opacity: 0.9 }}>
//                     {board.description || "No description yet."}
//                   </p>
//                   <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.85 }}>
//                     Owner: {board.owner_name || board.owner_email || "Unknown"}
//                   </p>
//                 </div>

//                 <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate(`/boards/${board.id}`);
//                     }}
//                     style={{
//                       flex: 1,
//                       padding: "10px 14px",
//                       borderRadius: "10px",
//                       border: "none",
//                       background: "rgba(255,255,255,0.18)",
//                       color: "#fff",
//                       cursor: "pointer",
//                       fontWeight: 600,
//                     }}
//                   >
//                     View Board
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BoardsDashboard;