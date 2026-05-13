import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { api } from "../../services/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  type?: string; // ✅ for assigned filter
  created_at: string;
  is_read: boolean;
};

const InboxPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [filter, setFilter] = useState("All"); // ✅ NEW

  // ✅ FETCH
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ MARK READ
  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  // ✅ CLICK HANDLE
  const handleClick = (item: Notification) => {
    setSelected(item);

    if (!item.is_read) {
      markAsRead(item.id);
    }
  };

  // ✅ FILTER LOGIC
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "Unread") return !n.is_read;
    if (filter === "Assigned") return n.type === "assignment"; // depends backend
    return true;
  });

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "24px" }}>

        {/* ✅ HEADER */}
        <h2 style={{ marginBottom: "5px" }}>Inbox</h2>
        <p style={{ color: "#6b7280" }}>
          Stay updated with your tasks and activities
        </p>

        {/* ✅ FILTER TABS (NOW WORKING ✅) */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            marginBottom: "25px",
          }}
        >
          {["All", "Unread", "Assigned"].map((item) => (
            <span
              key={item}
              onClick={() => setFilter(item)} // ✅ CLICK FIX
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                background:
                  filter === item ? "#e5e7eb" : "transparent",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        {/* ✅ MAIN LAYOUT */}
        <div style={{ display: "flex", gap: "20px" }}>
          
          {/* ✅ LEFT */}
          <div style={{ flex: 2 }}>
            
            {filteredNotifications.length === 0 && (
              <p style={{ color: "#6b7280" }}>
                No notifications found
              </p>
            )}

            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                style={{
                  background: "#fff",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  borderLeft: item.is_read
                    ? "4px solid transparent"
                    : "4px solid #4f46e5",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h6 style={{ margin: 0 }}>{item.title}</h6>

                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <p style={{ marginTop: "6px", color: "#6b7280" }}>
                  {item.message}
                </p>
              </div>
            ))}
          </div>

          {/* ✅ RIGHT PANEL */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            {selected ? (
              <>
                <h5>{selected.title}</h5>
                <p>{selected.message}</p>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <h5>Details</h5>
                <p style={{ color: "#6b7280" }}>
                  Select a notification to view more details here.
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InboxPage;