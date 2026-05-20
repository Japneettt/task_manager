
// import { useState } from "react";
// import { api } from "../../services/api";
// import "react-calendar/dist/Calendar.css";
// const TaskModal = ({ task, onClose, refresh }: any) => {
//   const [newDate, setNewDate] = useState(
//     task?.due_date ? task.due_date.slice(0, 10) : ""
//   );

//   // ✅ UPDATE DUE DATE
//   const updateDueDate = async () => {
//     if (!newDate) return;

//     await api.patch(`/cards/${task.id}/update-due-date`, null, {
//       params: { due_date: newDate }
//     });

//     refresh();
//     onClose();
//   };

//   // ✅ DELETE TASK
//   const deleteTask = async () => {
//     await api.delete(`/cards/${task.id}`);
//     refresh();
//     onClose();
//   };

//   return (
//     <div style={overlay}>
//       <div style={modal}>

//         {/* ✅ TITLE */}
//         <h2 style={title}>{task.title}</h2>

//         {/* ✅ DESCRIPTION */}
//         <p style={desc}>
//           {task.description || "No description"}
//         </p>

//         {/* ✅ CURRENT DUE DATE */}
//         <p style={{ marginBottom: "10px" }}>
//           📅 Current Due Date:
//           <b> {task.due_date ? task.due_date.slice(0, 10) : "Not set"}</b>
//         </p>

//         {/* ✅ DATE PICKER */}
//         <label style={label}>Change Due Date</label>

//         <input
//           type="date"
//           value={newDate}
//           onChange={(e) => setNewDate(e.target.value)}
//           style={input}
//         />

//         {/* ✅ BUTTONS */}
//         <div style={btnContainer}>
//           <button style={primaryBtn} onClick={updateDueDate}>
//             📅 Update Due Date
//           </button>

//           <button style={deleteBtn} onClick={deleteTask}>
//             🗑 Delete Task
//           </button>

//           <button style={closeBtn} onClick={onClose}>
//             ❌ Close
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default TaskModal;




// // ✅ ✅ STYLES (NO ERRORS NOW)

// const overlay = {
//   position: "fixed" as const,
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   background: "rgba(0,0,0,0.5)",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   zIndex: 1000
// };

// const modal = {
//   background: "#fff",
//   padding: "25px",
//   borderRadius: "12px",
//   width: "420px",
//   boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
// };

// const title = {
//   marginBottom: "10px"
// };

// const desc = {
//   color: "#555",
//   marginBottom: "10px"
// };

// const label = {
//   fontSize: "14px",
//   fontWeight: 500
// };

// const input = {
//   width: "100%",
//   padding: "8px",
//   margin: "10px 0",
//   borderRadius: "6px",
//   border: "1px solid #ddd"
// };

// const btnContainer = {
//   display: "flex",
//   flexDirection: "column",
//   gap: "10px"
// }as const;

// const primaryBtn = {
//   background: "#6366f1",
//   color: "#fff",
//   border: "none",
//   padding: "10px",
//   borderRadius: "6px",
//   cursor: "pointer"
// };

// const deleteBtn = {
//   background: "red",
//   color: "#fff",
//   border: "none",
//   padding: "10px",
//   borderRadius: "6px",
//   cursor: "pointer"
// };

// const closeBtn = {
//   background: "#eee",
//   border: "none",
//   padding: "10px",
//   borderRadius: "6px",
//   cursor: "pointer"
// };

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
    <div style={overlay}>
      <div style={modal}>

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
        <Calendar
          value={newDate}
          onChange={(value) => {
            if (value instanceof Date) setNewDate(value);
          }}
        />

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
  padding: "25px",
  borderRadius: "12px",
  width: "450px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
};

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
  gap: "10px",
  marginTop: "15px"
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
