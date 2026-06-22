// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../services/api";

// interface UserQuery {
//   id: string;
//   message: string;
//   created_at: string;
//   admin_reply?: string;
//   replied: boolean;
//   replied_at?: string;
// }

// const HelpPage = () => {
//   const navigate = useNavigate();

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [queries, setQueries] = useState<UserQuery[]>([]);
//   const [queryLoading, setQueryLoading] = useState(true);

//   const loadQueries = async () => {
//     try {
//       const res = await api.get("/users/my-queries");
//       setQueries(res.data);
//     } catch (err) {
//       console.error("Failed to load queries", err);
//     } finally {
//       setQueryLoading(false);
//     }
//   };
//   useEffect(() => {
//   loadQueries();

//   const handleReply = () => {
//     loadQueries();

//     alert(
//       "Workivo replied to your query ✅"
//     );
//   };

//   window.addEventListener(
//     "query-replied",
//     handleReply
//   );

//   return () => {
//     window.removeEventListener(
//       "query-replied",
//       handleReply
//     );
//   };
// }, []);


//   const submitQuery = async () => {
//     if (!message.trim()) {
//       alert("Please enter your query");
//       return;
//     }

//     setLoading(true);

//     try {
//       await api.post("/users/query", {
//         message,
//       });

//       alert("Query sent to admin ✅");

//       setMessage("");

//       await loadQueries();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to send");
//     }

//     setLoading(false);
//   };

//   return (
//     <div
//       style={{
//         padding: "24px",
//         background: "#f8fafc",
//         minHeight: "100vh",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "12px",
//           marginBottom: "20px",
//         }}
//       >
//         <span
//           onClick={() => navigate(-1)}
//           style={{
//             cursor: "pointer",
//             fontSize: "22px",
//             fontWeight: 600,
//           }}
//         >
//           ←
//         </span>

//         <div>
//           <h2
//             style={{
//               margin: 0,
//               color: "#1e293b",
//             }}
//           >
//             Help & Support
//           </h2>

//           <p
//             style={{
//               margin: 0,
//               color: "#64748b",
//             }}
//           >
//             Contact Workivo Admin & Track Responses
//           </p>
//         </div>
//       </div>

//       {/* Send Query Card */}
//       <div
//         style={{
//           background: "#fff",
//           borderRadius: "16px",
//           padding: "24px",
//           boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
//           marginBottom: "24px",
//         }}
//       >
//         <h3
//           style={{
//             marginTop: 0,
//             marginBottom: "12px",
//           }}
//         >
//           Ask Admin
//         </h3>

