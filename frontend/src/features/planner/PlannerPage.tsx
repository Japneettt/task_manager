import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import TaskModal from "../../features/planner/TaskModal";
 
// Color hex values for tasks
const colorHexPalette = [
  { bg: "#E9D5FF", border: "#D8B4FE", text: "#7E22CE" }, // purple
  { bg: "#DBEAFE", border: "#93C5FD", text: "#1D4ED8" }, // blue
  { bg: "#DCFCE7", border: "#BBF7D0", text: "#166534" }, // green
  { bg: "#FCE7F3", border: "#FBCFE8", text: "#BE185D" }, // pink
  { bg: "#FED7AA", border: "#FDBA74", text: "#EA580C" }, // orange
  { bg: "#CCFBF1", border: "#99F6E4", text: "#0D9488" }  // teal
];
 
// Color palette for tasks (Tailwind classes for week view)
const colorPalette = [
  { bg: "bg-purple-500/20", border: "border-purple-500/30", accent: "bg-purple-500", text: "text-purple-900" },
  { bg: "bg-blue-500/20", border: "border-blue-500/30", accent: "bg-blue-500", text: "text-blue-900" },
  { bg: "bg-green-500/20", border: "border-green-500/30", accent: "bg-green-500", text: "text-green-900" },
  { bg: "bg-pink-500/20", border: "border-pink-500/30", accent: "bg-pink-500", text: "text-pink-900" },
  { bg: "bg-orange-500/20", border: "border-orange-500/30", accent: "bg-orange-500", text: "text-orange-900" },
  { bg: "bg-teal-500/20", border: "border-teal-500/30", accent: "bg-teal-500", text: "text-teal-900" }
];
 
// Priority badge colors
const priorityColors = {
  high: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-700" },
  medium: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-700" },
  low: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-700" }
};
 
