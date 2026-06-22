import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import logo from "../../assets/workivo-logo.png";
import { LoaderCircle } from "lucide-react";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
};

type Notification = {
  id: string;
  is_read: boolean;
};

/* ============================================================================
   Nav links — Planner is now part of this list, so it gets the same
   active-color + active-arrow treatment as every other tab.
============================================================================ */
type NavLink = { label: string; path: string; badge?: number };

/* ============================================================================
   Small inline icons (zero extra dependencies)
============================================================================ */
const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.13-.38.3-.73.51-1.05a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.43.43.98.64 1.53.58H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 4 0v.09c.38.13.73.3 1.05.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.43.43-.64.98-.58 1.53V9c.63.18 1.19.57 1.56 1.05a1.65 1.65 0 0 0-.33 1.82z" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconHelp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5" />
    <path d="M12 17h.01" />
  </svg>
);
const IconLifeBuoy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (first: string, last: string) => {
    return `${first[0]}${last[0]}`.toUpperCase();
  };

  // FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        handleLogout();
      }
    };

    fetchUser();
  }, []);

  // Refresh user when another part of the app flags it (e.g. after a profile edit)
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem("refreshUser")) {
        api.get("/users/me").then((res) => {
          setUser(res.data);
          localStorage.removeItem("refreshUser");
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const goToProfile = () => navigate("/profile");

  // FETCH NOTIFICATION COUNT
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const unread = res.data.filter((n: Notification) => !n.is_read);
      setUnreadCount(unread.length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("isLoggedIn");
  //   navigate("/");
  // };
const handleLogout=async()=>{
  try{
    await api.post("/auth/logout");
  } catch{}
  localStorage.removeItem("token");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
  localStorage.removeItem("chat_owner");
  window.location.href="/";
}
  const handleSettingsNavigate = (path: string) => {
    navigate(path);
    setSettingsOpen(false);
  };

  const navLinks: NavLink[] = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Boards", path: "/boards" },
    { label: "Inbox", path: "/inbox", badge: unreadCount },
    { label: "Planner", path: "/planner" },
    { label: "Activity", path: "/activity" },
  ];

  return (
    <div className="navbar-root sticky top-0 z-40 flex w-full items-center justify-between gap-4 border-b border-violet-100/80 bg-white/90 px-5 py-2 shadow-sm shadow-violet-100/50 backdrop-blur-md sm:px-8">
      {/* LOGO + WORDMARK */}
      <div
        onClick={() => navigate("/dashboard")}
        className="group flex shrink-0 cursor-pointer items-center gap-2.5"
      >
        <img
          src={logo}
          alt="workivo"
          className="h-8 w-8 rounded-xl object-cover shadow-sm shadow-violet-200/70 ring-1 ring-violet-100 transition-all duration-200 group-hover:scale-105 group-hover:shadow-violet-300/60"
        />
<span className="text-[19px] font-extrabold tracking-tight text-black transition-opacity duration-200 group-hover:opacity-80">
  Workivo
</span>
      </div>

      {/* NAV LINKS */}
      <div className="hidden items-center gap-1 sm:flex">
        {navLinks.map(({ label, path, badge }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="group relative flex flex-col items-center bg-transparent px-1 py-0.5"
            >
              <span
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[14px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-violet-50 text-violet-600"
                    : "text-slate-500 group-hover:bg-violet-50/70 group-hover:text-violet-600"
                }`}
              >
                {label}
                {typeof badge === "number" && badge > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 px-1 text-[11px] font-bold text-white shadow-sm shadow-rose-300/60">
                    {badge}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={`mt-0.5 h-0 w-0 border-x-[5px] border-b-[6px] border-x-transparent transition-all duration-200 ${
                  isActive
                    ? "scale-100 border-b-violet-500 opacity-100"
                    : "scale-75 border-b-violet-400 opacity-0 group-hover:scale-90 group-hover:opacity-50"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* PROFILE */}
      <div className="relative flex items-center gap-2.5">
        <div
          onClick={goToProfile}
          className="group flex cursor-pointer items-center gap-2.5 rounded-2xl px-2 py-1 transition-colors duration-200 hover:bg-violet-50/70"
        >
          {/* AVATAR */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white shadow-sm shadow-violet-300/60 ring-2 ring-white transition-transform duration-200 group-hover:scale-105">
            {user?.avatar ? (
              <img
                src={`http://localhost:8000/${user.avatar}`}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[13px]">
                {user ? getInitials(user.first_name, user.last_name) : ".."}
              </span>
            )}
          </div>

          {/* USER INFO */}
          <div className="hidden leading-tight md:block">
            <div className="text-[13.5px] font-semibold text-slate-800">
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </div>
            <div className="text-[11.5px] text-slate-400">{user?.email}</div>
          </div>
        </div>

        {/* SETTINGS GEAR */}
        <button
          type="button"
          aria-label="Open settings menu"
          onClick={() => setSettingsOpen((prev) => !prev)}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 ${
            settingsOpen
              ? "border-violet-200 bg-violet-50 text-violet-600"
              : "border-violet-100 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
          }`}
        >
          <IconSettings />
        </button>

        {/* DROPDOWN */}
        {settingsOpen && (
          <div
            ref={dropdownRef}
            className="navbar-dropdown absolute right-0 top-full z-[99999] mt-2.5 w-60 overflow-hidden rounded-3xl bg-white/97 ring-1 ring-violet-100 shadow-2xl shadow-violet-200/50 backdrop-blur-xl"
          >
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />

            <div className="flex flex-col gap-0.5 p-2">
              <button
                type="button"
                onClick={() => handleSettingsNavigate("/profile")}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-violet-50 hover:text-violet-700"
              >
                <IconUser /> View Profile
              </button>
              <button
                type="button"
                onClick={() => handleSettingsNavigate("/change-password")}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-violet-50 hover:text-violet-700"
              >
                <IconLock /> Change Password
              </button>
              <button
                type="button"
                onClick={() => handleSettingsNavigate("/faq")}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-violet-50 hover:text-violet-700"
              >
                <IconHelp /> FAQ
              </button>
              <button
                type="button"
                onClick={() => handleSettingsNavigate("/help")}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-violet-50 hover:text-violet-700"
              >
                <IconLifeBuoy /> Help
              </button>

              <div className="my-1 border-t border-violet-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 transition-colors duration-150 hover:bg-rose-50"
              >
                <IconLogout /> Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes navDropdownIn {
          from { transform: translateY(-6px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .navbar-dropdown {
          transform-origin: top right;
          animation: navDropdownIn 160ms ease-out;
        }

        @keyframes navAccentShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .navbar-root {
          position: relative;
        }
        .navbar-root::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #8B5CF6, #D946EF, #8B5CF6, transparent);
          background-size: 200% 100%;
          opacity: 0.5;
          animation: navAccentShimmer 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { api } from "../../services/api";
// import logo from "../../assets/workivo-logo.png";
// type User = {
//   first_name: string;
//   last_name: string;
//   email: string;
//   avatar?: string;
// };

// type Notification = {
//   id: string;
//   is_read: boolean;
// };

// const Navbar = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [unreadCount, setUnreadCount] = useState(0); // ✅ NEW
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ✅ INITIALS
//   const getInitials = (first: string, last: string) => {
//     return `${first[0]}${last[0]}`.toUpperCase();
//   };

//   // ✅ FETCH USER
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await api.get("/users/me");
//         setUser(res.data);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         handleLogout();
//       }
//     };

//     fetchUser();
//   }, []);
//   useEffect(() => {
//   const interval = setInterval(() => {

//     if (localStorage.getItem("refreshUser")) {

//       api.get("/users/me").then(res => {
//         setUser(res.data);
//         localStorage.removeItem("refreshUser");
//       });

//     }

//   }, 1000);

//   return () => clearInterval(interval);
// }, []);
//   const goToProfile = () => navigate("/profile");

//   // ✅ FETCH NOTIFICATION COUNT
//   const fetchNotifications = async () => {
//     try {
//       const res = await api.get("/notifications"); // ✅ use correct endpoint
//       const unread = res.data.filter(
//         (n: Notification) => !n.is_read
//       );
//       setUnreadCount(unread.length);
//     } catch (err) {
//       console.error("Error fetching notifications", err);
//     }
//   };

//   // useEffect(() => {
//   //   fetchNotifications();
//   // }, []);
//   useEffect(() => {
//     fetchNotifications();

//     const interval = setInterval(() => {
//       fetchNotifications();
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         settingsOpen &&
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setSettingsOpen(false);
//       }
//     };
 
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [settingsOpen]);
 
//   // ✅ LOGOUT
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("isAdmin");
//       // ✅ ADD THESE TWO LINES:
//       localStorage.removeItem("userId");           // clear user ID
//   sessionStorage.removeItem("chat_owner");          // clear chat ownership
//   window.dispatchEvent(new Event("workivo:logout")); // signal widget to clear
//     navigate("/");
//   };
//   const handleSettingsNavigate = (path: string) => {
//     navigate(path);
//     setSettingsOpen(false);
//   };

 
//   // ✅ ACTIVE STYLE
//   const activeStyle = (path: string) => ({
//     cursor: "pointer",
//     color: location.pathname === path ? "#4f46e5" : "#374151",
//     fontWeight: location.pathname === path ? 600 : 400,
//     position: "relative" as const,
//   });
 
//   const dropdownItemStyle = {
//     width: "100%",
//     textAlign: "left" as const,
//     padding: "12px 16px",
//     background: "transparent",
//     border: "none",
//     outline: "none",
//     cursor: "pointer",
//     color: "#0F172A",
//     fontSize: 14,
//     display: "block",
//     transition: "background 0.15s ease",
//     borderRadius: 12,
//     boxSizing: "border-box" as const,
//   };


//   return (
//     <div
//       style={{
//         width: "100%",
//         padding: "12px 30px",
//         backgroundColor: "#ffffff",
//         borderBottom: "1px solid #e5e7eb",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//       }}
//     >
//       {/* ✅ LOGO */}
// <div
//   onClick={() => navigate("/dashboard")}
//   style={{
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     cursor: "pointer"
//   }}
// >
//   <img src={logo} alt="Workivo" style={{ width: "40px", height: "40px" }} />

//   <span style={{ fontWeight: 700, fontSize: "18px" }}>
//     Workivo
//   </span>
// </div>

//       {/* ✅ NAV */}
//       <div style={{ display: "flex", gap: "30px" }}>
//         {/* Dashboard */}
//         <span
//           style={activeStyle("/dashboard")}
//           onClick={() => navigate("/dashboard")}
//         >
//           Dashboard
//         </span>

//         {/* Boards */}
//         <span
//           style={activeStyle("/boards")}
//           onClick={() => navigate("/boards")}
//         >
//           Boards
//         </span>

//         {/* ✅ Inbox with Badge */}
//         <span
//           style={activeStyle("/inbox")}
//           onClick={() => navigate("/inbox")}
//         >
//           Inbox
//           {unreadCount > 0 && (
//             <span
//               style={{
//                 position: "absolute",
//                 top: "-6px",
//                 right: "-14px",
//                 background: "red",
//                 color: "#fff",
//                 borderRadius: "50%",
//                 fontSize: "10px",
//                 padding: "3px 6px",
//               }}
//             >
//               {unreadCount}
//             </span>
//           )}
//         </span>


//         <span onClick={() => navigate("/planner")}>
//           Planner
//         </span>

//         <span
//           style={activeStyle("/activity")}
//           onClick={() => navigate("/activity")}
//         >
//           Activity
//         </span>
//       </div>

//       {/* ✅ PROFILE */}
//       <div style={{ display: "flex", alignItems: "center", gap: "12px" ,position:"relative"}}>

//         {/* ✅ CLICKABLE AREA */}
//         <div
//           onClick={goToProfile}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "10px",
//             cursor: "pointer"
//           }}
//         >

//           {/* ✅ AVATAR */}
//           <div
//             style={{
//               width: "35px",
//               height: "35px",
//               borderRadius: "50%",
//               overflow: "hidden",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               background: "#ddd",
//               fontWeight: 600,
//               color: "#fff"
//             }}

//           >

//             {user?.avatar ? (
//               <img
//                 src={`http://localhost:8000/${user.avatar}`}
//                 alt="avatar"
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                 }}
//               />
//             ) : (
//               <span>
//                 {user ? getInitials(user.first_name, user.last_name) : ".."}
//               </span>
//             )}

//             {/* {user ? getInitials(user.first_name, user.last_name) : ".."} */}
//           </div>

//           {/* ✅ USER INFO */}
//           <div>
//             <div>
//               {user
//                 ? `${user.first_name} ${user.last_name}`
//                 : "Loading..."}
//             </div>
//             <div style={{ fontSize: "12px", color: "#6b7280" }}>
//               {user?.email}
//             </div>
//           </div>

//         </div>
//         <button
//           type="button"
//           aria-label="Open settings menu"
//           onClick={() => setSettingsOpen((prev) => !prev)}
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             width: 36,
//             height: 36,
//             borderRadius: 999,
//             border: "1px solid rgba(148,163,184,0.35)",
//             background: settingsOpen ? "#F8FAFB" : "#FFFFFF",
//             cursor: "pointer",
//             transition: "transform 0.2s ease, background 0.2s ease, color 0.2s ease",
//             color: "#475569",
//           }}
//           onMouseEnter={(e) => {
//             (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
//           }}
//           onMouseLeave={(e) => {
//             (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             width="18"
//             height="18"
//           >
//             <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
//             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.13-.38.3-.73.51-1.05a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.43.43.98.64 1.53.58H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 4 0v.09c.38.13.73.3 1.05.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.43.43-.64.98-.58 1.53V9c.63.18 1.19.57 1.56 1.05a1.65 1.65 0 0 0-.33 1.82z" />
//           </svg>
//         </button>
 
//         {settingsOpen && (
//           <div
//            ref={dropdownRef}   // ✅ IMPORTANT (you forgot this!)
//             style={{
//               position: "absolute",
//               right: 0,
//               top: "100%",
//               marginTop: 10,
//               width: 224,
//               background: "rgba(255,255,255,0.97)",
//               borderRadius: 18,
//               border: "1px solid rgba(226,232,240,1)",
//               boxShadow: "0 24px 48px rgba(15, 23, 42, 0.16)",
//               overflow: "hidden",
//               zIndex: 99999,
//               transformOrigin: "top right",
//               opacity: 1,
//               transform: "translateY(0) scale(1)",
//               transition: "opacity 180ms ease-in-out, transform 180ms ease-in-out",
//             }}
//           >
//             <button
//               type="button"
//               className="dropdown-item"
//               onClick={() => handleSettingsNavigate("/profile")}
//               style={dropdownItemStyle}
//             >
//               View Profile
//             </button>
//             <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />
//             <button
//               type="button"
//               className="dropdown-item"
//               onClick={() => handleSettingsNavigate("/change-password")}
//               style={dropdownItemStyle}
//             >
//               Change Password
//             </button>
//             <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />
//             <button
//               type="button"
//               className="dropdown-item"
//               onClick={() => handleSettingsNavigate("/faq")}
//               style={dropdownItemStyle}
//             >
//               FAQ
//             </button>
//             <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />

// {/* ✅ HELP */}
// <button
//   type="button"
//   className="dropdown-item"
//   onClick={() => handleSettingsNavigate("/help")}
//   style={dropdownItemStyle}
// >
//   Help
// </button>
//             <div style={{ margin: "2px 0", borderTop: "1px solid rgba(226,232,240,1)" }} />
//             <button
//               type="button"
//               className="dropdown-item"
//               onClick={handleLogout}
//               style={{
//                 ...dropdownItemStyle,
//                 color: "#dc2626",
//                 fontWeight: 600,
//               }}
//             >
//               Logout
//             </button>
//           </div>
//         )}
 

//       </div>
//     </div>
//   );
// };

// export default Navbar;