//         <textarea
//           placeholder="Describe your issue..."
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           style={{
//             width: "100%",
//             minHeight: "140px",
//             padding: "14px",
//             borderRadius: "12px",
//             border: "1px solid #e2e8f0",
//             resize: "none",
//             outline: "none",
//             fontSize: "14px",
//           }}
//         />

//         <button
//           onClick={submitQuery}
//           disabled={loading}
//           style={{
//             marginTop: "16px",
//             padding: "12px 18px",
//             background: "#6366f1",
//             color: "#fff",
//             border: "none",
//             borderRadius: "10px",
//             cursor: "pointer",
//             fontWeight: 600,
//           }}
//         >
//           {loading ? "Sending..." : "Send to Admin"}
//         </button>
//       </div>

//       {/* Query History */}
//       <div
//         style={{
//           background: "#fff",
//           borderRadius: "16px",
//           padding: "24px",
//           boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
//         }}
//       >
//         <h3
//           style={{
//             marginTop: 0,
//             marginBottom: "20px",
//           }}
//         >
//           My Queries
//         </h3>

//         {queryLoading ? (
//           <p>Loading...</p>
//         ) : queries.length === 0 ? (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "30px",
//               color: "#94a3b8",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: "50px",
//               }}
//             >
//               📩
//             </div>

//             <h4>No Queries Yet</h4>

//             <p>Send your first query to Workivo Admin.</p>
//           </div>
//         ) : (
//           queries.map((q) => (
//             <div
//               key={q.id}
//               style={{
//                 border: "1px solid #e5e7eb",
//                 borderRadius: "14px",
//                 padding: "18px",
//                 marginBottom: "16px",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginBottom: "10px",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontWeight: 600,
//                     color: "#111827",
//                   }}
//                 >
//                   Your Query
//                 </span>

//                 <span
//                   style={{
//                     padding: "6px 12px",
//                     borderRadius: "999px",
//                     fontSize: "12px",
//                     fontWeight: 600,
//                     background: q.replied
//                       ? "#dcfce7"
//                       : "#fef3c7",
//                     color: q.replied
//                       ? "#166534"
//                       : "#92400e",
//                   }}
//                 >
//                   {q.replied
//                     ? "Answered ✅"
//                     : "Waiting ⏳"}
//                 </span>
//               </div>

//               <p
//                 style={{
//                   margin: 0,
//                   color: "#334155",
//                 }}
//               >
//                 {q.message}
//               </p>

//               <p
//                 style={{
//                   marginTop: "10px",
//                   fontSize: "13px",
//                   color: "#94a3b8",
//                 }}
//               >
//                 {new Date(q.created_at).toLocaleString()}
//               </p>

//               {q.admin_reply && (
//                 <div
//                   style={{
//                     marginTop: "16px",
//                     padding: "14px",
//                     background: "#f8fafc",
//                     borderRadius: "12px",
//                     borderLeft: "4px solid #6366f1",
//                   }}
//                 >
//                   <h4
//                     style={{
//                       margin: "0 0 8px 0",
//                       color: "#4338ca",
//                     }}
//                   >
//                     Workivo Reply
//                   </h4>

//                   <p
//                     style={{
//                       margin: 0,
//                       color: "#334155",
//                     }}
//                   >
//                     {q.admin_reply}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default HelpPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  ArrowLeft,
  MessageCircle,
  FileText,
  Loader2,
  Inbox,
  ChevronDown,
  CheckCircle2,
  Clock3,
} from "lucide-react";

interface UserQuery {
  id: string;
  message: string;
  created_at: string;
  admin_reply?: string;
  replied: boolean;
  replied_at?: string;
}

const VISIBLE_STEP = 3;

const HelpPage = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [queryLoading, setQueryLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);

  const loadQueries = async () => {
    try {
      const res = await api.get("/users/my-queries");
      setQueries(res.data);
    } catch (err) {
      console.error("Failed to load queries", err);
    } finally {
      setQueryLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();

    const handleReply = () => {
      loadQueries();
      alert("Workivo replied to your query ✅");
    };

    window.addEventListener("query-replied", handleReply);

    return () => {
      window.removeEventListener("query-replied", handleReply);
    };
  }, []);

  const submitQuery = async () => {
    if (!message.trim()) {
      alert("Please enter your query");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/query", {
        message,
      });

      alert("Query sent to admin ✅");

      setMessage("");

      await loadQueries();
    } catch (err) {
      console.error(err);
      alert("Failed to send");
    }

    setLoading(false);
  };

  const visibleQueries = queries.slice(0, visibleCount);
  const hasMore = visibleCount < queries.length;

  return (
    <div
      style={{
        padding: "24px",
        background: "#f8fafc", // ✅ kept exactly as your original background
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              color: "#1e293b",
              boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
              flexShrink: 0,
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <h2
              style={{
                margin: 0,
                color: "#0b1120",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.3px",
              }}
            >
              Help &amp; Support
            </h2>

            <p
              style={{
                margin: "2px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Contact Workivo Admin &amp; Track Responses
            </p>
          </div>
        </div>

        {/* Send Query Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
            marginBottom: "20px",
            border: "1px solid #eef1f7",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#eef2ff",
                color: "#1e3a8a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MessageCircle size={16} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                color: "#0b1120",
              }}
            >
              Ask Admin
            </h3>
          </div>

          <textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              minHeight: "130px",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              resize: "none",
              outline: "none",
              fontSize: "14px",
              background: "#f8fafc",
              color: "#0b1120",
              transition: "0.18s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#1e3a8a";
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,58,138,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <button
            onClick={submitQuery}
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "11px 20px",
              background: "linear-gradient(90deg, #1e3a8a, #312e81)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "13.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 10px 22px rgba(30,58,138,0.22)",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading && <Loader2 size={15} className="wkv-spin" />}
            {loading ? "Sending..." : "Send to Admin"}
          </button>
        </div>

        {/* Query History */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
            border: "1px solid #eef1f7",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#eef2ff",
                color: "#1e3a8a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={16} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                color: "#0b1120",
              }}
            >
              My Queries
            </h3>
          </div>

          {queryLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#64748b",
                fontSize: "13.5px",
                padding: "10px 0",
              }}
            >
              <Loader2 size={16} className="wkv-spin" /> Loading...
            </div>
          ) : queries.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Inbox size={26} color="#1e3a8a" />
              </div>

              <h4 style={{ margin: "0 0 4px", color: "#1e293b", fontSize: "14.5px" }}>
                No Queries Yet
              </h4>

              <p style={{ margin: 0, fontSize: "13px" }}>
                Send your first query to Workivo Admin.
              </p>
            </div>
          ) : (
            <>
              {visibleQueries.map((q) => (
                <div
                  key={q.id}
                  style={{
                    border: "1px solid #e7ebf3",
                    borderRadius: "14px",
                    padding: "18px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#1e293b",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      {q.message}
                    </p>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        background: q.replied ? "#dcfce7" : "#fef3c7",
                        color: q.replied ? "#166534" : "#92400e",
                      }}
                    >
                      {q.replied ? (
                        <>
                          <CheckCircle2 size={12} /> Answered
                        </>
                      ) : (
                        <>
                          <Clock3 size={12} /> Waiting
                        </>
                      )}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    {new Date(q.created_at).toLocaleString()}
                  </p>

                  {q.admin_reply && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "13px 16px",
                        background: "#f5f6fb",
                        borderRadius: "10px",
                        borderLeft: "3px solid #1e3a8a",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          color: "#1e3a8a",
                          fontSize: "12.5px",
                          fontWeight: 700,
                        }}
                      >
                        Workivo Reply
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          color: "#334155",
                          fontSize: "13.5px",
                          lineHeight: 1.5,
                        }}
                      >
                        {q.admin_reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <div style={{ textAlign: "center", marginTop: "6px" }}>
                  <button
                    onClick={() => setVisibleCount((c) => c + VISIBLE_STEP)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "transparent",
                      border: "none",
                      color: "#1e3a8a",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: "8px 12px",
                    }}
                  >
                    Load more queries
                    <ChevronDown size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .wkv-spin { animation: wkv-spin 0.9s linear infinite; }
        @keyframes wkv-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HelpPage;