const WeekView = ({
  weekDays,
  currentDayKey,
  getTasksForDate,
  onSelectTask,
}: {
  weekDays: Date[];
  currentDayKey: string;
  getTasksForDate: (date: Date) => any[];
  onSelectTask: (task: any, day: Date) => void;
}) => {
  console.log("weekDays", weekDays);
 
  return (
    <div className="custom-week-view">
      <div className="week-grid flex flex-col gap-4 w-full">
        {weekDays.map((day) => {
          const tasks = getTasksForDate(day);
          const dayKey = day.toISOString().slice(0, 10);
          const isToday = dayKey === currentDayKey;
 
          return (
            <div
              key={dayKey}
              className={`flex flex-col w-full min-h-[120px] rounded-xl border p-4 bg-white transition duration-200 ${
                isToday
                  ? "border-indigo-200 bg-indigo-50 shadow-sm"
                  : "border-slate-200 bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold uppercase text-gray-500">
                  {day.toLocaleDateString("default", { weekday: "long" }).toUpperCase()}
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {day.getDate()}
                </div>
              </div>
 
              <div className="flex flex-col gap-2 w-full">
                {tasks.map((task: any) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onSelectTask(task, day)}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
 
const PlannerPage = () => {
  const [data, setData] = useState<any>({});
  const [date, setDate] = useState<Date | null>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedTask, setSelectedTask] = useState<any>(null);
 
  const fetchData = async () => {
    const res = await api.get("/planner");
    setData(res.data);
  };
 
  useEffect(() => {
    fetchData();
  }, []);
 
  const activeTasks = [
    ...(data?.assigned || []),
    ...(data?.today || []),
    ...(data?.overdue || [])
  ].filter(
    (t: any) =>
      !t.completed_at && t?.status !== "done" && t?.list_name !== "Done"
  );
 
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
 
  const getTaskDateKey = (task: any) => {
    const taskDate = task?.due_date || task?.created_at;
    if (!taskDate) return "";
    return taskDate.slice(0, 10);
  };
 
  const groupedTasks = useMemo(() => {
    const map: Record<string, any[]> = {};
    activeTasks.forEach((task: any) => {
      const dateKey = getTaskDateKey(task);
      if (!dateKey) return;
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(task);
    });
    console.log("Tasks:", activeTasks);
    console.log("Grouped:", map);
    return map;
  }, [activeTasks]);
 
  const selectedTasks = activeTasks.filter((t: any) => {
    if (!date) return false;
 
    const taskDate = getTaskDateKey(t);
    if (!taskDate) return false;
 
    const selectedStr = formatDate(new Date(date));
    return taskDate === selectedStr;
  });
 
  const getTasksForTile = (tileDate: Date) => {
    const localDateStr = formatDate(tileDate);
    return groupedTasks[localDateStr] || [];
  };
 
  const getTasksForDate = (tileDate: Date) => getTasksForTile(tileDate);
 
  const startOfWeek = (anchor: Date) => {
    const dateCopy = new Date(anchor);
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - ((day + 6) % 7);
    dateCopy.setDate(diff);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy;
  };
 
  const weekDays = useMemo(() => {
    const start = startOfWeek(viewDate);
    return Array.from({ length: 7 }, (_, index) => {
      const next = new Date(start);
      next.setDate(start.getDate() + index);
      return next;
    });
  }, [viewDate]);
 
  const moveView = (direction: number) => {
    if (viewMode === "month") {
      const next = new Date(viewDate);
      next.setMonth(viewDate.getMonth() + direction);
      setViewDate(next);
    } else {
      const next = new Date(viewDate);
      next.setDate(viewDate.getDate() + direction * 7);
      setViewDate(next);
    }
  };
 
  const monthLabel = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });
 
  const currentDayKey = new Date().toISOString().slice(0, 10);
 
  const palette = [
    "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(165,180,252,0.18))",
    "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(191,219,254,0.18))",
    "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(187,247,208,0.18))",
    "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(251,207,232,0.18))"
  ];
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-900">
      <Navbar />
 
      <div className="w-full min-h-screen px-6 lg:px-10">
        <div className="planner-topbar glass-card mb-6 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/60 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveView(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/75 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => moveView(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/75 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
              aria-label="Next"
            >
              ›
            </button>
          </div>
 
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Planner
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {monthLabel}
            </div>
          </div>
 
          <div className="inline-flex rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm shadow-slate-200/40">
            {(["week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-semibold transition ${
                  viewMode === mode
                    ? "rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode === "week" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        </div>
 
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="glass-card relative overflow-hidden rounded-[28px] border border-white/70 bg-white/50 p-4 shadow-2xl shadow-slate-200/30 backdrop-blur-xl lg:col-span-9 col-span-12">
            {viewMode === "week" ? (
              <div className="view-panel" key="week-view">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Week schedule
                  </div>
                  <div className="hidden items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-2 text-sm text-slate-600 sm:flex">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    Live tasks
                  </div>
                </div>
 
                <WeekView
                  weekDays={weekDays}
                  currentDayKey={currentDayKey}
                  getTasksForDate={getTasksForDate}
                  onSelectTask={(task, day) => {
                    setSelectedTask(task);
                    setDate(new Date(day));
                  }}
                />
              </div>
            ) : (
              <div className="view-panel" key="month-view">
                <Calendar
                  showNavigation={false}
                  activeStartDate={new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)}
                  onActiveStartDateChange={({ activeStartDate }) => {
                    if (activeStartDate) setViewDate(activeStartDate);
                  }}
                  onChange={(value) => {
                    if (value instanceof Date) {
                      setDate(value);
                      setViewDate(value);
                    }
                  }}
                  value={date}
                  tileContent={({ date: tileDate, view }) => {
                    if (view !== "month") return null;
                    const tasks = getTasksForTile(tileDate);
                    const dayKey = formatDate(tileDate);
 
                    return (
                      <div className="flex flex-col gap-1 mt-1 w-full">
                        {tasks.length === 0 ? (
                          <div className="text-xs italic text-slate-300">No tasks</div>
                        ) : (
                          <>
                            {tasks.slice(0, 2).map((task: any, index: number) => {
                              const colors = colorHexPalette[index % colorHexPalette.length];
                              return (
                               <button
  key={`${dayKey}-${task.id}`}
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    setSelectedTask(task);
  }}
  className="w-full text-left px-2 py-1 rounded-md text-[11px] font-medium truncate"
  style={{
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    display: "block"
  }}
>
  {task.title}
</button>
 );
 })}
                {tasks.length > 2 && (
                       <div className="text-[11px] text-slate-500 mt-1">
                                +{tasks.length - 2} more
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }}
                  tileClassName={({ date: tileDate, view }) =>
                    view === "month" && tileDate.toISOString().slice(0, 10) === currentDayKey
                      ? "today-cell"
                      : ""
                  }
                />
              </div>
            )}
          </div>
 
          <div className="glass-card rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-2xl shadow-slate-200/30 backdrop-blur-xl lg:col-span-3 col-span-12 lg:sticky lg:top-6 h-fit w-full">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                  Tasks on
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {date ? date.toDateString() : "Select a date"}
                </h3>
              </div>
              <span className="inline-flex h-11 min-w-[90px] items-center justify-center rounded-2xl bg-slate-100/80 px-4 text-sm font-semibold text-slate-700">
                {viewMode === "week" ? "Week" : "Month"}
              </span>
            </div>
 
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {selectedTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-100/50 p-6 text-center text-sm text-slate-500 font-medium">
                  No tasks for this date
                </div>
              ) : (
                selectedTasks.map((task: any, index: number) => {
                  const colors = colorPalette[index % colorPalette.length];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className={`task-card group relative flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all duration-200 ${colors.bg} ${colors.border} hover:shadow-lg hover:shadow-slate-900/15 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300/50`}
                      style={{
                        backdropFilter: "blur(10px)",
                        animation: "fadeInUp 0.4s ease-out forwards",
                        opacity: 1
                      }}
                    >
                      {/* Left accent bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${colors.accent} transition-all duration-200 group-hover:w-2`} />
                     
                      {/* Task content */}
                      <div className="ml-1 flex flex-1 flex-col gap-1">
                        <div className="text-xs uppercase tracking-wide font-semibold text-slate-600">
                          {task.list_name || "Personal"}
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {task.title}
                        </div>
                        {task.due_date && (
                          <div className="text-xs text-slate-600 mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
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
 
      <style>{`
/* ===== ANIMATIONS ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
 
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
 
/* ===== TOPBAR ===== */
.planner-topbar {
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}
 
.planner-topbar button {
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}
 
.planner-topbar button:active {
  transform: scale(0.96);
}
 
/* ===== GLASS CARD ===== */
.glass-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}
 
.glass-card:hover {
  transform: translateY(-2px);
}
 
/* ===== TASK CARD ===== */
.task-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
 
.task-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15) !important;
}
 
.task-card:active {
  transform: translateY(-1px) scale(0.98);
}
 
.task-card:focus {
  outline: none;
}
 
/* ===== DAY COLUMN ===== */
.day-column {
  transition: all 0.3s ease;
}
 
.day-column:hover {
  background-color: rgba(255, 255, 255, 0.55) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
}
 
/* ===== CALENDAR STYLES ===== */
.react-calendar {
  width: 100%;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-family: inherit;
}
 
.react-calendar__month-view {
  padding: 0;
}
 
.react-calendar__month-view__weekdays {
  text-align: center;
  font-weight: 700;
  color: #475569;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-around;
  gap: 12px;
}
 
.react-calendar__month-view__weekdays__weekday {
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
 
.react-calendar__month-view__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  padding: 0;
}
 
.react-calendar__month-view__days__day {
  border: none !important;
}
 
.react-calendar__tile {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  padding: 6px !important;
  min-height: 120px;
  gap: 2px;
}
 
.react-calendar__tile abbr
 
.react-calendar__tile:hover {
  background: rgba(255, 255, 255, 0.7) !important;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12) !important;
}
 
.react-calendar__tile--now {
  background: linear-gradient(135deg, rgba(199, 210, 254, 0.35), rgba(221, 214, 254, 0.35)) !important;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) inset, 0 8px 24px rgba(15, 23, 42, 0.08) !important;
  border-color: rgba(139, 92, 246, 0.3) !important;
}
 
.react-calendar__tile--active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(191, 219, 254, 0.2)) !important;
  color: #0f172a !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
}
 
.today-cell {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35) inset !important;
}
 
/* ===== TILE CONTENT ===== */
.tile-content-grid {
  display: block;
  margin-top: 6px;
  width: 100%;
}
 
/* ===== WEEK GRID ===== */
.custom-week-view {
  width: 100%;
}
 
.custom-week-view * {
  box-sizing: border-box;
}
 
.custom-week-view .week-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
 
.custom-week-view .day-column {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 120px;
  align-items: stretch;
  overflow: hidden;
  background: inherit;
  border: 1px solid;
  border-radius: 8px;
}
 
.custom-week-view .day-column button {
  display: block;
  width: 100%;
}
 
.custom-week-view .react-calendar,
.custom-week-view .react-calendar__tile,
.custom-week-view .react-calendar__month-view,
.custom-week-view .react-calendar__month-view__weekdays,
.custom-week-view .react-calendar__month-view__days {
  all: unset;
  box-sizing: border-box;
}
 
.tile-content-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
 
.react-calendar__tile {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  gap: 4px;
  padding: 6px !important;
  min-height: 92px;
}
 
.react-calendar__tile > div {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
 
 
.react-calendar__tile abbr {
  display: block;
  width: 100%;
  font-weight: 600;
  margin-bottom: 2px;
}
 
.react-calendar__tile button {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
 
.react-calendar__month-view__days__day {
  padding: 4px !important;
}
 
.react-calendar__tile abbr {
  font-size: 0.78rem;
}
 
.react-calendar__tile--now {
  border: 1px solid rgba(79, 70, 229, 0.35);
}
 
/* ===== SCROLLBAR STYLING ===== */
.space-y-3::-webkit-scrollbar,
.day-task-list::-webkit-scrollbar,
.react-calendar::-webkit-scrollbar {
  width: 6px;
}
 
.space-y-3::-webkit-scrollbar-track,
.day-task-list::-webkit-scrollbar-track,
.react-calendar::-webkit-scrollbar-track {
  background: transparent;
}
 
.space-y-3::-webkit-scrollbar-thumb,
.day-task-list::-webkit-scrollbar-thumb,
.react-calendar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.3);
  border-radius: 3px;
}
 
.space-y-3::-webkit-scrollbar-thumb:hover,
.day-task-list::-webkit-scrollbar-thumb:hover,
.react-calendar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.5);
}
 
/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .week-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}
 
@media (max-width: 768px) {
  .planner-topbar {
    align-items: stretch;
  }
 
  .week-grid {
    grid-template-columns: repeat(7, minmax(120px, 1fr));
    gap: 8px;
  }
 
  .day-column {
    min-height: 320px;
  }
 
  .task-card {
    padding: 8px !important;
    font-size: 11px !important;
  }
 
  .react-calendar__tile {
    min-height: 120px !important;
  }
}
 
@media (max-width: 640px) {
  .week-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
  }
 
  .day-column {
    min-height: 280px;
  }
}
`}</style>
    </div>
  );
};
 
export default PlannerPage;
 
 
