// import { useEffect, useState } from "react";
// import Navbar from "../../components/layout/Navbar";
// import {
//   getNotifications,
//   getTeamInvites,
//   acceptTeamInvite,
//   rejectTeamInvite,
//   api,
// } from "../../services/api";
// import { useNavigate } from "react-router-dom";
// type Notification = {
//   id: string;
//   title: string;
//   message: string;
//   is_read: boolean;
//   created_at?: string;
//   category?: string;
// };

// type Invite = {
//   id: string;
//   team_id: string;
//   team_name: string;
//   invited_email: string;
//   status: string;
//   created_at?: string;
// };

// const InboxPage = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [invites, setInvites] = useState<Invite[]>([]);
//   const [selected, setSelected] = useState<Notification | null>(null);
//   const [filter, setFilter] = useState("All");
//   const [category, setCategory] = useState("all");
//   const navigate = useNavigate();
//   const unreadCount = notifications.filter(n => !n.is_read).length;

//   // ✅ FETCH NOTIFICATIONS
//   const fetchNotifications = async () => {
//     try {
//       const params = category === "all" ? {} : { category };
//       const res = await getNotifications(params);

//       console.log("NOTIFICATIONS RESPONSE:", res.data);

//       setNotifications(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("Error fetching notifications", err);
//     }
//   };

//   // ✅ FETCH INVITES
//   const fetchInvites = async () => {
//     try {
//       const res = await getTeamInvites();
//       setInvites(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("Error fetching team invites", err);
//     }
//   };

//   // ✅ AUTO REFRESH (CRITICAL FIX 🔥)
// useEffect(() => {
//   fetchNotifications();
//   fetchInvites();

//   const interval = setInterval(() => {
//     fetchNotifications();
//     fetchInvites();
//   }, 3000); // ✅ every 5 sec

//   return () => clearInterval(interval);
// }, [category]);

// //   const userData = localStorage.getItem("user");

// //   // ✅ FIX: safe check
// //   if (!userData || userData === "undefined") {
// //     console.log("❌ Invalid user in storage");
// //     return;
// //   }

// //   let user;
// //   try {
// //     user = JSON.parse(userData);
// //   } catch {
// //     console.log("❌ JSON parse failed");
// //     return;
// //   }

// //   if (!user?.id) return;

// //   const ws = new WebSocket(`ws://localhost:8000/ws/activity/${user.id}`);

// //   ws.onmessage = (event) => {
// //     try {
// //       const data = JSON.parse(event.data);

// //       if (data.type === "team_update") {
// //         fetchInvites();
// //         fetchNotifications();
// //       }
// //     } catch (err) {
// //       console.error("WS parse error", err);
// //     }
// //   };

// //   return () => ws.close();
// // }, [category]);

//   // ✅ MARK READ
//   const markAsRead = async (id: string) => {
//     try {
//       await api.patch(`/notifications/${id}/read`);

//       setNotifications(prev =>
//         prev.map(n =>
//           n.id === id ? { ...n, is_read: true } : n
//         )
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   };

// const handleAcceptInvite = async (inviteId: string) => {
//   try {
//     const res = await acceptTeamInvite(inviteId);

//     // ✅ remove invite instantly
//     setInvites(prev => prev.filter(inv => inv.id !== inviteId));

//     // ✅ navigate to team
//     navigate(`/teams/${res.data.team_id}`);

//   } catch (err) {
//     console.error(err);
//   }
// };

//   const handleRejectInvite = async (inviteId: string) => {
//     try {
//       await rejectTeamInvite(inviteId);
//       setInvites(prev =>
//         prev.map(inv =>
//           inv.id === inviteId ? { ...inv, status: "rejected" } : inv
//         )
//       );
//     } catch (err) {
//       console.error("Error rejecting invite", err);
//     }
//   };

//   const handleClick = (item: Notification) => {
//     setSelected(item);

//     if (!item.is_read) {
//       markAsRead(item.id);
//     }
//   };

//   // ✅ FILTER FIX
//   const filteredNotifications =
//     filter === "Unread"
//       ? notifications.filter(n => n.is_read === false)
//       : notifications;

//   return (
//     <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
//       <Navbar />

//       <div style={{ padding: "24px" }}>
//         <h2>Inbox 🔔 ({unreadCount})</h2>

