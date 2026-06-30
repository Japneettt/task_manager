import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import {
  getNotifications,
  getTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
  api,
  getWebSocketUrl,
  connectNotificationSocket,
} from "../../services/api";
 
type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
  category?: string;
};
 
type Invite = {
  id: string;
  team_id: string;
  team_name: string;
  invited_email: string;
  status: string;
  created_at?: string;
};
 
/* ─── inject CSS animations once ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
 
@keyframes tf-fadeUp {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes tf-slideRight {
  from { opacity:0; transform:translateX(20px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes tf-pop {
  0%   { opacity:0; transform:scale(0.86); }
  65%  { transform:scale(1.03); }
  100% { opacity:1; transform:scale(1); }
}
@keyframes tf-pulse {
  0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.4); }
  50%      { box-shadow:0 0 0 6px rgba(99,102,241,0); }
}
@keyframes tf-bell {
  0%,100% { transform:rotate(0); }
  15%     { transform:rotate(14deg); }
  30%     { transform:rotate(-12deg); }
  45%     { transform:rotate(8deg); }
  60%     { transform:rotate(-5deg); }
  75%     { transform:rotate(3deg); }
}
@keyframes tf-count {
  0%   { transform:scale(1); }
  40%  { transform:scale(1.3); }
  100% { transform:scale(1); }
}
@keyframes tf-shimmer {
  0%   { background-position:-600px 0; }
  100% { background-position:600px 0; }
}
 
.tf * { box-sizing:border-box; }
 
.tf-scroll::-webkit-scrollbar { width:3px; }
.tf-scroll::-webkit-scrollbar-track { background:transparent; }
.tf-scroll::-webkit-scrollbar-thumb { background:#e0ddf8; border-radius:4px; }
 
.tf-invite-card {
  transition: transform 0.2s cubic-bezier(.4,0,.2,1),
              box-shadow 0.2s cubic-bezier(.4,0,.2,1),
              border-color 0.2s;
}
.tf-invite-card:hover {
  transform: translateX(4px) translateY(-1px);
  box-shadow: 0 6px 24px rgba(99,102,241,0.12) !important;
}
 
.tf-notif-row {
  transition: background 0.15s ease, transform 0.15s ease;
}
.tf-notif-row:hover {
  background: rgba(99,102,241,0.06) !important;
  transform: translateX(3px);
}
 
.tf-filter-btn {
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
  position: relative;
  overflow: hidden;
}
.tf-filter-btn:hover { border-color:#6366f1 !important; color:#6366f1 !important; }
.tf-filter-btn:active { transform:scale(0.95); }
 
.tf-btn-accept {
  transition: all 0.18s ease;
  position: relative;
  overflow: hidden;
}
.tf-btn-accept:hover {
  background: #4f46e5 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99,102,241,0.4) !important;
}
.tf-btn-accept:active { transform:scale(0.97); }
 
.tf-btn-reject {
  transition: all 0.18s ease;
}
.tf-btn-reject:hover {
  color: #dc2626 !important;
  border-color: #dc2626 !important;
  background: #fff5f5 !important;
}
 
.tf-detail-accept {
  transition: all 0.2s ease;
}
.tf-detail-accept:hover {
  background: linear-gradient(135deg,#4f46e5,#7c3aed) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99,102,241,0.4) !important;
}
.tf-detail-reject {
  transition: all 0.18s ease;
}
.tf-detail-reject:hover {
  color: #dc2626 !important;
  border-color: #fca5a5 !important;
  background: #fff5f5 !important;
}
 
.tf-bell { animation: tf-bell 2s ease 0.4s 1; }
.tf-pulse { animation: tf-pulse 2.4s infinite; }
.tf-count { animation: tf-count 0.4s ease; }
.tf-fadein { animation: tf-fadeUp 0.35s cubic-bezier(.4,0,.2,1) both; }
.tf-slide  { animation: tf-slideRight 0.32s cubic-bezier(.4,0,.2,1) both; }
.tf-pop    { animation: tf-pop 0.38s cubic-bezier(.4,0,.2,1) both; }
`;
 
function injectCSS() {
  if (document.getElementById("tf-inbox-css")) return;
  const s = document.createElement("style");
  s.id = "tf-inbox-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
 
/* ─── helpers ─── */
function timeAgo(d?: string) {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
 
function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
 
const TEAM_GRADIENTS = [
  { a: "#818cf8", b: "#6366f1" },
  { a: "#f472b6", b: "#ec4899" },
  { a: "#34d399", b: "#059669" },
  { a: "#fb923c", b: "#ea580c" },
  { a: "#60a5fa", b: "#2563eb" },
  { a: "#a78bfa", b: "#7c3aed" },
];
function teamColor(name: string) {
  const c = TEAM_GRADIENTS[name.charCodeAt(0) % TEAM_GRADIENTS.length];
  return `linear-gradient(135deg, ${c.a}, ${c.b})`;
}
function teamColorSolid(name: string) {
  return TEAM_GRADIENTS[name.charCodeAt(0) % TEAM_GRADIENTS.length].b;
}
 
/* ─── FilterBtn ─── */
function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className="tf-filter-btn"
      onClick={onClick}
      style={{
        padding: "5px 15px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        border: `1px solid ${active ? "#6366f1" : "#e5e7eb"}`,
        background: active ? "#6366f1" : "#fff",
        color: active ? "#fff" : "#6b7280",
        fontFamily: "Inter, sans-serif",
        letterSpacing: "0.01em",
        outline: "none",
      }}
    >
      {label}
    </button>
  );
}
 
