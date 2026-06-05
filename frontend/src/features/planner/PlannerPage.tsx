import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import TaskModal from "../../features/planner/TaskModal";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const PlannerPage = () => {
  const [data, setData] = useState<any>({});
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [date, setDate] = useState<Date | null>(new Date());

  const fetchData = async () => {
    const res = await api.get("/planner");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allTasks = [
    ...(data?.assigned || []),
    ...(data?.today || []),
    ...(data?.overdue || [])
  ];

  // ✅ IMPORTANT FIX: Convert string → proper date
const formatDate = (d: any) => {
  if (!d) return null;

  try {
    // ✅ handle string or datetime
    const date = new Date(d);

    if (isNaN(date.getTime())) {
      console.log("INVALID DATE:", d);
      return null;
    }

    return date.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

const getColor = (index: number) => {
  const colors = [
    "#fb7185", // soft pink
    "#facc15", // soft yellow
    "#4ade80", // soft green
    "#818cf8", // soft purple
    "#60a5fa", // soft blue
    "#fb923c"  // soft orange
  ];
  return colors[index % colors.length];
};

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const events = allTasks.flatMap((task: any, index: number) => {
  const start = formatDate(task.created_at);
  const end = formatDate(task.due_date);

  if (!start) return [];

  const color = getColor(index);
  const arr: any[] = [];

  // ✅ START BLOCK (2 days)
  arr.push({
    id: task.id + "_start",
    title: task.title,
    start: start,
    end: addDays(start, 1),
    backgroundColor: `${color}30`,
    borderColor: color,
    classNames: ["event-start"],
  });

  // ✅ CONNECTOR (ONLY if end exists and far enough)
  if (end) {
    arr.push({
      id: task.id + "_connector",
      title: "",
      start: addDays(start, 1),
      end: addDays(end, -1), // ✅ middle section

      display: "background", // ✅ KEY TRICK
      backgroundColor: "transparent",

      classNames: ["event-connector"],
      extendedProps: { color },
    });
  }

  // ✅ END BLOCK
  if (end) {
    arr.push({
      id: task.id + "_end",
      title: task.title,
      start: end,
      end: end,
      backgroundColor: `${color}30`,
      borderColor: color,
      classNames: ["event-end"],
    });
  }

  return arr;
});

  // ✅ selected tasks (right side)
  const selectedTasks = allTasks.filter((t: any) =>
    date &&
    t?.due_date &&
    formatDate(t.due_date) === formatDate(date)
  );

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <style>{`

`}</style>

      <div style={{ padding: "20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>
          Planner 📅
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px"
          }}
        >

          {/* ✅ CALENDAR */}
          <div style={{ ...card, height: "650px" }}>
            <FullCalendar
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  events={events}

  eventDisplay="block"
  dayMaxEventRows={3}

  height="600px"

  headerToolbar={{
    left: "today prev,next",
    center: "title",
    right: "dayGridMonth,dayGridWeek,dayGridDay"
  }}

  editable={false}

eventClick={(info) => {
  const realId = info.event.id.split("_")[0];  // ✅ extract original id
  const task = allTasks.find((t) => t.id == realId);
  setSelectedTask(task);
}}

  dateClick={(info) => {
    setDate(new Date(info.dateStr));
  }}
/>
          </div>

          {/* ✅ RIGHT PANEL (UNCHANGED) */}
          <div
            style={{
              ...card,
              height: "650px",
              overflowY: "auto"
            }}
          >

            <div style={{ marginBottom: "20px" }}>
              <h3>Tasks on {date?.toDateString()}</h3>

              {selectedTasks.length === 0 ? (
                <p>No tasks</p>
              ) : (
                selectedTasks.map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    style={{
                      padding: "10px",
                      marginTop: "8px",
                      background: "#eef2ff",
                      borderLeft: "4px solid #6366f1",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    {task.title}
                  </div>
                ))
              )}
            </div>

            <Section title="Assigned Tasks" items={data.assigned} onClick={setSelectedTask} />
            <Section title="Today's Tasks" items={data.today} onClick={setSelectedTask} />
            <Section title="Overdue" items={data.overdue} onClick={setSelectedTask} />

          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          refresh={fetchData}
        />
      )}
    </div>
  );
};

