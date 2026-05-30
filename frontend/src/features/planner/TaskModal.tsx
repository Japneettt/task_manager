 
import { useState } from "react";
import Calendar from "react-calendar";

import { api } from "../../services/api";
import "react-calendar/dist/Calendar.css";
 
const TaskModal = ({ task, onClose, refresh }: any) => {
  const [newDate, setNewDate] = useState<Date | null>(
    task?.due_date ? new Date(task.due_date) : new Date()
  );
 
  // ✅ RESCHEDULE
  const saveDate = async () => {
    if (!newDate) return;
 
    await api.patch(`/cards/${task.id}/update-due-date`, null, {
      params: {
        due_date: newDate.toISOString().slice(0, 10)
      }
    });
 
    refresh();
    onClose();
  };
 
  // ✅ COMPLETE TASK
  const completeTask = async () => {
    await api.patch(`/cards/${task.id}/complete`);
    refresh();
    onClose();
  };
 
  // ✅ DELETE TASK
  const deleteTask = async () => {
    await api.delete(`/cards/${task.id}`);
    refresh();
    onClose();
  };
 
  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
 
        {/* ✅ TITLE */}
        <h2 style={title}>{task.title}</h2>
 
        {/* ✅ DESCRIPTION */}
        <p style={desc}>
          {task.description || "No description"}
        </p>
 
        {/* ✅ CURRENT DATE */}
        <p>
          Current Due:{" "}
          <b>
            {task.due_date ? task.due_date.slice(0, 10) : "Not set"}
          </b>
        </p>
 
        {/* ✅ CALENDAR */}
        <div style={{ transform: "scale(0.85)", transformOrigin: "top left" }}>
          <Calendar
            value={newDate}
            onChange={(value) => {
              if (value instanceof Date) setNewDate(value);
            }}
          />
        </div>
 
        {/* ✅ BUTTONS */}
        <div style={btnContainer}>
 
          <button style={saveBtn} onClick={saveDate}>
            💾 Save (Reschedule)
          </button>
 
          <button style={completeBtn} onClick={completeTask}>
            ✅ Complete
          </button>
 
          <button style={deleteBtn} onClick={deleteTask}>
            🗑 Delete
          </button>
 
          <button style={closeBtn} onClick={onClose}>
            ❌ Close
          </button>
 
        </div>
      </div>
      <style>{`
        @keyframes modalIn { from { transform: translateY(8px) scale(0.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
        div[style] > div[style] { animation: modalIn 180ms ease; }
      `}</style>
    </div>
  );
};
 
export default TaskModal;
const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};
 
const modal = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  width: "380px",              // ✅ FIXED SMALL WIDTH
  maxHeight: "80vh",           // ✅ prevent overflow
  overflowY: "auto",           // ✅ scroll inside modal
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
}as const;
 
const title = {
  marginBottom: "10px"
};
 
const desc = {
  color: "#555",
  marginBottom: "10px"
};
 
const btnContainer = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  marginTop: "10px"
};
 
const saveBtn = {
  background: "#6366f1",
  color: "#fff",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer"
};
 
const completeBtn = {
  background: "green",
  color: "#fff",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer"
};
 
const deleteBtn = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer"
};
 
const closeBtn = {
  background: "#eee",
  border: "none",
  padding: "10px",
  borderRadius: "6px",
  cursor: "pointer"
};
 
 