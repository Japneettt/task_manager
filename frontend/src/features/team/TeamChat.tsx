
import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

type Sender = { id: string; name: string; avatar?: string };
type TeamMessage = {
  id: string;
  team_id: string;
  content: string;
  sender: Sender;
  mentioned_user_ids: string[];
  created_at: string;
};

type Props = {
  teamId: string;
  members: { id: string; name: string }[];
  currentUserId: string;
  // pass the live message coming from your shared websocket handler
  incomingMessage?: TeamMessage | null;
  // ✅ optional — lets the parent close the floating panel from its own header
  onClose?: () => void;
};

const STYLE_ID = "wkv-team-chat-styles";
function injectChatStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = `
    .wkv-chat * { box-sizing: border-box; }

    .wkv-chat-scroll::-webkit-scrollbar { width: 5px; }
    .wkv-chat-scroll::-webkit-scrollbar-track { background: transparent; }
    .wkv-chat-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.20); border-radius: 8px; }

    .wkv-chat-close {
      transition: background 0.15s ease, transform 0.15s ease;
    }
    .wkv-chat-close:hover {
      background: rgba(255,255,255,0.22);
      transform: rotate(90deg);
    }

    .wkv-chat-send {
      transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.15s ease;
    }
    .wkv-chat-send:hover { transform: translateY(-1px) scale(1.04); box-shadow: 0 8px 18px rgba(124,58,237,0.40); }
    .wkv-chat-send:active { transform: scale(0.95); }

    .wkv-chat-input:focus {
      border-color: #8b5cf6 !important;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.14) !important;
    }

    .wkv-chat-mention-row {
      transition: background 0.12s ease;
    }
    .wkv-chat-mention-row:hover { background: #F5F3FF; }

    @keyframes wkv-chat-bubble-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .wkv-chat-bubble { animation: wkv-chat-bubble-in 0.22s ease both; }
  `;
  document.head.appendChild(tag);
}

const avatarGradients = [
  "linear-gradient(135deg,#7C3AED,#6366F1)",
  "linear-gradient(135deg,#A78BFA,#7C3AED)",
  "linear-gradient(135deg,#EC4899,#A78BFA)",
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
];
const gradientFor = (key: string) =>
  avatarGradients[key.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % avatarGradients.length];

