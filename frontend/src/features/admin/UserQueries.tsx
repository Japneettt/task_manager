import { useEffect, useState } from "react";
import { api,connectNotificationSocket } from "../../services/api";

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
  useEffect(() => {
  const ws = connectNotificationSocket((data) => {

    if (data.type === "new_query") {
      setQueries((prev) => [
        data.query,
        ...prev
      ]);
    }

    if (data.type === "query_updated") {
      loadQueries();
    }
  });

  return () => ws?.close();
}, []);

const pendingQueries = queries.filter(
  (q) => !q.replied
);

const answeredQueries = queries.filter(
  (q) => q.replied
);

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
<h3
  style={{
    marginBottom: "12px",
    color: "#92400e",
    fontWeight: 700,
  }}
>
   Pending Queries ({pendingQueries.length})
</h3>
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
            {/* {queries.length === 0 ? ( */}
            {pendingQueries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                  }}
                >
                  No pending queries found
                </td>
              </tr>
            ) : (
              // queries.map((q) => (
              pendingQueries.map((q) => (
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

<td
  style={{
    ...tdStyle,
    textAlign: "center",
    verticalAlign: "middle",
  }}
>
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      whiteSpace: "nowrap",
      minWidth: "120px",
      padding: "8px 16px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: 600,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      background: q.replied
        ? "#dcfce7"
        : "#fef3c7",
      color: q.replied
        ? "#166534"
        : "#92400e",
    }}
  >
    {q.replied ? "✅ Answered" : "⏳ Pending"}
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
      <h3
  style={{
    marginTop: "30px",
    marginBottom: "12px",
    color: "#166534",
    fontWeight: 700,
  }}
>
  Answered Queries ({answeredQueries.length})
</h3>

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
        <th style={thStyle}>Reply</th>
      </tr>
    </thead>

    <tbody>
      {answeredQueries.length === 0 ? (
        <tr>
          <td
            colSpan={4}
            style={{
              textAlign: "center",
              padding: "30px",
              color: "#64748b",
            }}
          >
            No answered queries
          </td>
        </tr>
      ) : (
        answeredQueries.map((q) => (
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
              {q.admin_reply}
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