/* ─── StatusPill ─── */
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    pending:  { bg: "#fefce8", color: "#a16207", dot: "#eab308", label: "Pending"  },
    accepted: { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e", label: "Accepted" },
    rejected: { bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444", label: "Declined" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 9px 3px 7px",
      borderRadius: 99,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      whiteSpace: "nowrap" as const,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}
 
/* ─── AnimItem ─── */
function AnimItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div style={{ animation: `tf-fadeUp 0.3s cubic-bezier(.4,0,.2,1) ${index * 60}ms both` }}>
      {children}
    </div>
  );
}
 
/* ─── Category icon ─── */
function CategoryIcon({ cat }: { cat?: string }) {
  const color = "#6366f1";
  if (cat === "team") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
 
/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const InboxPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [invites, setInvites]             = useState<Invite[]>([]);
  const [selected, setSelected]           = useState<Notification | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [filter, setFilter]               = useState("All");
  const [category, setCategory]           = useState("all");
  const [bellKey, setBellKey]             = useState(0);
  const prevUnread                        = useRef(0);
 
  useEffect(() => { injectCSS(); }, []);
 
  const unreadCount = notifications.filter(n => !n.is_read).length;
 
  useEffect(() => {
    if (unreadCount > prevUnread.current) setBellKey(k => k + 1);
    prevUnread.current = unreadCount;
  }, [unreadCount]);
 
  const fetchNotifications = async () => {
    try {
      const params = category === "all" ? {} : { category };
      const res = await getNotifications(params);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };
 
  const fetchInvites = async () => {
    try {
      const res = await getTeamInvites();
      setInvites(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };
 
  useEffect(() => {
    fetchNotifications();
    fetchInvites();
    const iv = setInterval(fetchNotifications, 3000);
    return () => clearInterval(iv);
  }, [category]);
 
//   useEffect(() => {
//     const raw = localStorage.getItem("user");
//     if (!raw) return;
//     let user: any;
//     try { user = JSON.parse(raw); } catch { return; }
//     const token = localStorage.getItem("token");
//     if (!user?.id || !token) return;
//     const ws = new WebSocket(getWebSocketUrl(`/ws/notifications/${user.id}?token=${encodeURIComponent(token)}`));
//     // ws.onmessage = (e) => {
//     //   try {
//     //     const d = JSON.parse(e.data);
//     //     if (d.type === "NEW_INVITE" || d.type === "NEW_NOTIFICATION") {
//     //       fetchNotifications(); fetchInvites();
//     //     }
//     //   } catch {}
//     // };
//     ws.onmessage = (e) => {
//   try {
//     const d = JSON.parse(e.data);

//     if (
//       d.type === "NEW_INVITE" ||
//       d.type === "NEW_NOTIFICATION"
//     ) {
//       fetchNotifications();
//       fetchInvites();
//     }

//     // ✅ Admin replied to support query
//     if (d.type === "query_reply") {
//       fetchNotifications();

//       window.dispatchEvent(
//         new CustomEvent("query-replied")
//       );
//     }

//   } catch {}
// };
//     return () => ws.close();
//   }, []);
 useEffect(() => {
  const ws = connectNotificationSocket((d) => {
    if (d.type === "NEW_INVITE" || d.type === "NEW_NOTIFICATION") {
      fetchNotifications();
      fetchInvites();
    }
    if (d.type === "query_reply") {
      fetchNotifications();
      window.dispatchEvent(new CustomEvent("query-replied"));
    }
  });
  return () => ws?.close();
}, []);
  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };
 
  const handleAcceptInvite = async (id: string) => {
    try {
      await acceptTeamInvite(id);
      setInvites(prev => prev.map(inv => inv.id === id ? { ...inv, status: "accepted" } : inv));
      if (selectedInvite?.id === id)
        setSelectedInvite(p => p ? { ...p, status: "accepted" } : p);
    } catch {}
  };
 
  const handleRejectInvite = async (id: string) => {
    try {
      await rejectTeamInvite(id);
      setInvites(prev => prev.map(inv => inv.id === id ? { ...inv, status: "rejected" } : inv));
      if (selectedInvite?.id === id)
        setSelectedInvite(p => p ? { ...p, status: "rejected" } : p);
    } catch {}
  };
 
  const handleClickNotif = (item: Notification) => {
    setSelected(item); setSelectedInvite(null);
    if (!item.is_read) markAsRead(item.id);
  };
 
  const filteredNotifications = filter === "Unread"
    ? notifications.filter(n => !n.is_read)
    : notifications;
 
  const isEmpty = filteredNotifications.length === 0 && invites.length === 0;
 
  /* ── meta rows builder ── */
  const MetaRow = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0",
      borderBottom: "1px solid rgba(99,102,241,0.06)",
      fontSize: 13,
    }}>
      <span style={{ color: "#9ca3af", fontWeight: 400 }}>{label}</span>
      <span style={{ color: color ?? "#111827", fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    <div className="tf" style={{
      background: "linear-gradient(150deg, #f5f3ff 0%, #ffffff 45%, #eff6ff 100%)",
      minHeight: "100vh",
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>
      <Navbar />
 
      <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden" }}>
 
        {/* ══════════ SIDEBAR ══════════ */}
        <div style={{
          width:420,
          flexShrink: 0,
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(99,102,241,0.10)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "inset -1px 0 0 rgba(99,102,241,0.05), 4px 0 32px rgba(99,102,241,0.05)",
        }}>
 
          {/* Header */}
          <div style={{
            padding: "22px 20px 0",
            animation: "tf-fadeUp 0.4s cubic-bezier(.4,0,.2,1) both",
          }}>
            {/* title row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              {/* Bell icon */}
              <div key={bellKey} className="tf-bell" style={{ flexShrink: 0, display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
 
              <h2 style={{
                margin: 0, fontSize: 20, fontWeight: 700,
                color: "#0f0a2e", letterSpacing: "-0.5px",
              }}>
                Inbox
              </h2>
 
              {unreadCount > 0 && (
                <span key={unreadCount} className="tf-count" style={{
                  background: "linear-gradient(135deg,#818cf8,#6366f1)",
                  color: "#fff",
                  fontSize: 11, fontWeight: 700,
                  padding: "2px 9px", borderRadius: 99,
                  boxShadow: "0 2px 10px rgba(99,102,241,0.45)",
                  minWidth: 22, textAlign: "center" as const,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
 
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "#a5b4fc", fontWeight: 400 }}>
              {isEmpty
                ? "You're all caught up ✓"
                : `${invites.length + notifications.length} items · ${unreadCount} unread`}
            </p>
 
            {/* Category filter */}
            <div style={{ display: "flex", gap: 6, paddingBottom: 18, flexWrap: "wrap" as const }}>
              {["all", "personal", "team"].map(item => (
                <FilterBtn
                  key={item}
                  label={item.charAt(0).toUpperCase() + item.slice(1)}
                  active={category === item}
                  onClick={() => setCategory(item)}
                />
              ))}
            </div>
          </div>
 
          {/* subtle gradient divider */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.18),transparent)",
            margin: "0 0 2px",
          }} />
 
          {/* List */}
          <div className="tf-scroll" style={{ flex: 1, overflowY: "auto", padding: "6px 0 8px" }}>
 
            {/* ── Team Invites Section ── */}
            {invites.length > 0 && (
              <>
                <div style={{
                  padding: "12px 20px 6px",
                  fontSize: 10, fontWeight: 700,
                  color: "#c7d2fe", letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{
                    width: 16, height: 1,
                    background: "linear-gradient(90deg,#818cf8,transparent)",
                    display: "inline-block",
                  }} />
                  Team Invites
                </div>
 
                {invites.map((inv, i) => (
                  <AnimItem key={inv.id} index={i}>
                    <div
                      className="tf-invite-card"
                      onClick={() => { setSelectedInvite(inv); setSelected(null); }}
                      style={{
                        margin: "3px 10px",
                        padding: "13px 14px",
                        background: selectedInvite?.id === inv.id
                          ? "linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.06))"
                          : "#fff",
                        border: `1px solid ${selectedInvite?.id === inv.id ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.10)"}`,
                        borderRadius: 14,
                        cursor: "pointer",
                        boxShadow: selectedInvite?.id === inv.id
                          ? "0 4px 20px rgba(99,102,241,0.12)"
                          : "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {/* avatar */}
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: teamColor(inv.team_name),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#fff",
                            boxShadow: `0 3px 10px ${teamColorSolid(inv.team_name)}55`,
                          }}>
                            {initials(inv.team_name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0a2e" }}>
                              {inv.team_name}
                            </div>
                            <div style={{ fontSize: 11, color: "#a5b4fc", marginTop: 2 }}>
                              {inv.invited_email}
                            </div>
                          </div>
                        </div>
                        <StatusPill status={inv.status} />
                      </div>
 
                      {inv.status === "pending" && (
                        <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
                          <button
                            className="tf-btn-accept"
                            onClick={e => { e.stopPropagation(); handleAcceptInvite(inv.id); }}
                            style={{
                              flex: 1, padding: "7px 0", borderRadius: 9,
                              fontSize: 12, fontWeight: 600,
                              background: "linear-gradient(135deg,#818cf8,#6366f1)",
                              color: "#fff", border: "none", cursor: "pointer",
                              fontFamily: "Inter, sans-serif",
                              boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="tf-btn-reject"
                            onClick={e => { e.stopPropagation(); handleRejectInvite(inv.id); }}
                            style={{
                              flex: 1, padding: "7px 0", borderRadius: 9,
                              fontSize: 12, fontWeight: 500,
                              background: "#fafafa", color: "#9ca3af",
                              border: "1px solid #e5e7eb", cursor: "pointer",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </AnimItem>
                ))}
              </>
            )}
 
            {/* section divider */}
            {invites.length > 0 && filteredNotifications.length > 0 && (
              <div style={{
                height: 1,
                background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.14),transparent)",
                margin: "10px 14px",
              }} />
            )}
 
            {/* ── Notifications Section ── */}
            {filteredNotifications.length > 0 && (
              <>
                <div style={{
                  padding: "12px 20px 6px",
                  fontSize: 10, fontWeight: 700,
                  color: "#c7d2fe", letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{
                    width: 16, height: 1,
                    background: "linear-gradient(90deg,#818cf8,transparent)",
                    display: "inline-block",
                  }} />
                  Notifications
                </div>
 
                <div style={{ padding: "0 10px 12px" }}>
                  {filteredNotifications.map((item, i) => (
                    <AnimItem key={item.id} index={invites.length + i}>
                      <div
                        className="tf-notif-row"
                        onClick={() => handleClickNotif(item)}
                        style={{
                          padding: "10px 10px",
                          borderRadius: 11,
                          cursor: "pointer",
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          background: selected?.id === item.id
                            ? "rgba(99,102,241,0.07)"
                            : "transparent",
                          marginBottom: 1,
                          border: selected?.id === item.id
                            ? "1px solid rgba(99,102,241,0.15)"
                            : "1px solid transparent",
                        }}
                      >
                        {/* read dot */}
                        <div style={{ paddingTop: 5, flexShrink: 0 }}>
                          {!item.is_read ? (
                            <div
                              className="tf-pulse"
                              style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#6366f1",
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: "#e5e7eb",
                            }} />
                          )}
                        </div>
 
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: item.is_read ? 400 : 600,
                            color: item.is_read ? "#4b5563" : "#111827",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap" as const,
                            lineHeight: 1.45,
                          }}>
                            {item.title}
                          </div>
                          {item.message && (
                            <div style={{
                              fontSize: 11.5, color: "#9ca3af", marginTop: 2,
                              overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap" as const, lineHeight: 1.4,
                            }}>
                              {item.message}
                            </div>
                          )}
                          <div style={{ fontSize: 10.5, color: "#d1d5db", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                            {item.category && (
                              <span style={{
                                background: "#f5f3ff", color: "#a5b4fc",
                                fontSize: 9.5, fontWeight: 600,
                                padding: "1px 6px", borderRadius: 99,
                                textTransform: "capitalize" as const,
                                letterSpacing: "0.03em",
                              }}>
                                {item.category}
                              </span>
                            )}
                            {timeAgo(item.created_at)}
                          </div>
                        </div>
                      </div>
                    </AnimItem>
                  ))}
                </div>
              </>
            )}
 
            {isEmpty && (
              <div style={{
                padding: "52px 24px",
                textAlign: "center" as const,
                animation: "tf-pop 0.4s cubic-bezier(.4,0,.2,1) both",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18, margin: "0 auto 16px",
                  background: "linear-gradient(135deg,#eef2ff,#ede9fe)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 18px rgba(99,102,241,0.14)",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f0a2e", marginBottom: 6 }}>
                  All clear!
                </div>
                <div style={{ fontSize: 12, color: "#c7d2fe", lineHeight: 1.65 }}>
                  No new notifications.
                </div>
              </div>
            )}
          </div>
 
          {/* Footer: All / Unread */}
          <div style={{
            borderTop: "1px solid rgba(99,102,241,0.08)",
            padding: "11px 16px",
            display: "flex", gap: 6,
            background: "rgba(255,255,255,0.75)",
          }}>
            {["All", "Unread"].map(item => (
              <button
                key={item}
                className="tf-filter-btn"
                onClick={() => setFilter(item)}
                style={{
                  padding: "5px 15px", borderRadius: 99,
                  fontSize: 12,
                  fontWeight: filter === item ? 600 : 400,
                  background: filter === item ? "#0f0a2e" : "transparent",
                  color: filter === item ? "#fff" : "#9ca3af",
                  border: `1px solid ${filter === item ? "#0f0a2e" : "#e5e7eb"}`,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                }}
              >
                {item}
                {item === "Unread" && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 5,
                    background: "#6366f1", color: "#fff",
                    fontSize: 10, padding: "1px 5px",
                    borderRadius: 99, fontWeight: 700,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
 
        {/* ══════════ DETAIL PANE ══════════ */}
        <div style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 40, overflow: "auto",
          background: "linear-gradient(145deg,rgba(238,242,255,0.5),rgba(255,255,255,0.8))",
          position: "relative" as const,
        }}>
          {/* subtle bg pattern */}
          <div style={{
            position: "absolute" as const, inset: 0, opacity: 0.025, pointerEvents: "none",
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }} />
 
          {selectedInvite ? (
            /* ── Invite Detail Card ── */
            <div
              key={selectedInvite.id}
              className="tf-slide"
              style={{
                background: "#fff",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 22,
                padding: "32px 32px 30px",
                width: "100%", maxWidth: 470,
                boxShadow: "0 12px 48px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.04)",
                position: "relative" as const,
              }}
            >
              {/* top accent line */}
              <div style={{
                position: "absolute" as const,
                top: 0, left: 24, right: 24, height: 3,
                background: teamColor(selectedInvite.team_name),
                borderRadius: "0 0 4px 4px",
              }} />
 
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#eef2ff", color: "#6366f1",
                fontSize: 11, fontWeight: 700,
                padding: "5px 12px", borderRadius: 99, marginBottom: 22,
              }}>
                <CategoryIcon cat="team" />
                Team Invite
              </div>
 
              {/* avatar */}
              <div style={{
                width: 62, height: 62, borderRadius: 18,
                background: teamColor(selectedInvite.team_name),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: "#fff",
                marginBottom: 18, letterSpacing: -1,
                boxShadow: `0 8px 24px ${teamColorSolid(selectedInvite.team_name)}55`,
                animation: "tf-pop 0.35s cubic-bezier(.4,0,.2,1) both",
              }}>
                {initials(selectedInvite.team_name)}
              </div>
 
              <h2 style={{
                fontSize: 22, fontWeight: 700, color: "#0f0a2e",
                letterSpacing: "-0.5px", margin: "0 0 8px",
              }}>
                Join{" "}
                <span style={{ color: teamColorSolid(selectedInvite.team_name) }}>
                  {selectedInvite.team_name}
                </span>
              </h2>
              <p style={{
                fontSize: 13.5, color: "#6b7280", lineHeight: 1.7,
                margin: "0 0 22px",
              }}>
                <strong style={{ color: "#374151" }}>{selectedInvite.invited_email}</strong>{" "}
                invited you to collaborate in this workspace. Accept to connect with your team.
              </p>
 
              {/* meta */}
              <div style={{
                background: "linear-gradient(135deg,#fafbff,#f5f3ff)",
                borderRadius: 14,
                padding: "4px 16px",
                marginBottom: 24,
                border: "1px solid rgba(99,102,241,0.10)",
              }}>
                <MetaRow label="Invited by" value={selectedInvite.invited_email} />
                <MetaRow label="Workspace"  value={selectedInvite.team_name} />
                <MetaRow
                  label="Status" value={selectedInvite.status.charAt(0).toUpperCase() + selectedInvite.status.slice(1)}
                  color={selectedInvite.status === "accepted" ? "#15803d" : selectedInvite.status === "rejected" ? "#b91c1c" : "#a16207"}
                />
                {selectedInvite.created_at && (
                  <MetaRow label="Received" value={timeAgo(selectedInvite.created_at)} />
                )}
              </div>
 
              {selectedInvite.status === "pending" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="tf-detail-accept"
                    onClick={() => handleAcceptInvite(selectedInvite.id)}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 12,
                      background: "linear-gradient(135deg,#818cf8,#6366f1)",
                      color: "#fff", fontSize: 14, fontWeight: 600,
                      border: "none", cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      boxShadow: "0 4px 18px rgba(99,102,241,0.4)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    ✓ Accept invite
                  </button>
                  <button
                    className="tf-detail-reject"
                    onClick={() => handleRejectInvite(selectedInvite.id)}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 12,
                      background: "#fff", color: "#9ca3af",
                      fontSize: 14, fontWeight: 500,
                      border: "1px solid #e5e7eb",
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                    }}
                  >
                    ✕ Decline
                  </button>
                </div>
              )}
            </div>
 
          ) : selected ? (
            /* ── Notification Detail Card ── */
            <div
              key={selected.id}
              className="tf-slide"
              style={{
                background: "#fff",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 22,
                padding: "32px 32px 30px",
                width: "100%", maxWidth: 470,
                boxShadow: "0 12px 48px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.04)",
                position: "relative" as const,
              }}
            >
              {/* top accent */}
              <div style={{
                position: "absolute" as const,
                top: 0, left: 24, right: 24, height: 3,
                background: "linear-gradient(90deg,#818cf8,#6366f1,#a78bfa)",
                borderRadius: "0 0 4px 4px",
              }} />
 
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#eef2ff", color: "#6366f1",
                fontSize: 11, fontWeight: 700,
                padding: "5px 12px", borderRadius: 99, marginBottom: 22,
              }}>
                <CategoryIcon cat={selected.category} />
                {selected.category
                  ? selected.category.charAt(0).toUpperCase() + selected.category.slice(1)
                  : "Notification"}
              </div>
 
              {/* icon */}
              <div style={{
                width: 62, height: 62, borderRadius: 18,
                background: "linear-gradient(135deg,#eef2ff,#ede9fe)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
                boxShadow: "0 6px 20px rgba(99,102,241,0.18)",
                animation: "tf-pop 0.35s cubic-bezier(.4,0,.2,1) both",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
 
              <h2 style={{
                fontSize: 22, fontWeight: 700, color: "#0f0a2e",
                letterSpacing: "-0.5px", margin: "0 0 10px",
              }}>
                {selected.title}
              </h2>
              {selected.message && (
                <p style={{
                  fontSize: 14, color: "#6b7280",
                  lineHeight: 1.7, margin: "0 0 24px",
                }}>
                  {selected.message}
                </p>
              )}
 
              <div style={{
                background: "linear-gradient(135deg,#fafbff,#f5f3ff)",
                borderRadius: 14,
                padding: "4px 16px",
                border: "1px solid rgba(99,102,241,0.10)",
              }}>
                <MetaRow label="Status" value="Read" color="#15803d" />
                {selected.category && (
                  <MetaRow
                    label="Category"
                    value={selected.category.charAt(0).toUpperCase() + selected.category.slice(1)}
                  />
                )}
                {selected.created_at && (
                  <MetaRow label="Received" value={timeAgo(selected.created_at)} />
                )}
              </div>
            </div>
 
          ) : (
            /* ── Empty State ── */
            <div style={{
              textAlign: "center" as const,
              animation: "tf-pop 0.42s cubic-bezier(.4,0,.2,1) both",
            }}>
              {/* concentric rings */}
              <div style={{ position: "relative" as const, width: 110, height: 110, margin: "0 auto 30px" }}>
                {[0, 10, 20].map((inset, i) => (
                  <div key={i} style={{
                    position: "absolute" as const,
                    inset, borderRadius: "50%",
                    border: `1px solid rgba(99,102,241,${0.08 + i * 0.06})`,
                    animation: `tf-pop 0.4s cubic-bezier(.4,0,.2,1) ${i * 60}ms both`,
                  }} />
                ))}
                <div style={{
                  position: "absolute" as const,
                  inset: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg,#eef2ff,#ede9fe)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 6px 24px rgba(99,102,241,0.18)",
                  animation: "tf-pop 0.4s cubic-bezier(.4,0,.2,1) 0.18s both",
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
              </div>
 
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0f0a2e", marginBottom: 8 }}>
                Select an item
              </div>
              <p style={{
                fontSize: 13, color: "#c7d2fe",
                lineHeight: 1.7, maxWidth: 210, margin: "0 auto",
              }}>
                Pick a notification or team invite from the list to view its details.
              </p>
            </div>
          )}
        </div>
 
      </div>
    </div>
  );
};
 
export default InboxPage;