//         {/* ✅ CATEGORY TABS + FILTER */}
//         <div style={{ display: "flex", gap: "16px", marginTop: "20px", alignItems: "center" }}>
//           <div style={{ display: "flex", gap: "8px" }}>
//             {["all", "personal", "team"].map(item => (
//               <button
//                 key={item}
//                 onClick={() => setCategory(item)}
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: "18px",
//                   background: category === item ? "#e5e7eb" : "transparent",
//                   cursor: "pointer",
//                   textTransform: "capitalize",
//                   border: "none"
//                 }}
//               >
//                 {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
//               </button>
//             ))}
//           </div>

//           <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
//             {["All", "Unread"].map(item => (
//               <span
//                 key={item}
//                 onClick={() => setFilter(item)}
//                 style={{
//                   padding: "8px 14px",
//                   borderRadius: "20px",
//                   background: filter === item ? "#e5e7eb" : "transparent",
//                   cursor: "pointer",
//                   fontWeight: filter === item ? 600 : 400,
//                 }}
//               >
//                 {item}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* ✅ TEAM INVITES */}
//         <div
//           style={{
//             marginTop: "24px",
//             padding: "16px",
//             background: "#fff",
//             borderRadius: "12px"
//           }}
//         >
//           <h3>Team Invites</h3>
//           {invites.length === 0 ? (
//             <p>No team invites</p>
//           ) : (
//             invites.map(invite => (
//               <div
//                 key={invite.id}
//                 style={{
//                   background: "#f8fafc",
//                   padding: "12px",
//                   borderRadius: "10px",
//                   marginBottom: "10px",
//                   border: "1px solid #e2e8f0"
//                 }}
//               >
//                 <div style={{ display: "flex", justifyContent: "space-between" }}>
//                   <div>
//                     <div style={{ fontWeight: 600 }}>{invite.team_name}</div>
//                     <div style={{ fontSize: "12px", color: "#6b7280" }}>
//                       {invite.invited_email}
//                     </div>
//                   </div>

//                   <span style={{ textTransform: "capitalize" }}>
//                     {invite.status}
//                   </span>
//                 </div>

//                 {invite.status === "pending" && (
//                   <div style={{ marginTop: "10px" }}>
//                     <button onClick={() => handleAcceptInvite(invite.id)}>Accept</button>
//                     <button onClick={() => handleRejectInvite(invite.id)}>Reject</button>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>

//         {/* ✅ MAIN */}
//         <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

//           {/* LEFT */}
//           <div style={{ flex: 2 }}>

//             {notifications.length === 0 ? (
//               <p>No notifications yet</p>
//             ) : filteredNotifications.length === 0 ? (
//               <p>No unread notifications</p>
//             ) : null}

//             {filteredNotifications.map(item => {
//               const bg = item.is_read
//                 ? "#f1f5f9"
//                 : item.category === "team"
//                 ? "#fff7ed"
//                 : "#e0edff";

//               return (
//                 <div
//                   key={item.id}
//                   onClick={() => handleClick(item)}
//                   style={{
//                     background: bg,
//                     padding: "16px",
//                     marginBottom: "10px",
//                     borderRadius: "8px",
//                     cursor: "pointer",
//                     borderLeft: item.is_read
//                       ? "4px solid transparent"
//                       : "4px solid #4f46e5",
//                   }}
//                 >
//                   <h6>{item.title}</h6>
//                   <p>{item.message}</p>
//                 </div>
//               );
//             })}
//           </div>

//           {/* RIGHT */}
//           <div style={{ flex: 1, background: "#fff", padding: "20px" }}>
//             {selected ? (
//               <>
//                 <h4>{selected.title}</h4>
//                 <p>{selected.message}</p>
//               </>
//             ) : (
//               <p>Select a notification</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InboxPage;

