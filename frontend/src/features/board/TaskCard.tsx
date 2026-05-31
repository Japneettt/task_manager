import React, { useState, useRef, useEffect } from "react";
import { api } from "../../services/api";

type Card = {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string;
  badge?: string | null;
  assigned_to?: string | null;
};

type TaskCardProps = Card & {
  isDragging?: boolean;   // ✅ ADD THIS
  onEdit?: (card: Card) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
};

// ✅ Badge colors
const getBadgeColor = (badge?: string | null) => {
  if (!badge) return { bg: "#f1f5f9", text: "#64748b" };

  const b = badge.toLowerCase();

  if (b.includes("not")) return { bg: "#dbeafe", text: "#1d4ed8" };
  if (b.includes("progress")) return { bg: "#ede9fe", text: "#7c3aed" };
  if (b.includes("track")) return { bg: "#fee2e2", text: "#dc2626" };
  if (b.includes("done")) return { bg: "#dcfce7", text: "#16a34a" };

  return { bg: "#f1f5f9", text: "#64748b" };
};

// ✅ Priority colors
const getPriorityColor = (priority?: string) => {
  if (!priority) return { bg: "#e0f2fe", text: "#0284c7" };

  const p = priority.toLowerCase();

  if (p === "high") return { bg: "#fee2e2", text: "#dc2626" };
  if (p === "medium") return { bg: "#fef3c7", text: "#ca8a04" };
  return { bg: "#dbeafe", text: "#2563eb" };
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  due_date,
  priority,
  badge,
  assigned_to,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const badgeColor = getBadgeColor(badge);
  const priorityColor = getPriorityColor(priority);

  const formatDate = (date?: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this card?")) return;

    try {
      await api.delete(`/cards/${id}`);
      onDelete?.(id);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ click outside to close
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        marginBottom: "12px",
        position: "relative", // ✅ REQUIRED FOR DROPDOWN
      }}
    >
      {/* ✅ HEADER FIXED */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start", // ✅ KEY FIX
        }}
      >
        {/* LEFT SIDE (badge or placeholder) */}
        <div style={{ minHeight: "24px" }}>
          {badge ? (
            <span
              style={{
                background: badgeColor.bg,
                color: badgeColor.text,
                padding: "5px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>

        {/* RIGHT SIDE (always fixed) */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            border: "none",
            background: "#f1f5f9",
            borderRadius: "8px",
            padding: "6px 8px",
            cursor: "pointer",
            flexShrink: 0, // ✅ prevents shifting
          }}
        >
          ⋮
        </button>
      </div>

      {/* ✅ DROPDOWN (STABLE POSITION) */}
      {showMenu && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: "40px",
            right: "10px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            width: "150px",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => {
              setShowMenu(false);
              onEdit?.({
                id,
                title,
                description,
                due_date,
                priority,
                badge,
                assigned_to,
              });
            }}
            style={menuItemStyle}
          >
            ✏️ Edit
          </button>

          <button
            onClick={() => {
              setShowMenu(false);
              handleDelete();
            }}
            style={{
              ...menuItemStyle,
              color: "#dc2626",
            }}
          >
            🗑 Delete
          </button>
        </div>
      )}

      {/* TITLE */}
      <div style={{ fontWeight: 700, marginTop: "10px" }}>
        {title}
      </div>

      {/* DESCRIPTION */}
      {description && (
        <div style={{ color: "#6b7280", marginTop: "6px" }}>
          {description}
        </div>
      )}

      {/* DATE */}
      <div style={{ marginTop: "10px" }}>
        {due_date ? `📅 ${formatDate(due_date)}` : "📅 No date"}
      </div>

      {/* FOOTER */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
        <span
          style={{
            background: priorityColor.bg,
            color: priorityColor.text,
            padding: "5px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {priority || "Medium"}
        </span>
      </div>
    </div>
  );
};

// ✅ menu item style
const menuItemStyle = {
  width: "100%",
  padding: "10px",
  border: "none",
  background: "transparent",
  textAlign: "left" as const,
  cursor: "pointer",
};

export default TaskCard;