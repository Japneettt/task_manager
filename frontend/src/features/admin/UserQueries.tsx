import { useEffect, useState } from "react";
import { api } from "../../services/api";

const UserQueries = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loadQueries = async () => {
    try {
      const res = await api.get("/admin/queries");
      setQueries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const sendReply = async (queryId: string) => {
    const replyText = replies[queryId];

    if (!replyText?.trim()) {
      alert("Please enter a reply");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        `/admin/queries/${queryId}/reply`,
        {
          reply: replyText,
        }
      );

      alert("Reply sent successfully ✅");

      setReplies((prev) => ({
        ...prev,
        [queryId]:"",
      }));

      loadQueries();
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        User Queries
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>User</th>
              <th style={thStyle}>Query</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Current Reply</th>
              <th style={thStyle}>New Reply</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {queries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                  }}
                >
                  No queries found
                </td>
              </tr>
            ) : (
              queries.map((q) => (
                <tr key={q.id}>
                  <td style={tdStyle}>
                    {q.user}
                  </td>

                  <td style={tdStyle}>
                    {q.message}
                  </td>

                  <td style={tdStyle}>
                    {new Date(
                      q.created_at
                    ).toLocaleString()}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: q.replied
                          ? "#dcfce7"
                          : "#fef3c7",
                        color: q.replied
                          ? "#166534"
                          : "#92400e",
                      }}
                    >
                      {q.replied
                        ? "Answered ✅"
                        : "Pending ⏳"}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    {q.admin_reply ? (
                      <div
                        style={{
                          maxWidth: "250px",
                        }}
                      >
                        {q.admin_reply}
                      </div>
                    ) : (
                      <span
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        No Reply Yet
                      </span>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <textarea
                      placeholder="Type reply..."
                      value={
                        replies[q.id] || ""
                      }
                      onChange={(e) =>
                        setReplies({
                          ...replies,
                          [q.id]:
                            e.target.value,
                        })
                      }
                      style={{
                        width: "250px",
                        minHeight: "80px",
                        padding: "10px",
                        borderRadius: "8px",
                        border:
                          "1px solid #d1d5db",
                        resize: "vertical",
                      }}
                    />
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() =>
                        sendReply(q.id)
                      }
                      disabled={loading}
                      style={{
                        background:
                          "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding:
                          "10px 14px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Send Reply
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = {
  textAlign: "left" as const,
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top" as const,
};

export default UserQueries;
// import { useEffect, useState } from "react";
// import { api } from "../../services/api";

// const UserQueries = () => {
//   const [queries, setQueries] = useState<any[]>([]);

//   useEffect(() => {
//     api.get("/admin/queries").then((res) => {
//       setQueries(res.data);
//     });
//   }, []);

//   return (
//     <div>
//       <h2>User Queries</h2>

//       <table style={{ width: "100%", marginTop: 20 }}>
//         <thead>
//           <tr>
//             <th>User</th>
//             <th>Message</th>
//             <th>Date</th>
//           </tr>
//         </thead>

//         <tbody>
//           {queries.map((q) => (
//             <tr key={q.id}>
//               <td>{q.user}</td>
//               <td>{q.message}</td>
//               <td>{new Date(q.created_at).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default UserQueries;