import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import {
  getNotifications,
  getTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
  api,
  getWebSocketUrl,
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

const InboxPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [filter, setFilter] = useState("All");
  const [category, setCategory] = useState("all");

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ✅ FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const params = category === "all" ? {} : { category };
      const res = await getNotifications(params);

      console.log("NOTIFICATIONS RESPONSE:", res.data);

      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // ✅ FETCH INVITES
  const fetchInvites = async () => {
    try {
      const res = await getTeamInvites();
      setInvites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching team invites", err);
    }
  };

  // ✅ AUTO REFRESH (CRITICAL FIX 🔥)
  useEffect(() => {
    fetchNotifications();
    fetchInvites();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 3000); // ✅ refresh every 3 sec

    return () => clearInterval(interval);
  }, [category]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      return;
    }

    const token = localStorage.getItem("token");
    if (!parsedUser?.id || !token) {
      return;
    }

    const ws = new WebSocket(
      getWebSocketUrl(
        `/ws/notifications/${parsedUser.id}?token=${encodeURIComponent(token)}`
      )
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "NEW_INVITE" || data.type === "NEW_NOTIFICATION") {
          fetchNotifications();
          fetchInvites();
        }
      } catch (err) {
        console.error("WebSocket message parse error", err);
      }
    };

    ws.onerror = (event) => {
      console.warn("WebSocket error", event);
    };

    return () => {
      ws.close();
    };
  }, []);

  // ✅ MARK READ
  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await acceptTeamInvite(inviteId);
      setInvites(prev =>
        prev.map(inv =>
          inv.id === inviteId ? { ...inv, status: "accepted" } : inv
        )
      );
    } catch (err) {
      console.error("Error accepting invite", err);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      await rejectTeamInvite(inviteId);
      setInvites(prev =>
        prev.map(inv =>
          inv.id === inviteId ? { ...inv, status: "rejected" } : inv
        )
      );
    } catch (err) {
      console.error("Error rejecting invite", err);
    }
  };

  const handleClick = (item: Notification) => {
    setSelected(item);

    if (!item.is_read) {
      markAsRead(item.id);
    }
  };

  // ✅ FILTER FIX
  const filteredNotifications =
    filter === "Unread"
      ? notifications.filter(n => n.is_read === false)
      : notifications;

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "24px" }}>
        <h2>Inbox 🔔 ({unreadCount})</h2>

        {/* ✅ CATEGORY TABS + FILTER */}
        <div style={{ display: "flex", gap: "16px", marginTop: "20px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {["all", "personal", "team"].map(item => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "18px",
                  background: category === item ? "#e5e7eb" : "transparent",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  border: "none"
                }}
              >
                {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            {["All", "Unread"].map(item => (
              <span
                key={item}
                onClick={() => setFilter(item)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "20px",
                  background: filter === item ? "#e5e7eb" : "transparent",
                  cursor: "pointer",
                  fontWeight: filter === item ? 600 : 400,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ✅ TEAM INVITES */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#fff",
            borderRadius: "12px"
          }}
        >
          <h3>Team Invites</h3>
          {invites.length === 0 ? (
            <p>No team invites</p>
          ) : (
            invites.map(invite => (
              <div
                key={invite.id}
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{invite.team_name}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {invite.invited_email}
                    </div>
                  </div>

                  <span style={{ textTransform: "capitalize" }}>
                    {invite.status}
                  </span>
                </div>

                {invite.status === "pending" && (
                  <div style={{ marginTop: "10px" }}>
                    <button onClick={() => handleAcceptInvite(invite.id)}>Accept</button>
                    <button onClick={() => handleRejectInvite(invite.id)}>Reject</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ✅ MAIN */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

          {/* LEFT */}
          <div style={{ flex: 2 }}>

            {notifications.length === 0 ? (
              <p>No notifications yet</p>
            ) : filteredNotifications.length === 0 ? (
              <p>No unread notifications</p>
            ) : null}

            {filteredNotifications.map(item => {
              const bg = item.is_read
                ? "#f1f5f9"
                : item.category === "team"
                ? "#fff7ed"
                : "#e0edff";

              return (
                <div
                  key={item.id}
                  onClick={() => handleClick(item)}
                  style={{
                    background: bg,
                    padding: "16px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    borderLeft: item.is_read
                      ? "4px solid transparent"
                      : "4px solid #4f46e5",
                  }}
                >
                  <h6>{item.title}</h6>
                  <p>{item.message}</p>
                </div>
              );
            })}
          </div>

          {/* RIGHT */}
          <div style={{ flex: 1, background: "#fff", padding: "20px" }}>
            {selected ? (
              <>
                <h4>{selected.title}</h4>
                <p>{selected.message}</p>
              </>
            ) : (
              <p>Select a notification</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;

