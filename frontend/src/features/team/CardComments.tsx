import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

type Sender = { id: string; name: string; avatar?: string };
type CardComment = {
  id: string;
  card_id: string;
  content: string;
  sender: Sender;
  mentioned_user_ids: string[];
  created_at: string;
};

type Props = {
  cardId: string;
  members: { id: string; name: string }[];
  currentUserId: string;
  incomingComment?: CardComment | null;
};

const CardComments = ({ cardId, members, currentUserId, incomingComment }: Props) => {
  const [comments, setComments] = useState<CardComment[]>([]);
  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ load existing comments when this card's thread opens
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/cards/${cardId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments", err);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [cardId]);

  // ✅ append comments arriving live over the websocket
  useEffect(() => {
    if (incomingComment && incomingComment.card_id === cardId) {
      setComments((prev) => {
        if (prev.some((c) => c.id === incomingComment.id)) return prev;
        return [...prev, incomingComment];
      });
    }
  }, [incomingComment, cardId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleInputChange = (value: string) => {
    setInput(value);
    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1) {
      const afterAt = value.slice(lastAt + 1);
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
    setInput(`${before}@${name.split(" ")[0]} `);
    setShowMentions(false);
  };

  const sendComment = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    setShowMentions(false);

    try {
      const res = await api.post(`/cards/${cardId}/comments`, { content });
      setComments((prev) => {
        if (prev.some((c) => c.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      console.error("Failed to post comment", err);
      alert("Comment failed to send");
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(mentionQuery)
  );

  const renderContent = (text: string) => {
    const parts = text.split(/(@[A-Za-z0-9_.]+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} style={{ color: "#6366f1", fontWeight: 600 }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div
      style={{
        marginTop: "10px",
        borderTop: "1px solid #eee",
        paddingTop: "10px",
      }}
      onClick={(e) => e.stopPropagation()} // ✅ don't let clicks bubble up to card drag handlers
    >
      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>
        Comments
      </div>

      {loading ? (
        <div style={{ fontSize: "12px", color: "#9ca3af" }}>Loading comments...</div>
      ) : (
        <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "8px" }}>
          {comments.length === 0 && (
            <div style={{ fontSize: "12px", color: "#9ca3af", padding: "6px 0" }}>
              No comments yet. Start the discussion.
            </div>
          )}

          {comments.map((c) => {
            const wasMentioned = c.mentioned_user_ids.includes(currentUserId);
            return (
              <div key={c.id} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                  {c.sender.name} ·{" "}
                  {new Date(c.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    background: wasMentioned ? "#fef3c7" : "#f1f5f9",
                    fontSize: "12.5px",
                    marginTop: "2px",
                    lineHeight: 1.4,
                  }}
                >
                  {renderContent(c.content)}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ position: "relative" }}>
        {showMentions && filteredMembers.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              maxHeight: "140px",
              overflowY: "auto",
              zIndex: 20,
            }}
          >
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertMention(m.name)}
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: "12.5px" }}
              >
                @{m.name}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "6px" }}>
          <input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !showMentions) sendComment();
            }}
            placeholder="Add a comment... use @ to mention"
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "12.5px",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              sendComment();
            }}
            style={{
              background: "#6366f1",
              border: "none",
              color: "white",
              padding: "7px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12.5px",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardComments;