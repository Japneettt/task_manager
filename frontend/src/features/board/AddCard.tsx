import { useState } from "react";
import { api } from "../../services/api";

const AddCard = ({ listId, boardId, refreshBoard, members }: any) => {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("low");
  const [file, setFile] = useState<File | null>(null);

  const createCard = async () => {
    if (!title.trim()) return;

    const cardRes=await api.post(`/lists/${listId}/cards`, {
      title: title,
      description: desc,
      assigned_to: assignedTo || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
    });
    if (file) {

  const formData = new FormData();

  formData.append("file", file);

  await api.post(
    `/cards/${cardRes.data.id}/upload`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );
}

    setTitle("");
    setDesc("");
    setAssignedTo("");
    setDueDate("");
    setPriority("low");
    setFile(null);
    setOpen(false);

    const res = await api.get(`/boards/${boardId}`);
    refreshBoard(res.data);
  };

  return (
    <div style={{ marginTop: "10px" }}>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "#555",
            cursor: "pointer"
          }}
        >
          + Add Card
        </button>
      ) : (
        <div
          style={{
            background: "#fff",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <input
            placeholder="Card title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              marginBottom: "6px"
            }}
          />

          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              marginBottom: "6px"
            }}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: "100%", marginBottom: "6px" }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* ✅ assign user */}
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            style={{ width: "100%", marginBottom: "6px" }}
          >
            <option value="">Assign member</option>
            {members?.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* ✅ date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ width: "100%", marginBottom: "6px" }}
          />
          <input
  type="file"
  onChange={(e) =>
    setFile(
      e.target.files && e.target.files.length > 0
        ? e.target.files[0]
        : null
    )
  }
  style={{
    width: "100%",
    marginBottom: "10px"
  }}
/>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={createCard}
              style={{
                background: "#10b981",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "6px"
              }}
            >
              Add
            </button>

            <button
              onClick={() => setOpen(false)}
              style={{
                background: "#eee",
                border: "none",
                padding: "5px 10px",
                borderRadius: "6px"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCard;