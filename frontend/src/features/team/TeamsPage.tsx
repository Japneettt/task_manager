import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

// Icon components
const BoltIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#6366f1" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TeamsIcon = ({ color = "#6366f1", size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <polyline points="9,22 9,12 15,12 15,22" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#94a3b8" strokeWidth="1.8"/>
    <line x1="12" y1="8" x2="12" y2="16" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="#94a3b8" strokeWidth="1.8"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#94a3b8" strokeWidth="1.8"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="#94a3b8" strokeWidth="1.8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

// const BellIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//     <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"/>
//   </svg>
// );

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CodeIcon = ({ color = "#f97316" }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <polyline points="16,18 22,12 16,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="8,6 2,12 8,18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FolderIcon = ({ color = "#22c55e" }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = ({ color = "#6366f1" }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#6366f1" strokeWidth="1.8"/>
    <polyline points="9,12 11,14 15,10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);




const getTeamStyle = (index: number) => {
  const styles = [
    { icon: <TeamsIcon color="#6366f1" size={22} />, bg: "rgba(99,102,241,0.12)", accent: "#6366f1" },
    { icon: <FolderIcon color="#22c55e" />, bg: "rgba(34,197,94,0.12)", accent: "#22c55e" },
    { icon: <CodeIcon color="#f97316" />, bg: "rgba(249,115,22,0.12)", accent: "#f97316" },
    { icon: <TeamsIcon color="#6366f1" size={22} />, bg: "rgba(99,102,241,0.12)", accent: "#6366f1" },
    { icon: <TeamsIcon color="#6366f1" size={22} />, bg: "rgba(99,102,241,0.12)", accent: "#6366f1" },
    { icon: <CodeIcon color="#f97316" />, bg: "rgba(249,115,22,0.12)", accent: "#f97316" },
    { icon: <FolderIcon color="#f97316" />, bg: "rgba(249,115,22,0.12)", accent: "#f97316" },
    { icon: <ChartIcon color="#6366f1" />, bg: "rgba(99,102,241,0.12)", accent: "#6366f1" },
    { icon: <FolderIcon color="#f97316" />, bg: "rgba(249,115,22,0.12)", accent: "#f97316" },
    { icon: <FolderIcon color="#22c55e" />, bg: "rgba(34,197,94,0.12)", accent: "#22c55e" },
    { icon: <TeamsIcon color="#6366f1" size={22} />, bg: "rgba(99,102,241,0.12)", accent: "#6366f1" },
    { icon: <CodeIcon color="#f97316" />, bg: "rgba(249,115,22,0.12)", accent: "#f97316" },
  ];
  return styles[index % styles.length];
};

const AVATAR_COLORS = ["#e0e7ff", "#d1fae5", "#fef3c7", "#ffe4e6", "#f3f4f6", "#dbeafe"];
const AVATAR_TEXT_COLORS = ["#6366f1", "#059669", "#d97706", "#e11d48", "#6b7280", "#2563eb"];

// const getUserInitials = (member: any) => {
//   if (member?.first_name && member?.last_name) {
//     return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
//   }

//   const name = member?.name?.trim();
//   if (name) {
//     const parts = name.split(/\s+/).filter(Boolean);
//     if (parts.length === 0) {
//       return "?";
//     }
//     if (parts.length === 1) {
//       return parts[0][0].toUpperCase();
//     }
//     return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   }

//   return "?";
// };
const getUserInitials = (member: any) => {

  const name = member?.name?.trim();

  if (!name) return "?";

  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

type TeamMember = {
  id?: string | number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;   // ✅ ADD THIS
};

const AvatarGroup = ({ members }: { members?: TeamMember[] }) => {
  const safeMembers = Array.isArray(members) ? members : [];
  const shown = Math.min(safeMembers.length, 3);
  const extra = safeMembers.length - shown;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
      {safeMembers.slice(0, shown).map((member, i) => {
        const initials = getUserInitials(member);
        const colorIndex = i % AVATAR_COLORS.length;
        return (
          <div
            key={`${member?.id ?? i}-${member?.name ?? "member"}`}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: AVATAR_COLORS[colorIndex],
              border: "2px solid #fff",
              marginLeft: i > 0 ? "-8px" : "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 600,
              color: AVATAR_TEXT_COLORS[colorIndex],
              zIndex: shown - i,
            }}
          >
            {/* {initials} */}
            {member.avatar ? (
  <img
    src={`http://localhost:8000/${member.avatar}`}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%"
    }}
  />
) : (
  initials
)}

          </div>
        );
      })}
      {extra > 0 && (
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "#f1f5f9",
            border: "2px solid #fff",
            marginLeft: "-8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            zIndex: 0,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};

// ── TeamCard now receives onDelete as a prop ──
const TeamCard = ({
  team,
  index,
  onClick,
  onDelete,
}: {
  team: any;
  index: number;
  onClick: () => void;
  onDelete: (id: number | string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const style = getTeamStyle(index);
  const isTeam = team.type?.toLowerCase() === "team";
  const members = Array.isArray(team.members)
    ? team.members.map((m: any) => ({
        // id: m.id,
        id: m.user_id || m.id,   // ✅ FIX HERE
        first_name: m.first_name ?? null,
        last_name: m.last_name ?? null,
        // name:
        //   m.name || `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || null,
      }))
    : [];

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        border: `1.5px solid ${hovered ? style.accent + "40" : "#f1f5f9"}`,
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.10), 0 0 0 1px ${style.accent}20`
          : "0 2px 12px rgba(15,23,42,0.05)",
        transform: mounted
          ? hovered
            ? "translateY(-4px) scale(1.01)"
            : "translateY(0) scale(1)"
          : "translateY(16px)",
        opacity: mounted ? 1 : 0,
        transition:
          "transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.25s ease, border-color 0.2s ease, opacity 0.4s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top gradient accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${style.accent}00, ${style.accent}80, ${style.accent}00)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: style.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
        >
          {style.icon}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(team.id);
          }}
          style={{
            background: "#fee2e2",
            border: "none",
            color: "#dc2626",
            fontSize: "11px",
            fontWeight: 600,
            padding: "5px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            position: "relative",
            zIndex: 50,
            pointerEvents: "auto",
          }}
        >
          Delete
        </button>
      </div>

      {/* Title */}
      <div style={{ marginBottom: "4px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.2px",
          }}
        >
          {team.name}
        </h3>
      </div>

      {/* Badge */}
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontWeight: 600,
            color: isTeam ? "#6366f1" : "#64748b",
            background: isTeam ? "#eef2ff" : "#f8fafc",
            border: `1px solid ${isTeam ? "#c7d2fe" : "#e2e8f0"}`,
            borderRadius: "6px",
            padding: "2px 7px",
          }}
        >
          {isTeam ? <TeamsIcon color="#6366f1" size={10} /> : <LockIcon />}
          {isTeam ? "Team" : "Private"}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: "0 0 16px",
          fontSize: "13px",
          color: "#94a3b8",
          lineHeight: "1.5",
          minHeight: "20px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {team.description || team.name}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "12px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <AvatarGroup members={members} />
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: hovered ? style.accent : "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <line x1="5" y1="12" x2="19" y2="12" stroke={hovered ? "#fff" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round"/>
            <polyline points="12,5 19,12 12,19" stroke={hovered ? "#fff" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

const TeamsPage = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("teams");
  const navigate = useNavigate();
  const showSidebar = false;

  const getUserInitialsFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        return "U";
      }
      const parsed = JSON.parse(raw);
      const member = {
        first_name: parsed.first_name,
        last_name: parsed.last_name,
        name: parsed.name || parsed.full_name || "",
      };
      return getUserInitials(member);
    } catch {
      return "U";
    }
  };

  const userInitials = getUserInitialsFromStorage();

  const fetchTeams = async () => {
    const res = await api.get("/teams");
    setTeams(res.data);
  };

  const deleteTeam = async (id: number | string) => {
    try {
      await api.delete(`/teams/${id}`);
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    fetchTeams();
    const interval = setInterval(fetchTeams, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = teams.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { id: "teams", icon: <TeamsIcon color="#6366f1" size={20} />, iconInactive: <TeamsIcon color="#94a3b8" size={20} />, label: "Teams" },
    { id: "home", icon: <HomeIcon />, iconInactive: <HomeIcon />, label: "Home" },
    { id: "activity", icon: <ActivityIcon />, iconInactive: <ActivityIcon />, label: "Activity" },
    { id: "add", icon: <AddIcon />, iconInactive: <AddIcon />, label: "Add" },
    { id: "settings", icon: <SettingsIcon />, iconInactive: <SettingsIcon />, label: "Settings" },
  ];

  const stats = [
    { value: "12", label: "Total Teams", sub: "Across your organization", icon: <TeamsIcon color="#6366f1" size={24} />, bg: "rgba(99,102,241,0.10)" },
    { value: "28", label: "Total Members", sub: "Active team members", icon: <TeamsIcon color="#22c55e" size={24} />, bg: "rgba(34,197,94,0.10)" },
    { value: "36", label: "Total Projects", sub: "Across all teams", icon: <FolderIcon color="#f97316" />, bg: "rgba(249,115,22,0.10)" },
    { value: "98%", label: "Active Teams", sub: "Engagement this month", icon: <CheckCircleIcon />, bg: "rgba(99,102,241,0.10)" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Sidebar ── */}
      {showSidebar && (
        <aside
          style={{
            width: "72px",
            background: "#ffffff",
            borderRight: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 0 20px",
            gap: "4px",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          {/* Logo */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            boxShadow: "0 2px 12px rgba(99,102,241,0.2)",
          }}
        >
          <BoltIcon />
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            title={item.label}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: activeNav === item.id ? "#eef2ff" : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              transition: "background 0.2s ease",
            }}
          >
            {activeNav === item.id ? item.icon : item.iconInactive}
            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: activeNav === item.id ? "#6366f1" : "#94a3b8",
                letterSpacing: "0.2px",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}

        {/* Avatar at bottom */}
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
              cursor: "pointer",
              position: "relative",
            }}
          >
            A
            <div
              style={{
                position: "absolute",
                bottom: "1px",
                right: "1px",
                width: "8px",
                height: "8px",
                background: "#22c55e",
                borderRadius: "50%",
                border: "1.5px solid #fff",
              }}
            />
          </div>
          <p style={{ fontSize: "8px", color: "#94a3b8", textAlign: "center", margin: "4px 0 0", fontWeight: 600 }}>Alex</p>
        </div>
      </aside>
      )}

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            padding: "0 32px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BoltIcon />
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
              frontend
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                padding: "8px 14px",
                width: "240px",
              }}
            >
              <SearchIcon />
              <input
                type="text"
                placeholder="Search teams or projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none",
                  background: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#0f172a",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              />
            </div>
            {/*
            <div style={{ position: "relative" }}>
              <button
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <BellIcon />
              </button>
            </div>
            */}
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                position: "relative",
                boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
              }}
            >
              {userInitials || "?"}
              <div
                style={{
                  position: "absolute",
                  bottom: "1px",
                  right: "1px",
                  width: "9px",
                  height: "9px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                }}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: "36px 36px 40px" }}>
          {/* Page title row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <button
                  onClick={() => navigate(-1)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0f172a",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  ← Back
                </button>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.6px",
                  }}
                >
                  My Team Projects
                </h1>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#eef2ff",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TeamsIcon color="#6366f1" size={16} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", fontWeight: 400 }}>
                Manage and collaborate with your team projects in one place.
              </p>
            </div>
            <button
              onClick={() => navigate("/teams/create")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "11px 20px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(99,102,241,0.38)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                letterSpacing: "-0.1px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(99,102,241,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.38)";
              }}
            >
              <PlusIcon />
              Create New Team
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #f1f5f9",
              padding: "24px 32px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "24px",
              boxShadow: "0 2px 16px rgba(15,23,42,0.05)",
              marginBottom: "32px",
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    background: stat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.5px",
                      lineHeight: 1,
                      marginBottom: "4px",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{stat.label}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Team grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "18px",
              marginBottom: "36px",
            }}
          >
            {(filtered.length > 0 ? filtered : teams).map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                index={i}
                onClick={() => navigate(`/teams/${team.id}`)}
                onDelete={deleteTeam}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamsPage;