// ✅ section unchanged
const Section = ({ title, items, onClick }: any) => (
  <div style={{ marginBottom: "20px" }}>
    <h3>{title}</h3>
    {items?.length ? items.map((item: any) => (
      <div
        key={item.id}
        onClick={() => onClick(item)}
        style={{
          padding: "10px",
          margin: "8px 0",
          background: "#fff",
          borderLeft: "4px solid #6366f1",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        {item.title}
      </div>
    )) : "No tasks"}
  </div>
);

const card = {
  background: "#fff",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
};

export default PlannerPage;
// import { useEffect, useState } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { api } from "../../services/api";
// import Navbar from "../../components/layout/Navbar";
// import TaskModal from "../../features/planner/TaskModal";

// const PlannerPage = () => {
//   const [data, setData] = useState<any>({});
//   const [date, setDate] = useState<Date | null>(new Date());
//   const [selectedTask, setSelectedTask] = useState<any>(null);

//   const fetchData = async () => {
//     const res = await api.get("/planner");
//     setData(res.data);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const today = new Date();

//   const selectedTasks = [
//     ...(data?.assigned || []),
//     ...(data?.today || []),
//     ...(data?.overdue || [])
//   ].filter((t: any) =>
//     date &&
//     t?.due_date &&
//     t.due_date.slice(0, 10) === date.toISOString().slice(0, 10)
//   );

//   const allTasks = [
//     ...(data?.assigned || []),
//     ...(data?.today || []),
//     ...(data?.overdue || [])
//   ];

//   const getColor = (due_date: string) => {
//     const d = new Date(due_date);
//     if (d < today) return "red";
//     if (d.toDateString() === today.toDateString()) return "orange";
//     return "green";
//   };

//   return (
//     <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
//       <Navbar />

//       {/* ✅ FIXED CSS (IMPORTANT) */}
//       <style>
//         {`
// .react-calendar {
//   width: 100%;
//   border: none !important;
// }

// /* ✅ BIG GRID TILE */
// .react-calendar__tile {
//   height: 120px !important;
//   padding: 8px !important;
//   border: 1px solid #e5e7eb !important;
//   background: #ffffff !important;

//   display: flex !important;
//   flex-direction: column;
//   align-items: flex-start;
//   justify-content: flex-start;
// }

// /* ✅ TODAY TILE */
// .react-calendar__tile--now {
//   background: #eef2ff !important;
// }

// /* ✅ SELECTED TILE */
// .react-calendar__tile--active {
//   background: #2563eb !important;
//   color: white !important;
// }

// /* ✅ IMPORTANT: FIX TEXT INSIDE TILE */
// .react-calendar__tile abbr {
//   font-size: 13px;
//   font-weight: 600;
//   margin-bottom: 4px;
//   display: block;
// }

// /* ✅ WEEK HEADERS */
// .react-calendar__month-view__weekdays {
//   text-align: center;
//   font-weight: 600;
//   font-size: 12px;
// }

// /* ✅ TASK CONTAINER */
// .tile-content {
//   margin-top: 6px;
//   width: 100%;
// }

// /* ✅ TASK CARD */
// .task-pill {
//   width: 100%;
//   background: #f9fafb;
//   border-radius: 6px;
//   padding: 6px 8px;
//   margin-top: 5px;
//   font-size: 11px;
//   cursor: pointer;

//   box-shadow: 0 2px 6px rgba(0,0,0,0.12);

//   overflow: hidden;
//   white-space: nowrap;
//   text-overflow: ellipsis;

//   color: #111827;
// }

// /* ✅ FIX: SHOW TASKS PROPERLY ON BLUE TILE */
// .react-calendar__tile--active .task-pill {
//   background: #e0e7ff !important;  /* light visible */
//   color: #111827 !important;
// }

// /* ✅ HOVER EFFECT (optional but looks good) */
// .task-pill:hover {
//   transform: scale(1.02);
//   transition: 0.2s;
// }

// /* ✅ OPTIONAL: CLEAN GRID LOOK */
// .react-calendar__month-view__days {
//   gap: 0px !important;
// }
// `}
//       </style>

//       <div style={{ padding: "20px" }}>
//         <h2 style={{ fontSize: "26px", fontWeight: "700" }}>
//           Planner 📅
//         </h2>

//         {/* ✅ GRID LAYOUT */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "2fr 1fr",
//             gap: "20px"
//           }}
//         >

//           {/* ✅ CALENDAR */}
//           <div style={{ ...card, height: "650px" }}>
//             <Calendar
//               value={date}
//               onChange={(value) => {
//                 if (value instanceof Date) setDate(value);
//               }}

//               tileContent={({ date }) => {
//                 const tasks = allTasks.filter((task: any) =>
//                   task.due_date &&
//                   new Date(task.due_date).toDateString() === date.toDateString()
//                 );

//                 const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7"];

//                 return (
//                   <div className="tile-content">
//                     {tasks.slice(0, 3).map((task: any, i: number) => (
//                       <div
//                         key={task.id}
//                         onClick={() => setSelectedTask(task)}
//                         className="task-pill"
//                         style={{
//                           borderLeft: `4px solid ${colors[i % colors.length]}`
//                         }}
//                       >
//                         {task.title}
//                       </div>
//                     ))}

//                     {tasks.length > 3 && (
//                       <div style={{
//                         fontSize: "10px",
//                         color: "#6b7280"
//                       }}>
//                         +{tasks.length - 3} more
//                       </div>
//                     )}
//                   </div>
//                 );
//               }}
//             />
//           </div>

//           {/* ✅ RIGHT PANEL */}
//           <div
//             style={{
//               ...card,
//               height: "650px",
//               overflowY: "auto"
//             }}
//           >

//             <div style={{ marginBottom: "20px" }}>
//               <h3>Tasks on {date?.toDateString()}</h3>

//               {selectedTasks.length === 0 ? (
//                 <p>No tasks</p>
//               ) : (
//                 selectedTasks.map((task: any) => (
//                   <div
//                     key={task.id}
//                     onClick={() => setSelectedTask(task)}
//                     style={{
//                       padding: "10px",
//                       marginTop: "8px",
//                       background: "#eef2ff",
//                       borderLeft: "4px solid #6366f1",
//                       borderRadius: "8px",
//                       cursor: "pointer"
//                     }}
//                   >
//                     {task.title}
//                   </div>
//                 ))
//               )}
//             </div>

//             <Section title="Assigned Tasks" items={data.assigned} getColor={getColor} onClick={setSelectedTask} />
//             <Section title="Today's Tasks" items={data.today} getColor={getColor} onClick={setSelectedTask} />
//             <Section title="Overdue" items={data.overdue} getColor={getColor} onClick={setSelectedTask} />

//           </div>
//         </div>
//       </div>

//       {/* ✅ MODAL */}
//       {selectedTask && (
//         <TaskModal
//           task={selectedTask}
//           onClose={() => setSelectedTask(null)}
//           refresh={fetchData}
//         />
//       )}
//     </div>
//   );
// };

// const Section = ({ title, items, getColor, onClick }: any) => (
//   <div style={{ marginBottom: "20px" }}>
//     <h3>{title}</h3>
//     {items?.length ? items.map((item: any) => (
//       <div
//         key={item.id}
//         onClick={() => onClick(item)}
//         style={{
//           padding: "10px",
//           margin: "8px 0",
//           background: "#fff",
//           borderLeft: `4px solid ${getColor(item.due_date)}`,
//           borderRadius: "8px",
//           cursor: "pointer"
//         }}
//       >
//         {item.title}
//       </div>
//     )) : "No tasks"}
//   </div>
// );

// const card = {
//   background: "#fff",
//   padding: "15px",
//   borderRadius: "10px",
//   boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
// };

// export default PlannerPage;