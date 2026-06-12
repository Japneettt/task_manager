import { useState } from "react";
import { api } from "../../services/api";
import MiniDatePicker from "./MiniDatePicker";
 
interface TaskActionModalProps {
  task: any;
  onClose: () => void;
  refresh: () => void;
}
 
const parseLocalDate = (value: string) => {
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
};
 
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
 
const TaskActionModal: React.FC<TaskActionModalProps> = ({ task, onClose, refresh }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (task?.due_date) return parseLocalDate(task.due_date);
    if (task?.created_at) return parseLocalDate(task.created_at);
    return new Date();
  });
  const [loading, setLoading] = useState(false);
 
  const handleShowCalendar = () => {
    setShowCalendar(true);
  };
 
  const handleSaveDate = async () => {
    if (!selectedDate) return;
 
    setLoading(true);
    try {
      const dueDate = formatLocalDate(selectedDate);
      await api.patch(`/cards/${task.id}/update-due-date`, null, {
        params: {
          due_date: dueDate
        }
      });
      refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  };
 
  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.patch(`/cards/${task.id}/complete`);
      refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  };
 
  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/cards/${task.id}`);
      refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  };
 
  const formattedCurrentDue = task?.due_date ? task.due_date.slice(0, 10) : "Not set";
  const formattedSelected = selectedDate ? formatLocalDate(selectedDate) : "Select a date";
 
  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{task.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{task.description || "No description"}</p>
            <p className="mt-3 text-sm text-slate-700">
              Current Due: <span className="font-semibold">{formattedCurrentDue}</span>
            </p>
            {showCalendar && (
              <p className="mt-1 text-sm text-slate-500">
                New Date: <span className="font-medium">{formattedSelected}</span>
              </p>
            )}
          </div>
 
          <div className="grid gap-3">
            {!showCalendar ? (
              <button
                onClick={handleShowCalendar}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/40 transition-transform duration-200 hover:scale-105"
              >
                Reschedule
              </button>
            ) : (
              <button
                onClick={() => setShowCalendar(false)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-transform duration-200 hover:scale-105"
              >
                Close Calendar
              </button>
            )}
 
            <button
              onClick={handleComplete}
              disabled={loading}
              className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/40 transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              ✅ Complete
            </button>
 
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200/40 transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              🗑 Delete
            </button>
 
            <button
              onClick={onClose}
              className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-transform duration-200 hover:scale-105"
            >
              ❌ Close
            </button>
          </div>
 
          {showCalendar && (
            <div className="mt-2 flex justify-center">
              <MiniDatePicker
                selectedDate={selectedDate}
                onChange={setSelectedDate}
                onSave={handleSaveDate}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes modalIn { from { transform: translateY(8px) scale(0.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
        div[style] > div[style] { animation: modalIn 180ms ease; }
      `}</style>
    </div>
  );
};
 
export default TaskActionModal;
 
const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15, 23, 42, 0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
  zIndex: 1000
};
 
const modal = {
  background: "#ffffff",
  borderRadius: "28px",
  boxShadow: "0 25px 80px rgba(15, 23, 42, 0.18)",
  maxWidth: "420px",
  width: "100%",
  padding: "24px",
  overflow: "hidden"
} as const;
 