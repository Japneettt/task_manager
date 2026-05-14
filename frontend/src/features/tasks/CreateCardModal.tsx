import { useState, type ChangeEvent, type CSSProperties } from "react";
import { createCard } from "../../services/api";

interface Props {
  listId: string;
  onClose: () => void;
  refresh: () => void;
}

const backdropStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: CSSProperties = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  minWidth: "360px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
};

const CreateCardModal = ({ listId, onClose, refresh }: Props) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    due_date: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setLoading(true);

      await createCard(listId, {
        title: form.title,
        description: form.description || null,
        assigned_to: form.assigned_to || null,
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      });

      refresh();
      onClose();
    } catch (err: any) {
      console.error("Error creating card:", err);

      if (err.response) {
        console.log("BACKEND ERROR:", err.response.data);
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: "10px" }}>Create Task</h3>

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          style={inputStyle}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="assigned_to"
          placeholder="Assign user email (e.g. abc@gmail.com)"
          value={form.assigned_to}
          onChange={handleChange}
          style={inputStyle}
        />

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
          style={inputStyle}
        />

        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "8px 14px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {loading ? "Creating..." : "Create"}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "8px 14px",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal;