const initials = (name?: string) =>
  (name || "").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const TeamChat = ({ teamId, members, currentUserId, incomingMessage, onClose }: Props) => {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectChatStyles();
  }, []);

  // ✅ Load history when chat opens
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get(`/teams/${teamId}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load team messages", err);
      }
    };
    loadHistory();
  }, [teamId]);

  // ✅ Append messages arriving live over the websocket
  useEffect(() => {
    if (incomingMessage && incomingMessage.team_id === teamId) {
      setMessages((prev) => {
        // avoid duplicate if this is our own message already added optimistically
        if (prev.some((m) => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
    }
  }, [incomingMessage, teamId]);

  // ✅ auto-scroll to latest
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInput(value);

    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1) {
      const afterAt = value.slice(lastAt + 1);
      // only treat as an active mention if there's no space yet after @
      if (!afterAt.includes(" ")) {
        setMentionQuery(afterAt.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (name: string) => {
    const lastAt = input.lastIndexOf("@");
    const before = input.slice(0, lastAt);
    const firstName = name.split(" ")[0];
    setInput(`${before}@${firstName} `);
    setShowMentions(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    setShowMentions(false);

    try {
      const res = await api.post(`/teams/${teamId}/messages`, { content });
      // add immediately for snappy UX; incoming websocket echo is deduped above
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Message failed to send");
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(mentionQuery)
  );

  const renderContent = (text: string, isMine: boolean) => {
    // highlight @mentions visually
    const parts = text.split(/(@[A-Za-z0-9_.]+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span
          key={i}
          style={{
            color: isMine ? "#fff" : "#7C3AED",
            fontWeight: 700,
            background: isMine ? "rgba(255,255,255,0.18)" : "rgba(124,58,237,0.10)",
            padding: "0 4px",
            borderRadius: "5px",
          }}
        >
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div
      className="wkv-chat"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(22px)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "16px 18px",
          background: "linear-gradient(135deg,#7C3AED 0%,#6366F1 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "9px",
              background: "rgba(255,255,255,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "14.5px", letterSpacing: "-0.2px" }}>
            Team Chat
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="wkv-chat-close"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close team chat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        className="wkv-chat-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px",
          background:
            "radial-gradient(800px 400px at 0% 0%, rgba(124,58,237,0.05), transparent 60%)",
        }}
      >
        {messages.map((msg) => {
          const isMine = msg.sender.id === currentUserId;
          const wasMentioned = msg.mentioned_user_ids.includes(currentUserId);

          return (
            <div
              key={msg.id}
              className="wkv-chat-bubble"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMine ? "flex-end" : "flex-start",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                  flexDirection: isMine ? "row-reverse" : "row",
                }}
              >
                {!isMine && (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: gradientFor(msg.sender.name || msg.sender.id),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8.5px",
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {initials(msg.sender.name)}
                  </div>
                )}
                <div style={{ fontSize: "11px", color: "#9389B0", fontWeight: 500 }}>
                  {isMine ? "You" : msg.sender.name} ·{" "}
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: wasMentioned
                    ? "linear-gradient(135deg,#FEF3C7,#FDE68A)"
                    : isMine
                    ? "linear-gradient(135deg,#7C3AED,#6366F1)"
                    : "#F3F0FB",
                  color: isMine ? "white" : wasMentioned ? "#78350F" : "#1E1B4B",
                  fontSize: "13.5px",
                  lineHeight: 1.45,
                  boxShadow: isMine
                    ? "0 6px 16px rgba(124,58,237,0.28)"
                    : "0 2px 8px rgba(76,29,149,0.06)",
                }}
              >
                {renderContent(msg.content, isMine)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(124,58,237,0.10)",
          position: "relative",
          background: "rgba(255,255,255,0.65)",
          flexShrink: 0,
        }}
      >
        {showMentions && filteredMembers.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "62px",
              left: "16px",
              right: "16px",
              background: "white",
              border: "1px solid rgba(124,58,237,0.14)",
              borderRadius: "12px",
              boxShadow: "0 10px 28px rgba(76,29,149,0.18)",
              maxHeight: "170px",
              overflowY: "auto",
              zIndex: 10,
              padding: "6px",
            }}
          >
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="wkv-chat-mention-row"
                onClick={() => insertMention(m.name)}
                style={{
                  padding: "9px 10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  borderRadius: "8px",
                  color: "#1E1B4B",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span style={{ color: "#7C3AED", fontWeight: 700 }}>@</span>
                {m.name}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !showMentions) sendMessage();
            }}
            placeholder="Type a message... use @ to mention someone"
            className="wkv-chat-input"
            style={{
              flex: 1,
              padding: "11px 15px",
              borderRadius: "13px",
              border: "1.5px solid #E5E0F5",
              outline: "none",
              fontSize: "13px",
              background: "#FBFAFE",
              color: "#1E1B4B",
            }}
          />
          <button
            onClick={sendMessage}
            className="wkv-chat-send"
            style={{
              background: "linear-gradient(135deg,#7C3AED,#6366F1)",
              border: "none",
              color: "white",
              width: "42px",
              height: "42px",
              borderRadius: "13px",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(124,58,237,0.32)",
            }}
            aria-label="Send message"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
// import { useEffect, useRef, useState } from "react";
// import { api } from "../../services/api";
// type Sender = { id: string; name: string; avatar?: string };
// type TeamMessage = {
//   id: string;
//   team_id: string;
//   content: string;
//   sender: Sender;
//   mentioned_user_ids: string[];
//   created_at: string;
// };

// type Props = {
//   teamId: string;
//   members: { id: string; name: string }[];
//   currentUserId: string;
//   // pass the live message coming from your shared websocket handler
//   incomingMessage?: TeamMessage | null;
// };

// const TeamChat = ({ teamId, members, currentUserId, incomingMessage }: Props) => {
//   const [messages, setMessages] = useState<TeamMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [showMentions, setShowMentions] = useState(false);
//   const [mentionQuery, setMentionQuery] = useState("");
//   const bottomRef = useRef<HTMLDivElement>(null);

//   // ✅ Load history when chat opens
//   useEffect(() => {
//     const loadHistory = async () => {
//       try {
//         const res = await api.get(`/teams/${teamId}/messages`);
//         setMessages(res.data);
//       } catch (err) {
//         console.error("Failed to load team messages", err);
//       }
//     };
//     loadHistory();
//   }, [teamId]);

//   // ✅ Append messages arriving live over the websocket
//   useEffect(() => {
//     if (incomingMessage && incomingMessage.team_id === teamId) {
//       setMessages((prev) => {
//         // avoid duplicate if this is our own message already added optimistically
//         if (prev.some((m) => m.id === incomingMessage.id)) return prev;
//         return [...prev, incomingMessage];
//       });
//     }
//   }, [incomingMessage, teamId]);

//   // ✅ auto-scroll to latest
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleInputChange = (value: string) => {
//     setInput(value);

//     const lastAt = value.lastIndexOf("@");
//     if (lastAt !== -1) {
//       const afterAt = value.slice(lastAt + 1);
//       // only treat as an active mention if there's no space yet after @
//       if (!afterAt.includes(" ")) {
//         setMentionQuery(afterAt.toLowerCase());
//         setShowMentions(true);
//         return;
//       }
//     }
//     setShowMentions(false);
//   };

//   const insertMention = (name: string) => {
//     const lastAt = input.lastIndexOf("@");
//     const before = input.slice(0, lastAt);
//     const firstName = name.split(" ")[0];
//     setInput(`${before}@${firstName} `);
//     setShowMentions(false);
//   };

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     const content = input.trim();
//     setInput("");
//     setShowMentions(false);

//     try {
//       const res = await api.post(`/teams/${teamId}/messages`, { content });
//       // add immediately for snappy UX; incoming websocket echo is deduped above
//       setMessages((prev) => {
//         if (prev.some((m) => m.id === res.data.id)) return prev;
//         return [...prev, res.data];
//       });
//     } catch (err) {
//       console.error("Failed to send message", err);
//       alert("Message failed to send");
//     }
//   };

//   const filteredMembers = members.filter((m) =>
//     m.name.toLowerCase().includes(mentionQuery)
//   );

//   const renderContent = (text: string) => {
//     // highlight @mentions visually
//     const parts = text.split(/(@[A-Za-z0-9_.]+)/g);
//     return parts.map((part, i) =>
//       part.startsWith("@") ? (
//         <span key={i} style={{ color: "#6366f1", fontWeight: 600 }}>
//           {part}
//         </span>
//       ) : (
//         <span key={i}>{part}</span>
//       )
//     );
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100%",
//         background: "white",
//         borderRadius: "14px",
//         overflow: "hidden",
//       }}
//     >
//       <div style={{ padding: "14px 18px", borderBottom: "1px solid #eee", fontWeight: 600 }}>
//         Team Chat
//       </div>

//       <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
//         {messages.map((msg) => {
//           const isMine = msg.sender.id === currentUserId;
//           const wasMentioned = msg.mentioned_user_ids.includes(currentUserId);

//           return (
//             <div
//               key={msg.id}
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: isMine ? "flex-end" : "flex-start",
//                 marginBottom: "12px",
//               }}
//             >
//               <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>
//                 {isMine ? "You" : msg.sender.name} ·{" "}
//                 {new Date(msg.created_at).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </div>
//               <div
//                 style={{
//                   maxWidth: "70%",
//                   padding: "10px 14px",
//                   borderRadius: "12px",
//                   background: wasMentioned
//                     ? "#fef3c7"
//                     : isMine
//                     ? "#6366f1"
//                     : "#f1f5f9",
//                   color: isMine ? "white" : "#111827",
//                   fontSize: "14px",
//                   lineHeight: 1.4,
//                 }}
//               >
//                 {renderContent(msg.content)}
//               </div>
//             </div>
//           );
//         })}
//         <div ref={bottomRef} />
//       </div>

//       <div style={{ padding: "12px 18px", borderTop: "1px solid #eee", position: "relative" }}>
//         {showMentions && filteredMembers.length > 0 && (
//           <div
//             style={{
//               position: "absolute",
//               bottom: "60px",
//               left: "18px",
//               right: "18px",
//               background: "white",
//               border: "1px solid #e5e7eb",
//               borderRadius: "10px",
//               boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
//               maxHeight: "180px",
//               overflowY: "auto",
//               zIndex: 10,
//             }}
//           >
//             {filteredMembers.map((m) => (
//               <div
//                 key={m.id}
//                 onClick={() => insertMention(m.name)}
//                 style={{
//                   padding: "10px 14px",
//                   cursor: "pointer",
//                   fontSize: "14px",
//                 }}
//                 onMouseDown={(e) => e.preventDefault()}
//               >
//                 @{m.name}
//               </div>
//             ))}
//           </div>
//         )}

//         <div style={{ display: "flex", gap: "10px" }}>
//           <input
//             value={input}
//             onChange={(e) => handleInputChange(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !showMentions) sendMessage();
//             }}
//             placeholder="Type a message... use @ to mention someone"
//             style={{
//               flex: 1,
//               padding: "10px 14px",
//               borderRadius: "10px",
//               border: "1px solid #ddd",
//             }}
//           />
//           <button
//             onClick={sendMessage}
//             style={{
//               background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//               border: "none",
//               color: "white",
//               padding: "10px 18px",
//               borderRadius: "10px",
//               cursor: "pointer",
//             }}
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeamChat