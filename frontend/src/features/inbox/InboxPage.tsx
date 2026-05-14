import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { getNotifications, api } from "../../services/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
};

const InboxPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [filter, setFilter] = useState("All");

  // ✅ FETCH
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      console.log("API DATA:", res.data);

      // ✅ handle both formats safely
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.notifications || [];

      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ MARK AS READ
  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );

      // ✅ ALSO update selected
      if (selected && selected.id === id) {
        setSelected({ ...selected, is_read: true });
      }
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  // ✅ CLICK
  const handleClick = (item: Notification) => {
    setSelected(item);

    if (!item.is_read) {
      markAsRead(item.id);
    }
  };

  // ✅ FILTER
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "Unread") return !n.is_read;
    return true;
  });

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "24px" }}>
        <h2>Inbox</h2>
        <p style={{ color: "#6b7280" }}>
          Stay updated with your tasks and activities
        </p>

        {/* ✅ FILTER */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {["All", "Unread"].map((item) => (
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

        {/* ✅ MAIN */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          
          {/* LEFT */}
          <div style={{ flex: 2 }}>
            {filteredNotifications.length === 0 && (
              <p>No notifications yet</p>
            )}

            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                style={{
                  background: item.is_read ? "#f1f5f9" : "#e0edff",
                  padding: "16px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  borderLeft: item.is_read
                    ? "4px solid transparent"
                    : "4px solid #4f46e5",
                  transition: "0.2s",
                }}
              >
                <h6 style={{ margin: 0 }}>{item.title}</h6>

                <p style={{ marginTop: "6px", color: "#6b7280" }}>
                  {item.message}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
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


