
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate , useLocation} from "react-router-dom";
import { api, connectNotificationSocket } from "../../services/api";
import AddList from "../../features/board/AddList";
import AddCard from "../../features/board/AddCard";
import Navbar from "../../components/layout/Navbar";
import TeamChat from "../../features/team/TeamChat";
import CardComments from "../../features/team/CardComments";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

/* ─────────────────────────────────────────────────────────
   ✅ ONE-TIME STYLE INJECTION (hover states, animations)
   Pure CSS only — no functionality, no logic changes.
───────────────────────────────────────────────────────── */
const STYLE_ID = "wkv-team-dashboard-styles";
function injectDashboardStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lexend:wght@500;600;700;800&display=swap');

    .wkv * { box-sizing: border-box; }

    .wkv-member-row {
      transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s cubic-bezier(.4,0,.2,1), background 0.22s;
    }
    .wkv-member-row:hover {
      transform: translateY(-2px);
      background: #ffffff !important;
      box-shadow: 0 10px 24px rgba(124,58,237,0.14);
    }

    .wkv-add-btn {
      transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.15s ease;
    }
    .wkv-add-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(124,58,237,0.38);
    }
    .wkv-add-btn:active { transform: translateY(0) scale(0.98); }

    .wkv-board-card {
      transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s cubic-bezier(.4,0,.2,1);
    }
    .wkv-board-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(124,58,237,0.28);
    }

    .wkv-chat-fab {
      transition: transform 0.15s ease, box-shadow 0.2s ease;
    }
    .wkv-chat-fab:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 26px rgba(124,58,237,0.45);
    }

    .wkv-upload-cover {
      cursor: pointer;
    }

    .wkv-create-input:focus {
      border-color: #8b5cf6 !important;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.14) !important;
    }

    .wkv-modal-close {
      transition: background 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
    }
    .wkv-modal-close:hover {
      background: #FEE2E2;
      border-color: rgba(239,68,68,0.35);
      transform: scale(1.05);
    }
    .wkv-modal-close:hover svg { stroke: #DC2626; }
    .wkv-modal-close:active { transform: scale(0.95); }

    .wkv-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .wkv-scroll::-webkit-scrollbar-track { background: transparent; }
    .wkv-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.22); border-radius: 8px; }

    @keyframes wkv-fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
      @keyframes cardGlow {
  0% {
    box-shadow: 0 0 0 rgba(196,181,253,0.2);
  }

  50% {
    box-shadow: 0 0 18px rgba(196,181,253,0.8);
  }

  100% {
    box-shadow: 0 0 0 rgba(196,181,253,0.2);
  }
}
    @keyframes wkv-slideIn {
      from { opacity: 0; transform: translateX(28px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .wkv-fadeup { animation: wkv-fadeUp 0.36s cubic-bezier(.4,0,.2,1) both; }
    .wkv-slidein { animation: wkv-slideIn 0.32s cubic-bezier(.4,0,.2,1) both; }

    .wkv-pending-row {
      transition: background 0.18s ease;
    }
    .wkv-pending-row:hover { background: #ffffff !important; }

    .wkv-back-btn {
      transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }
    .wkv-back-btn:hover {
      background: #ffffff !important;
      transform: translateX(-2px);
      box-shadow: 0 6px 16px rgba(124,58,237,0.16);
    }
  `;
  document.head.appendChild(tag);
}

/* ── Soft decorative blob shapes for the cover banner ── */
const CoverBlobs = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 800 220"
    preserveAspectRatio="none"
    style={{ position: "absolute", inset: 0 }}
  >
    <defs>
      <linearGradient id="wkvBlobA" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wkvBlobB" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
      </linearGradient>
    </defs>
    <circle cx="680" cy="40" r="160" fill="url(#wkvBlobA)" />
    <circle cx="120" cy="200" r="140" fill="url(#wkvBlobB)" />
    <circle cx="420" cy="-30" r="110" fill="url(#wkvBlobA)" />
  </svg>
);

/* ── how many rows are visible before the list scrolls ── */
const VISIBLE_ROWS = 3;
const ROW_HEIGHT = 64; // px — approximate height of one member/invite row incl. gap

const TeamDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

const boardIdFromUrl =
  new URLSearchParams(location.search).get("boardId");

const cardIdFromUrl =
  new URLSearchParams(location.search).get("cardId");

  const [team, setTeam] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [openBoard, setOpenBoard] = useState<any>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [incomingTeamMessage, setIncomingTeamMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  // ✅ CARD COMMENTS STATE
  const [openCommentsCardId, setOpenCommentsCardId] = useState<string | null>(null);
  const [incomingCardComment, setIncomingCardComment] = useState<any>(null);
  // ✅ COVER UPLOAD STATE
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    injectDashboardStyles();
  }, []);

  const openAttachment = (attachmentUrl: string) => {
    window.open(
      `http://localhost:8000${attachmentUrl}`,
      "_blank"
    );
  };

  const downloadAttachment = (
    attachmentUrl: string,
    attachmentName?: string
  ) => {
    const link = document.createElement("a");

    link.href = `http://localhost:8000${attachmentUrl}`;

    link.download =
      attachmentName || "attachment";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const fetchData = async () => {
    try {
      const teamRes = await api.get(`/teams/${id}`);
      setTeam(teamRes.data);

      const boardsRes = await api.get(`/boards/teams/${id}/boards`);
      setBoards(boardsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);
//   useEffect(() => {
//   const openTargetBoard = async () => {
//     if (!boardIdFromUrl) return;

//     try {
//       const res = await api.get(
//         `/boards/${boardIdFromUrl}`
//       );

//       setOpenBoard(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   openTargetBoard();
// }, [boardIdFromUrl]);
useEffect(() => {
  const openTargetBoard = async () => {
    if (!boardIdFromUrl) return;

    try {
      const res = await api.get(
        `/boards/${boardIdFromUrl}`
      );

      setOpenBoard(res.data);

      if (cardIdFromUrl) {
        setActiveHighlightId(cardIdFromUrl);

        setTimeout(() => {
          const cardElement =
            document.getElementById(
              `card-${cardIdFromUrl}`
            );

          if (cardElement) {
            cardElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 800);

        setTimeout(() => {
          setActiveHighlightId(null);
        }, 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  openTargetBoard();
}, [boardIdFromUrl, cardIdFromUrl]);

  // ✅ TEAM CHAT WEBSOCKET — same pattern used in Dashboard.tsx / InboxPage.tsx
  useEffect(() => {
    const ws = connectNotificationSocket((data) => {
      if (data.type === "team_message") {
        setIncomingTeamMessage(data.data);
      } else if (data.type === "card_comment") {
        setIncomingCardComment(data.data);
      }
    });
    wsRef.current = ws;
    return () => ws?.close();
  }, []);

  const createBoard = async () => {
    if (!title) return;

    await api.post("/boards/", {
      title,
      team_id: id
    });

    setTitle("");
    fetchData();
  };

  const addEmail = () => {
    if (!inviteInput) return;
    setInviteEmails([...inviteEmails, inviteInput]);
    setInviteInput("");
  };

  const sendInvite = async () => {
    if (inviteEmails.length === 0) {
      alert("Add at least one email ❗");
      return;
    }

    try {
      await api.post(`/teams/${id}/invite`, {
        emails: inviteEmails,
      });

      alert("Invite sent ✅");

      // ✅ RESET
      setInviteEmails([]);
      setInviteInput("");
      setShowInviteModal(false);

      // ✅ REFRESH TEAM DATA
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed ❌");
    }
  };

  // ✅ COVER UPLOAD HANDLER
  const handleCoverSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      await api.patch(`/teams/${id}/cover`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchData();
    } catch (err) {
      console.error("Cover upload failed", err);
      alert("Failed to upload cover ❌");
    } finally {
      setUploadingCover(false);
      // reset so selecting the same file again still fires onChange
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  /* ── helpers (display-only, no functional impact) ── */
  const initials = (name?: string) =>
    (name || "")
      .split(" ")
      .map((x) => x[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const memberAvatarGradients = [
    "linear-gradient(135deg,#7C3AED,#6366F1)",
    "linear-gradient(135deg,#A78BFA,#7C3AED)",
    "linear-gradient(135deg,#EC4899,#A78BFA)",
    "linear-gradient(135deg,#6366F1,#8B5CF6)",
  ];
  const avatarGradientFor = (key: string) =>
    memberAvatarGradients[
    key.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % memberAvatarGradients.length
    ];

  const timeAgo = (d?: string) => {
    if (!d) return "";
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div
      className="wkv"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #f3effe 0%, transparent 60%), radial-gradient(1000px 600px at 100% 0%, #eef2ff 0%, transparent 55%), #f8f7fc",
        minHeight: "100vh",
        padding: "0 30px 20px", // ✅ no top padding — removes gap above navbar
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <Navbar />
      <div
  style={{
    padding: "16px 10px 20px",
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto"
  }}
>
      {/* <div style={{ padding: "16px 30px 20px", maxWidth: 1180, margin: "0 auto" }}> */}

        {/* ══════════════════ BACK BUTTON ══════════════════ */}
        <button
          onClick={() => navigate(-1)}
          className="wkv-back-btn wkv-fadeup"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(124,58,237,0.12)",
            borderRadius: "10px",
            padding: "7px 14px",
            cursor: "pointer",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "#4C3D7A",
            marginBottom: "14px",
            boxShadow: "0 4px 14px rgba(124,58,237,0.08)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        {/* ══════════════════ TEAM HEADER / COVER (everything overlaid on the image) ══════════════════ */}
        <div
          className="wkv-fadeup"
          style={{
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(124,58,237,0.16), 0 2px 8px rgba(31,16,72,0.06)",
            border: "1px solid rgba(124,58,237,0.10)",
            minHeight: "260px",
          }}
        >
          {/* hidden file input shared by both cover states */}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverSelected}
            style={{ display: "none" }}
          />

          {/* COVER — fills the whole header, content sits on top of it */}
          {team?.image_url ? (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="wkv-upload-cover"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(http://localhost:8000${team.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              title="Click to change cover"
            />
          ) : (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="wkv-upload-cover"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, #ddd6fe 0%, #ede9fe 45%, #e0e7ff 100%)",
                overflow: "hidden",
              }}
            >
              <CoverBlobs />
            </div>
          )}

          {/* readability gradient over the image — darker toward the bottom where text sits */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: team?.image_url
                ? "linear-gradient(180deg, rgba(20,10,50,0.10) 0%, rgba(20,10,50,0.35) 55%, rgba(15,8,40,0.78) 100%)"
                : "linear-gradient(180deg, rgba(76,29,149,0.02) 0%, rgba(40,20,90,0.18) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* camera badge — top-right, always visible, no hover state */}
          <div
            onClick={() => coverInputRef.current?.click()}
            className="wkv-upload-cover"
            style={{
              position: "absolute",
              top: "14px",
              right: "16px",
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(20,10,50,0.45)",
              backdropFilter: "blur(8px)",
              zIndex: 2,
            }}
            title="Click to change cover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="14" rx="3" />
              <circle cx="8.5" cy="9" r="1.5" />
              <path d="M21 15l-5-5-9 9" />
            </svg>
          </div>

          {uploadingCover && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(20,10,50,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                zIndex: 3,
              }}
            >
              Uploading…
            </div>
          )}

          {/* ── content overlay: name, description, stats, chat button — all on the image ──
               pointerEvents:none on the wrapper so clicks pass through to the cover image
               beneath; re-enabled on the inner row that actually holds clickable elements. */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              minHeight: "260px",
              padding: "20px 24px",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap" as const,
                pointerEvents: "auto",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: "'Lexend', 'Inter', sans-serif",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "-0.4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                    }}
                  >
                    {team?.name}
                  </h2>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, cursor: "pointer" }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>

                {team?.description && (
                  <p
                    style={{
                      margin: "6px 0 12px",
                      color: "rgba(255,255,255,0.88)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      maxWidth: "520px",
                      textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                    }}
                  >
                    {team.description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap" as const,
                  }}
                >
                  <StatChip
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    }
                    label="Members"
                    value={team?.members?.length ?? 0}
                  />
                  <StatChip
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
                      </svg>
                    }
                    label="Boards"
                    value={boards?.length ?? 0}
                  />
                  <StatChip
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                      </svg>
                    }
                    label="Pending Invites"
                    value={team?.invites?.length ?? 0}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowChat(true)}
                className="wkv-chat-fab"
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                  border: "none",
                  color: "white",
                  padding: "9px 18px",
                  borderRadius: "11px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 6px 18px rgba(124,58,237,0.45)",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                Team Chat
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════ MEMBERS + INVITES ══════════════════ */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "24px",
            flexWrap: "wrap" as const,
          }}
        >
          {/* ── MEMBERS CARD ── */}
          <div
            className="wkv-fadeup"
            style={{
              flex: 1,
              minWidth: "320px",
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(16px)",
              padding: "22px",
              borderRadius: "20px",
              boxShadow: "0 10px 32px rgba(124,58,237,0.10)",
              border: "1px solid rgba(124,58,237,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1E1B4B" }}>
                Members ({team?.members?.length ?? 0})
              </h4>

              <button
                onClick={() => setShowInviteModal(true)}
                className="wkv-add-btn"
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                  border: "none",
                  color: "white",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(124,58,237,0.30)",
                }}
              >
                + Add Member
              </button>
            </div>

            {/* ✅ fixed-height scrollable list — shows ~3 rows, scrolls beyond that */}
            <div
              className="wkv-scroll"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: `${VISIBLE_ROWS * ROW_HEIGHT}px`,
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >

              {[...(team?.members || [])]
                .sort((a: any, b: any) => {
                  if (a.role?.toLowerCase() === "owner") return -1;
                  if (b.role?.toLowerCase() === "owner") return 1;
                  return 0;
                })
                .map((m: any) => (
                  <div
                    key={m.id}
                    className="wkv-member-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px", // ✅ reduced vertical padding
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.55)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "36px", // ✅ slightly smaller avatar to match tighter row
                        height: "36px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: avatarGradientFor(m.name || m.id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: "12px",
                        flexShrink: 0,
                        boxShadow: "0 3px 10px rgba(124,58,237,0.25)",
                      }}
                    >
                      {m.avatar ? (
                        <img
                          src={`http://localhost:8000/${m.avatar}`}
                          alt="avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span>{initials(m.name)}</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            color: "#1E1B4B",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {m.name}
                        </div>

                        <div
                          style={{
                            fontSize: "10px",
                            padding: "2px 9px",
                            borderRadius: "999px",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            flexShrink: 0,
                            background:
                              m.role === "owner"
                                ? "#FEF3C7"
                                : m.role === "admin"
                                  ? "#D9F2E3"
                                  : "#EDE9FE",
                            color:
                              m.role === "owner"
                                ? "#B45309"
                                : m.role === "admin"
                                  ? "#15803D"
                                  : "#6D28D9",
                          }}
                        >
                          {m.role?.toUpperCase()}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#8B82A8",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {m.email}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ── PENDING INVITES CARD ── */}
          <div
            className="wkv-fadeup"
            style={{
              flex: 1,
              minWidth: "320px",
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(16px)",
              padding: "22px",
              borderRadius: "20px",
              boxShadow: "0 10px 32px rgba(124,58,237,0.10)",
              border: "1px solid rgba(124,58,237,0.08)",
            }}
          >
            <h4 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 700, color: "#1E1B4B" }}>
              Pending Invites ({team?.invites?.length ?? 0})
            </h4>

            {team?.invites?.length === 0 && (
              <div
                style={{
                  height: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "#A89FC4",
                }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg,#EDE9FE,#E0E7FF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                    boxShadow: "0 6px 18px rgba(124,58,237,0.14)",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>

                <div style={{ fontWeight: 700, color: "#1E1B4B", fontSize: "13.5px" }}>
                  No pending invites
                </div>

                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  Invite your team members to collaborate
                </div>
              </div>
            )}

            {/* ✅ fixed-height scrollable list — shows ~3 rows, scrolls beyond that */}
            <div
              className="wkv-scroll"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: team?.invites?.length ? `${VISIBLE_ROWS * ROW_HEIGHT}px` : undefined,
                overflowY: team?.invites?.length ? "auto" : undefined,
                paddingRight: "4px",
              }}
            >
              {team?.invites?.map((i: any, index: number) => (
                <div
                  key={index}
                  className="wkv-pending-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px", // ✅ reduced vertical padding
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.55)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg,#EDE9FE,#E0E7FF)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "12.5px",
                        color: "#1E1B4B",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {i.email}
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#A89FC4" }}>
                      {i.created_at ? `Invited ${timeAgo(i.created_at)}` : "Invitation pending"}
                    </div>
                  </div>

                  {/* ✅ NO RESEND BUTTON — status pill only */}
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#A16207",
                      background: "#FEF9C3",
                      padding: "2px 9px",
                      borderRadius: "999px",
                      flexShrink: 0,
                    }}
                  >
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════ CREATE BOARD ══════════════════ */}
        <div
          className="wkv-fadeup"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(16px)",
            marginTop: "20px",
            padding: "20px 22px",
            borderRadius: "18px",
            boxShadow: "0 8px 26px rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.08)",
          }}
        >
          <h4 style={{ margin: "0 0 12px", fontSize: "14.5px", fontWeight: 700, color: "#1E1B4B" }}>
            Create Board
          </h4>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board name..."
              className="wkv-create-input"
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "12px",
                border: "1.5px solid #E5E0F5",
                outline: "none",
                fontSize: "13.5px",
                background: "#FBFAFE",
                color: "#1E1B4B",
              }}
            />

            <button
              onClick={createBoard}
              className="wkv-add-btn"
              style={{
                background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                border: "none",
                color: "white",
                padding: "11px 22px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13.5px",
                boxShadow: "0 6px 16px rgba(124,58,237,0.30)",
              }}
            >
              Create
            </button>
          </div>
        </div>

        {/* ══════════════════ BOARDS ══════════════════ */}
        <div style={{ marginTop: "28px" }}>
          <h3 style={{ fontSize: "16.5px", fontWeight: 700, color: "#1E1B4B", marginBottom: "16px" }}>
            Boards
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "20px",
            }}
          >
            {boards.map((b, idx) => (
              <div
                key={b.id}
                onClick={async () => {
                  const res = await api.get(`/boards/${b.id}`);
                  setOpenBoard(res.data);
                }}
                className="wkv-board-card wkv-fadeup"
                style={{
                  padding: "24px",
                  borderRadius: "18px",
                  color: "white",
                  cursor: "pointer",
                  background:
                    idx % 3 === 0
                      ? "linear-gradient(135deg,#7C3AED 0%,#6366F1 100%)"
                      : idx % 3 === 1
                        ? "linear-gradient(135deg,#8B5CF6 0%,#A78BFA 100%)"
                        : "linear-gradient(135deg,#6D28D9 0%,#7C3AED 60%,#8B5CF6 100%)",
                  boxShadow: "0 14px 30px rgba(124,58,237,0.30)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.10)",
                  }}
                />
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                </div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "-0.2px", position: "relative", zIndex: 1 }}>
                  {b.title}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════ BOARD MODAL (Kanban) ══════════════════ */}
        {openBoard && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(30,16,75,0.45)",
              backdropFilter: "blur(2px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 900,
            }}
          >
            <div
              style={{
                width: "92%",
                height: "85%",
                background: "#f9fafb",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden", // ✅ contain everything inside the modal
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                  marginBottom: "4px",
                }}
              >
                <h2 style={{ margin: 0 }}>{openBoard.title}</h2>

                {/* ✅ SaaS-style close button (replaces ❌ emoji) */}
                <button
                  onClick={() => setOpenBoard(null)}
                  className="wkv-modal-close"
                  aria-label="Close board"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* ✅ scrollable row container — fills remaining modal height */}
              <DragDropContext
                onDragEnd={async (result) => {
                  if (!result.destination) return;

                  await api.patch(`/cards/${result.draggableId}/move`, null, {
                    params: {
                      list_id: result.destination.droppableId,
                      position: result.destination.index,
                    },
                  });

                  const res = await api.get(`/boards/${openBoard.id}`);
                  setOpenBoard(res.data);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    overflowX: "auto",
                    flex: 1,
                    minHeight: 0, // ✅ critical: lets children shrink instead of overflowing the modal
                    paddingBottom: "4px",
                  }}
                >
                  {openBoard.lists.map((list: any) => (
                    <Droppable key={list.id} droppableId={list.id.toString()}>
                      {(provided) => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            minWidth: "260px",
                            maxHeight: "100%", // ✅ each column never exceeds modal height
                            borderRadius: "16px",
                            background:
                              list.title.toLowerCase().includes("todo")
                                ? "#fde8e8"
                                : list.title.toLowerCase().includes("progress")
                                  ? "#e0ecff"
                                  : list.title.toLowerCase().includes("done")
                                    ? "#e6f6ec"
                                    : "#f5f3ff",
                            overflow: "hidden", // ✅ keep rounded corners while inner content scrolls
                          }}
                        >
                          {/* header stays fixed at top of column */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "15px 15px 10px",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                              }}
                            >
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background:
                                    list.title.toLowerCase().includes("todo")
                                      ? "#ef4444"
                                      : list.title.toLowerCase().includes("progress")
                                        ? "#3b82f6"
                                        : list.title.toLowerCase().includes("done")
                                          ? "#16a34a"
                                          : "#8b5cf6"
                                }}
                              />

                              <h4 style={{ margin: 0 }}>
                                {list.title === "InProgress"
                                  ? "In Progress"
                                  : list.title}
                              </h4>
                            </div>

                            {!["todo", "inprogress", "done"].includes(
                              list.title.toLowerCase()
                            ) && (
                                <button
                                  onClick={async () => {
                                    if (!window.confirm(`Delete "${list.title}"?`))
                                      return;

                                    try {
                                      await api.delete(`/boards/lists/${list.id}`);

                                      const res = await api.get(
                                        `/boards/${openBoard.id}`
                                      );

                                      setOpenBoard(res.data);
                                    } catch (err) {
                                      console.error(err);
                                      alert("Failed to delete list");
                                    }
                                  }}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: "#ef4444",
                                    fontSize: "18px"
                                  }}
                                >
                                  🗑️
                                </button>
                              )}
                          </div>

                          {/* ✅ scrollable card list — this is the part that was overflowing */}
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="wkv-scroll"
                            style={{
                              flex: 1,
                              minHeight: 0,
                              overflowY: "auto",
                              padding: "0 15px 15px",
                            }}
                          >
                            {list.cards.map((card: any, index: number) => (
                              <Draggable
                                key={card.id}
                                draggableId={card.id.toString()}
                                index={index}
                              >
                                {(provided) => (
                                  // <div
                                  //   ref={provided.innerRef}
                                  //   {...provided.dragHandleProps}
                                  //   {...provided.draggableProps}
                                  //   style={{
                                  //     background: "white",
                                  //     boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                  //     padding: "10px",
                                  //     borderRadius: "8px",
                                  //     marginBottom: "10px",
                                  //     ...provided.draggableProps.style,
                                  //   }}
                                  // >
                                  <div
  id={`card-${card.id}`}
  ref={provided.innerRef}
  {...provided.dragHandleProps}
  {...provided.draggableProps}
  style={{
    background:
      activeHighlightId === card.id
        ? "#F8F7FF"
        : "white",

    border:
      activeHighlightId === card.id
        ? "3px solid #C4B5FD"
        : "none",

    boxShadow:
      activeHighlightId === card.id
        ? "0 0 20px rgba(196,181,253,0.7)"
        : "0 4px 12px rgba(0,0,0,0.08)",
    
    animation:
      activeHighlightId === card.id
        ? "cardGlow 1.5s ease-in-out"
        : "none",


    transition: "all 0.4s ease",

    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",

    ...provided.draggableProps.style,
  }}
>
                                    <div
                                      style={{
                                        background: "white",
                                        borderRadius: "14px",
                                        padding: "14px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                                      }}
                                    >
                                      <h4
                                        style={{
                                          margin: 0,
                                          marginBottom: "8px",
                                          fontSize: "18px"
                                        }}
                                      >
                                        {card.title}
                                      </h4>

                                      {card.description && (
                                        <p
                                          style={{
                                            margin: "0 0 12px",
                                            color: "#64748b",
                                            fontSize: "14px"
                                          }}
                                        >
                                          {card.description}
                                        </p>
                                      )}

                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          marginTop: "10px"
                                        }}
                                      >
                                        <span
                                          style={{
                                            background:
                                              card.priority === "High"
                                                ? "#fee2e2"
                                                : card.priority === "Medium"
                                                  ? "#fef3c7"
                                                  : "#dcfce7",

                                            color:
                                              card.priority === "High"
                                                ? "#dc2626"
                                                : card.priority === "Medium"
                                                  ? "#d97706"
                                                  : "#16a34a",

                                            padding: "4px 10px",
                                            borderRadius: "999px",
                                            fontSize: "12px",
                                            fontWeight: 600
                                          }}
                                        >
                                          {card.priority}
                                        </span>
                                      </div>

                                      {card.assigned_member_name && (
                                        <div
                                          style={{
                                            marginTop: "10px",
                                            fontSize: "13px",
                                            color: "#475569"
                                          }}
                                        >
                                          👤 {card.assigned_member_name}
                                        </div>
                                      )}

                                      {card.attachment_url && (
                                        <div
                                          style={{
                                            marginTop: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            background: "#F8FAFC",
                                            border: "1px solid #E5E7EB",
                                            borderRadius: "8px",
                                            padding: "8px 10px",
                                          }}
                                        >
                                          <div
                                            onClick={() =>
                                              openAttachment(card.attachment_url)
                                            }
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "8px",
                                              cursor: "pointer",
                                              flex: 1,
                                            }}
                                          >
                                            📎
                                            <span
                                              style={{
                                                fontSize: "13px",
                                                color: "#374151",
                                                fontWeight: 500,
                                              }}
                                            >
                                              {card.attachment_name}
                                            </span>
                                          </div>

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              downloadAttachment(
                                                card.attachment_url,
                                                card.attachment_name
                                              );
                                            }}
                                            style={{
                                              border: "none",
                                              background: "transparent",
                                              cursor: "pointer",
                                              fontSize: "18px",
                                            }}
                                            title="Download"
                                          >
                                            ⬇️
                                          </button>
                                        </div>
                                      )}

                                      {card.due_date && (
                                        <div
                                          style={{
                                            marginTop: "8px",
                                            fontSize: "13px",
                                            color: "#64748b"
                                          }}
                                        >
                                          📅 {new Date(card.due_date).toLocaleDateString()}
                                        </div>
                                      )}

                                      {/* ✅ COMMENTS TOGGLE */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenCommentsCardId(
                                            openCommentsCardId === card.id ? null : card.id
                                          );
                                        }}
                                        style={{
                                          marginTop: "10px",
                                          border: "none",
                                          background: "transparent",
                                          color: "#6366f1",
                                          fontSize: "12.5px",
                                          fontWeight: 600,
                                          cursor: "pointer",
                                          padding: 0,
                                        }}
                                      >
                                        💬 {openCommentsCardId === card.id ? "Hide comments" : "Comments"}
                                      </button>

                                      {openCommentsCardId === card.id && (
                                        <CardComments
                                          cardId={card.id}
                                          members={team?.members || []}
                                          currentUserId={localStorage.getItem("userId") || ""}
                                          incomingComment={incomingCardComment}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}

                            <AddCard
                              listId={list.id}
                              boardId={openBoard.id}
                              refreshBoard={setOpenBoard}
                              members={team?.members}
                            />
                          </div>
                        </div>
                      )}
                    </Droppable>
                  ))}

                  <div style={{ flexShrink: 0 }}>
                    <AddList
                      boardId={openBoard.id}
                      refreshBoard={setOpenBoard}
                    />
                  </div>
                </div>
              </DragDropContext>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════ INVITE MODAL ══════════════════ */}
      {showInviteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30,16,75,0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="wkv-fadeup"
            style={{
              width: "400px",
              background: "#fff",
              padding: "28px",
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(76,29,149,0.25)",
              border: "1px solid rgba(124,58,237,0.08)",
            }}
          >
            <h3 style={{ margin: "0 0 4px", color: "#1E1B4B", fontSize: "17px", fontWeight: 700 }}>
              Invite Members 👥
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#8B82A8" }}>
              Add teammates by email — they'll get an invite link.
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="Enter email"
                className="wkv-create-input"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #E5E0F5",
                  outline: "none",
                  fontSize: "13.5px",
                  background: "#FBFAFE",
                }}
              />

              <button
                onClick={addEmail}
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                  color: "white",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Add
              </button>
            </div>

            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {inviteEmails.map((e, i) => (
                <div
                  key={i}
                  style={{
                    background: "#F5F3FF",
                    color: "#5B21B6",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {e}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #E5E0F5",
                  background: "white",
                  color: "#6B5B95",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>

              <button
                onClick={sendInvite}
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                  color: "white",
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  boxShadow: "0 6px 16px rgba(124,58,237,0.30)",
                }}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TEAM CHAT PANEL (slide from right) ══════════════════ */}
      {showChat && (
        <div
          className="wkv-slidein"
          style={{
            position: "fixed",
            top: "84px",
            right: "18px",
            bottom: "104px", // ✅ leaves room above the chatbot widget bottom-right
            width: "380px",
            maxWidth: "92vw",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            borderRadius: "22px",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(76,29,149,0.30), 0 2px 10px rgba(0,0,0,0.06)",
            border: "1px solid rgba(124,58,237,0.14)",
          }}
        >
          <TeamChat
            teamId={id!}
            members={team?.members || []}
            currentUserId={localStorage.getItem("userId") || ""}
            incomingMessage={incomingTeamMessage}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
};

/* ── small stat chip used in the header strip ── */
const StatChip = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "rgba(255,255,255,0.16)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.22)",
      padding: "7px 13px",
      borderRadius: "12px",
      fontSize: "12.5px",
      color: "rgba(255,255,255,0.92)",
    }}
  >
    <div
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "6px",
        background: "rgba(255,255,255,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <span style={{ fontWeight: 700, color: "#ffffff" }}>{value}</span>
    <span>{label}</span>
  </div>
);

export default TeamDashboard;
