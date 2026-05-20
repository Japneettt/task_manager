
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";

const PlannerPage = () => {
  const [data, setData] = useState<any>({});
  const [date, setDate] = useState<Date | null>(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const fetchData = async () => {
    const res = await api.get("/planner");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date();

  // const selectedTasks = [
  //   ...(data?.assigned || []),
  //   ...(data?.today || []),
  //   ...(data?.overdue || [])
  // ].filter((t: any) =>
  //   date &&
  //   new Date(t.due_date).toDateString() === date.toDateString()
  // );
  const selectedTasks = [
    ...(data?.assigned || []),
    ...(data?.today || []),
    ...(data?.overdue || [])
  ].filter((t: any) =>
    date &&
    t?.due_date &&
    t.due_date.slice(0, 10) === date.toISOString().slice(0, 10)
  );

  const allTasks = [
    ...(data?.assigned || []),
    ...(data?.today || []),
    ...(data?.overdue || [])
  ];

  const getColor = (due_date: string) => {
    const d = new Date(due_date);
    if (d < today) return "red";
    if (d.toDateString() === today.toDateString()) return "orange";
    return "green";
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <style>
        {`
.react-calendar {
  width: 100%;
  height: 100%;
  border: none;
}

.react-calendar__tile {
  height: 100px !important;
  vertical-align: top;
  padding: 5px;
}

.tile-content {
  margin-top: 4px;
}

.task-pill {
  font-size: 11px;
  background: #f3f4f6;
  border-radius: 5px;
  padding: 3px 5px;
  margin-top: 3px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
`}
      </style>

      <div style={{ padding: "20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>
          Planner 📅
        </h2>

        {/* ✅ MAIN LAYOUT */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr", // ✅ CALENDAR BIGGER
          gap: "20px"
        }}>

          {/* ✅ BIG TRELLO STYLE CALENDAR */}
          <div style={{ ...card, height: "650px" }}>
            <Calendar
              value={date}
              onChange={(value) => {
                if (value instanceof Date) setDate(value);
              }}

              tileContent={({ date }) => {
                const tasks = allTasks.filter((task: any) =>
                  task.due_date &&
                  new Date(task.due_date).toDateString() === date.toDateString()
                );


                // tileContent={({ date }) => {
                //   const tasks = allTasks.filter((task: any) =>
                //     task.due_date &&
                //     new Date(task.due_date).toDateString() === date.toDateString()
                //   );

                return (
                  <div className="tile-content">
                    {tasks.slice(0, 3).map((task: any) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="task-pill"
                        style={{
                          borderLeft: `3px solid ${getColor(task.due_date)}`
                        }}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          {/* ✅ RIGHT PANEL */}
          <div style={{
            ...card,
            height: "650px",
            overflowY: "auto"
          }}>

            {/* ✅ SELECTED DATE TASKS */}
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

            {/* ✅ EXISTING SECTIONS (UNCHANGED) */}
            <Section title="Assigned Tasks" items={data.assigned} getColor={getColor} onClick={setSelectedTask} />
            <Section title="Today's Tasks" items={data.today} getColor={getColor} onClick={setSelectedTask} />
            <Section title="Overdue" items={data.overdue} getColor={getColor} onClick={setSelectedTask} />

          </div>
        </div>
      </div>

      {/* ✅ MODAL */}
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

const Section = ({ title, items, getColor, onClick }: any) => (
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
          borderLeft: `4px solid ${getColor(item.due_date)}`,
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        {item.title}
      </div>
    )) : "No tasks"}
  </div>
);

const TaskModal = ({ task, onClose, refresh }: any) => {
  const deleteTask = async () => {
    await api.delete(`/cards/${task.id}`);
    refresh();
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{task.title}</h3>
        <p>{task.description}</p>

        <button onClick={deleteTask}>Delete</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const card = {
  background: "#fff",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
};

const overlay = {
  position: "fixed" as const,
  top: 0, left: 0,
  width: "100%", height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px"
};

export default PlannerPage;
