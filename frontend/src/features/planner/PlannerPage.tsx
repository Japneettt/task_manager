import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";

/* ============================================================================
   THEME — premium light-lavender palette
   Used for: month-view task chips (inline hex, since react-calendar renders
   outside Tailwind's reach) and week-view / sidebar task chips (Tailwind).
============================================================================ */
const taskHexPalette = [
  { bg: "#EDE9FE", border: "#DDD6FE", text: "#6D28D9" }, // violet
  { bg: "#E0E7FF", border: "#C7D2FE", text: "#4338CA" }, // indigo
  { bg: "#FCE7F3", border: "#FBCFE8", text: "#BE185D" }, // rose
  { bg: "#E0F2FE", border: "#BAE6FD", text: "#0369A1" }, // sky
  { bg: "#FEF3C7", border: "#FDE68A", text: "#B45309" }, // amber
  { bg: "#CCFBF1", border: "#99F6E4", text: "#0F766E" }, // teal
];

const taskColorClasses = [
  { bg: "bg-violet-50", border: "border-violet-200", accent: "bg-violet-500", text: "text-violet-800" },
  { bg: "bg-indigo-50", border: "border-indigo-200", accent: "bg-indigo-500", text: "text-indigo-800" },
  { bg: "bg-rose-50", border: "border-rose-200", accent: "bg-rose-500", text: "text-rose-800" },
  { bg: "bg-sky-50", border: "border-sky-200", accent: "bg-sky-500", text: "text-sky-800" },
  { bg: "bg-amber-50", border: "border-amber-200", accent: "bg-amber-500", text: "text-amber-800" },
  { bg: "bg-teal-50", border: "border-teal-200", accent: "bg-teal-500", text: "text-teal-800" },
];

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

/* ============================================================================
   Small inline icons (zero extra dependencies)
============================================================================ */
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
  </svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

/* ============================================================================
   Date helpers
============================================================================ */
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

/* ============================================================================
   MiniDatePicker — compact, self-contained calendar grid.
   Pure date-selection UI; saving/cancelling lives in the parent so this
   never grows taller than a small popup.
============================================================================ */
interface MiniDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
}

function MiniDatePicker({ selectedDate, onChange }: MiniDatePickerProps) {
  const initialDate = selectedDate ?? new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  }, []);

  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : null;

  const days = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ label: string; date?: Date }> = [];
    for (let i = 0; i < firstDayIndex; i += 1) cells.push({ label: "" });
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ label: String(day), date: new Date(year, month, day) });
    }
    return cells;
  }, [year, month]);

  const monthLabel = currentMonth.toLocaleString("default", { month: "long" });

  return (
    <div className="w-full rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-violet-500 transition hover:bg-violet-100"
          aria-label="Previous month"
        >
          <IconChevronLeft />
        </button>
        <span className="text-sm font-bold text-slate-800">
          {monthLabel} {year}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-violet-500 transition hover:bg-violet-100"
          aria-label="Next month"
        >
          <IconChevronRight />
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wide text-violet-400">
        {weekdayLabels.map((label, i) => (
          <div key={`${label}-${i}`} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, index) => {
          if (!cell.date) return <div key={`empty-${index}`} />;

          const cellKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const isSelected = cellKey === selectedKey;
          const isToday = cellKey === today;

          return (
            <button
              key={cellKey}
              type="button"
              onClick={() => onChange(cell.date as Date)}
              className={`relative flex aspect-square w-full items-center justify-center rounded-lg text-[13px] font-semibold transition-all ${
                isSelected
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-400/50"
                  : "text-slate-700 hover:bg-violet-100"
              } ${isToday && !isSelected ? "ring-1 ring-inset ring-violet-300" : ""}`}
            >
              {cell.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   TaskActionModal — small, content-fit popup.
   Calendar replaces the action buttons in place (instead of stacking below
   them), so Save/Cancel always sit right under the grid — no scrolling.
============================================================================ */
interface TaskActionModalProps {
  task: any;
  onClose: () => void;
  refresh: () => void;
}

function TaskActionModal({ task, onClose, refresh }: TaskActionModalProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (task?.due_date) return parseLocalDate(task.due_date);
    if (task?.created_at) return parseLocalDate(task.created_at);
    return new Date();
  });
  const [loading, setLoading] = useState(false);

  const handleSaveDate = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const dueDate = formatLocalDate(selectedDate);
      await api.patch(`/cards/${task.id}/update-due-date`, null, {
        params: { due_date: dueDate },
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

  return (
    <div
      className="task-modal-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="task-modal-pop relative flex w-full max-w-sm max-h-[88vh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-violet-900/20 ring-1 ring-violet-100"
      >
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
        >
          <IconX />
        </button>

        <div className="task-modal-scroll flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <h2 className="pr-8 text-lg font-bold leading-snug text-slate-900">{task.title}</h2>
          {task.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{task.description}</p>
          )}

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <IconCalendar />
            {showCalendar ? "Choose a new date" : `Due ${formattedCurrentDue}`}
          </div>

          <div className="mt-5">
            {!showCalendar ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCalendar(true)}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-300/50 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <IconCalendar /> Reschedule
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200/60 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconCheck /> Complete
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 transition-transform duration-200 hover:scale-[1.02] hover:bg-rose-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconTrash /> Delete
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <MiniDatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDate}
                    disabled={loading}
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-300/50 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Saving…" : "Save date"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   WeekView — true 7-day grid on larger screens (stacks on mobile).
   CSS grid stretches every column to the tallest one automatically, so a
   day with 2-3+ tasks is never clipped; nothing here uses overflow:hidden
   or a fixed height.
============================================================================ */
interface WeekViewProps {
  weekDays: Date[];
  currentDayKey: string;
  getTasksForDate: (date: Date) => any[];
  onSelectTask: (task: any, day: Date) => void;
}

function WeekView({ weekDays, currentDayKey, getTasksForDate, onSelectTask }: WeekViewProps) {
  return (
    <div className="grid w-full grid-cols-1 items-stretch gap-3 md:grid-cols-7">
      {weekDays.map((day) => {
        const tasks = getTasksForDate(day);
        const dayKey = day.toISOString().slice(0, 10);
        const isToday = dayKey === currentDayKey;

        return (
          <div
            key={dayKey}
            className={`flex w-full flex-col rounded-2xl border p-3.5 transition-all duration-200 ${
              isToday
                ? "border-violet-300 bg-violet-50/70 shadow-md shadow-violet-200/50"
                : "border-violet-100 bg-white hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50"
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                {day.toLocaleDateString("default", { weekday: "short" })}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  isToday ? "bg-violet-600 text-white" : "text-slate-700"
                }`}
              >
                {day.getDate()}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              {tasks.length === 0 ? (
                <span className="text-xs italic text-slate-300">No tasks</span>
              ) : (
                tasks.map((task: any, idx: number) => {
                  const c = taskColorClasses[idx % taskColorClasses.length];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      title={task.title}
                      onClick={() => onSelectTask(task, day)}
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold leading-snug transition-colors ${c.bg} ${c.border} ${c.text} hover:brightness-95`}
                    >
                      {task.title}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================================
   PlannerPage
============================================================================ */
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
    ...(data?.overdue || []),
  ].filter((t: any) => !t.completed_at && t?.status !== "done" && t?.list_name !== "Done");

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
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(task);
    });
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

  const monthLabel = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const currentDayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/40 text-slate-900">
      <Navbar />

      <div className="w-full min-h-screen px-4 pb-12 pt-6 sm:px-6 lg:px-10">
        <div className="planner-topbar mb-6 flex flex-col gap-4 rounded-3xl border border-violet-100 bg-white/70 p-4 shadow-xl shadow-violet-200/40 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveView(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-50"
              aria-label="Previous"
            >
              <IconChevronLeft />
            </button>
            <button
              onClick={() => moveView(1)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-50"
              aria-label="Next"
            >
              <IconChevronRight />
            </button>
          </div>

          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">Planner</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{monthLabel}</div>
          </div>

          <div className="inline-flex rounded-full border border-violet-100 bg-violet-50/70 p-1 shadow-sm">
            {(["week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  viewMode === mode
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-400/30"
                    : "text-slate-500 hover:text-violet-700"
                }`}
              >
                {mode === "week" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="planner-glass relative overflow-hidden rounded-[28px] border border-violet-100 bg-white/60 p-4 shadow-2xl shadow-violet-200/30 backdrop-blur-xl lg:col-span-9 col-span-12">
            {viewMode === "week" ? (
              <div key="week-view">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-400">
                    Week schedule
                  </div>
                  <div className="hidden items-center gap-2 rounded-2xl bg-violet-50 px-3 py-2 text-sm text-violet-600 sm:flex">
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
              <div key="month-view">
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
                      <div className="tile-content-grid">
                        {tasks.length === 0 ? (
                          <div className="text-xs italic text-violet-200">No tasks</div>
                        ) : (
                          <>
                            {tasks.slice(0, 2).map((task: any, index: number) => {
                              const colors = taskHexPalette[index % taskHexPalette.length];
                              return (
                                <button
                                  key={`${dayKey}-${task.id}`}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTask(task);
                                  }}
                                  className="w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-medium"
                                  style={{
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    color: colors.text,
                                    display: "block",
                                  }}
                                >
                                  {task.title}
                                </button>
                              );
                            })}
                            {tasks.length > 2 && (
                              <div className="mt-1 text-[11px] font-semibold text-violet-400">
                                +{tasks.length - 2} more
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }}
                  tileClassName={({ date: tileDate, view }) =>
                    view === "month" && tileDate.toISOString().slice(0, 10) === currentDayKey ? "today-cell" : ""
                  }
                />
              </div>
            )}
          </div>

          <div className="planner-glass rounded-[28px] border border-violet-100 bg-white/70 p-5 shadow-2xl shadow-violet-200/30 backdrop-blur-xl lg:col-span-3 col-span-12 lg:sticky lg:top-6 h-fit w-full">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Tasks on</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {date ? date.toDateString() : "Select a date"}
                </h3>
              </div>
              <span className="inline-flex h-11 min-w-[90px] items-center justify-center rounded-2xl bg-violet-50 px-4 text-sm font-semibold text-violet-600">
                {viewMode === "week" ? "Week" : "Month"}
              </span>
            </div>

            <div className="planner-scroll space-y-3 max-h-[600px] overflow-y-auto">
              {selectedTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-6 text-center text-sm font-medium text-violet-400">
                  No tasks for this date
                </div>
              ) : (
                selectedTasks.map((task: any, index: number) => {
                  const colors = taskColorClasses[index % taskColorClasses.length];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className={`task-card group relative flex w-full flex-col gap-2 rounded-xl border p-3 pl-4 text-left transition-all duration-200 ${colors.bg} ${colors.border} hover:shadow-lg hover:shadow-violet-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-300/50`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${colors.accent} transition-all duration-200 group-hover:w-2`} />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {task.list_name || "Personal"}
                        </div>
                        <div className="text-sm font-bold text-slate-800">{task.title}</div>
                        {task.due_date && (
                          <div className="mt-1 text-xs text-slate-500">
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
        <TaskActionModal key={selectedTask.id} task={selectedTask} onClose={() => setSelectedTask(null)} refresh={fetchData} />
      )}

      <style>{`
        * { box-sizing: border-box; }

        @keyframes modalIn {
          from { transform: translateY(12px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .task-modal-pop { animation: modalIn 200ms ease-out; }

        .planner-topbar, .planner-topbar button {
          transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }
        .planner-topbar button:active { transform: scale(0.96); }

        .planner-glass { transition: box-shadow 0.3s ease; }

        .task-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .task-card:hover { transform: translateY(-2px); }
        .task-card:active { transform: translateY(0) scale(0.99); }

        /* ===== react-calendar (month view) ===== */
        .react-calendar {
          width: 100%;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          font-family: inherit;
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          font-weight: 700;
          color: #8B5CF6;
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
        .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
        .react-calendar__month-view__days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          padding: 0;
        }
        .react-calendar__month-view__days__day {
          border: none !important;
          padding: 4px !important;
        }
        .react-calendar__tile {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          padding: 6px !important;
          min-height: 96px;
          gap: 4px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(221, 214, 254, 0.6) !important;
        }
        .react-calendar__tile abbr {
          font-size: 0.78rem;
          font-weight: 700;
          color: #4C1D95;
          text-decoration: none;
        }
        .react-calendar__tile:hover {
          background: rgba(255, 255, 255, 0.9) !important;
          box-shadow: 0 10px 28px rgba(124, 58, 237, 0.12) !important;
        }
        .react-calendar__tile--now {
          background: linear-gradient(135deg, rgba(221, 214, 254, 0.5), rgba(250, 232, 255, 0.5)) !important;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25) inset !important;
          border-color: rgba(139, 92, 246, 0.4) !important;
        }
        .react-calendar__tile--active {
          background: linear-gradient(135deg, rgba(196, 181, 253, 0.45), rgba(221, 214, 254, 0.45)) !important;
          color: #2e1065 !important;
          border-color: rgba(139, 92, 246, 0.5) !important;
        }
        .today-cell { box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.4) inset !important; }

        .tile-content-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          margin-top: 2px;
        }

        /* ===== Scrollbars (lavender) ===== */
        .planner-scroll::-webkit-scrollbar,
        .task-modal-scroll::-webkit-scrollbar,
        .react-calendar::-webkit-scrollbar {
          width: 6px;
        }
        .planner-scroll::-webkit-scrollbar-track,
        .task-modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .planner-scroll::-webkit-scrollbar-thumb,
        .task-modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        .planner-scroll::-webkit-scrollbar-thumb:hover,
        .task-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        /* ===== Responsive ===== */
        @media (max-width: 768px) {
          .planner-topbar { align-items: stretch; }
          .react-calendar__tile { min-height: 84px !important; }
        }
      `}</style>
    </div>
  );
};

export default PlannerPage;
// import { useEffect, useMemo, useState } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { api } from "../../services/api";
// import Navbar from "../../components/layout/Navbar";
// import TaskModal from "../../features/planner/TaskModal";
 
// // Color hex values for tasks
// const colorHexPalette = [
//   { bg: "#E9D5FF", border: "#D8B4FE", text: "#7E22CE" }, // purple
//   { bg: "#DBEAFE", border: "#93C5FD", text: "#1D4ED8" }, // blue
//   { bg: "#DCFCE7", border: "#BBF7D0", text: "#166534" }, // green
//   { bg: "#FCE7F3", border: "#FBCFE8", text: "#BE185D" }, // pink
//   { bg: "#FED7AA", border: "#FDBA74", text: "#EA580C" }, // orange
//   { bg: "#CCFBF1", border: "#99F6E4", text: "#0D9488" }  // teal
// ];
 
// // Color palette for tasks (Tailwind classes for week view)
// const colorPalette = [
//   { bg: "bg-purple-500/20", border: "border-purple-500/30", accent: "bg-purple-500", text: "text-purple-900" },
//   { bg: "bg-blue-500/20", border: "border-blue-500/30", accent: "bg-blue-500", text: "text-blue-900" },
//   { bg: "bg-green-500/20", border: "border-green-500/30", accent: "bg-green-500", text: "text-green-900" },
//   { bg: "bg-pink-500/20", border: "border-pink-500/30", accent: "bg-pink-500", text: "text-pink-900" },
//   { bg: "bg-orange-500/20", border: "border-orange-500/30", accent: "bg-orange-500", text: "text-orange-900" },
//   { bg: "bg-teal-500/20", border: "border-teal-500/30", accent: "bg-teal-500", text: "text-teal-900" }
// ];
 
// // Priority badge colors
// const priorityColors = {
//   high: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-700" },
//   medium: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-700" },
//   low: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-700" }
// };
 
// const WeekView = ({
//   weekDays,
//   currentDayKey,
//   getTasksForDate,
//   onSelectTask,
// }: {
//   weekDays: Date[];
//   currentDayKey: string;
//   getTasksForDate: (date: Date) => any[];
//   onSelectTask: (task: any, day: Date) => void;
// }) => {
//   console.log("weekDays", weekDays);
 
//   return (
//     <div className="custom-week-view">
//       <div className="week-grid flex flex-col gap-4 w-full">
//         {weekDays.map((day) => {
//           const tasks = getTasksForDate(day);
//           const dayKey = day.toISOString().slice(0, 10);
//           const isToday = dayKey === currentDayKey;
 
//           return (
//             <div
//               key={dayKey}
//               className={`flex flex-col w-full min-h-[120px] rounded-xl border p-4 bg-white transition duration-200 ${
//                 isToday
//                   ? "border-indigo-200 bg-indigo-50 shadow-sm"
//                   : "border-slate-200 bg-white hover:shadow-md"
//               }`}
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <div className="text-sm font-semibold uppercase text-gray-500">
//                   {day.toLocaleDateString("default", { weekday: "long" }).toUpperCase()}
//                 </div>
//                 <div className="text-lg font-bold text-slate-900">
//                   {day.getDate()}
//                 </div>
//               </div>
 
//               <div className="flex flex-col gap-2 w-full">
//                 {tasks.map((task: any) => (
//                   <button
//                     key={task.id}
//                     type="button"
//                     onClick={() => onSelectTask(task, day)}
//                     className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
//                   >
//                     {task.title}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
 
// const PlannerPage = () => {
//   const [data, setData] = useState<any>({});
//   const [date, setDate] = useState<Date | null>(new Date());
//   const [viewDate, setViewDate] = useState<Date>(new Date());
//   const [viewMode, setViewMode] = useState<"week" | "month">("week");
//   const [selectedTask, setSelectedTask] = useState<any>(null);
 
//   const fetchData = async () => {
//     const res = await api.get("/planner");
//     setData(res.data);
//   };
 
//   useEffect(() => {
//     fetchData();
//   }, []);
 
//   const activeTasks = [
//     ...(data?.assigned || []),
//     ...(data?.today || []),
//     ...(data?.overdue || [])
//   ].filter(
//     (t: any) =>
//       !t.completed_at && t?.status !== "done" && t?.list_name !== "Done"
//   );
 
//   const formatDate = (date: Date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };
 
//   const getTaskDateKey = (task: any) => {
//     const taskDate = task?.due_date || task?.created_at;
//     if (!taskDate) return "";
//     return taskDate.slice(0, 10);
//   };
 
//   const groupedTasks = useMemo(() => {
//     const map: Record<string, any[]> = {};
//     activeTasks.forEach((task: any) => {
//       const dateKey = getTaskDateKey(task);
//       if (!dateKey) return;
//       if (!map[dateKey]) {
//         map[dateKey] = [];
//       }
//       map[dateKey].push(task);
//     });
//     console.log("Tasks:", activeTasks);
//     console.log("Grouped:", map);
//     return map;
//   }, [activeTasks]);
 
//   const selectedTasks = activeTasks.filter((t: any) => {
//     if (!date) return false;
 
//     const taskDate = getTaskDateKey(t);
//     if (!taskDate) return false;
 
//     const selectedStr = formatDate(new Date(date));
//     return taskDate === selectedStr;
//   });
 
//   const getTasksForTile = (tileDate: Date) => {
//     const localDateStr = formatDate(tileDate);
//     return groupedTasks[localDateStr] || [];
//   };
 
//   const getTasksForDate = (tileDate: Date) => getTasksForTile(tileDate);
 
//   const startOfWeek = (anchor: Date) => {
//     const dateCopy = new Date(anchor);
//     const day = dateCopy.getDay();
//     const diff = dateCopy.getDate() - ((day + 6) % 7);
//     dateCopy.setDate(diff);
//     dateCopy.setHours(0, 0, 0, 0);
//     return dateCopy;
//   };
 
//   const weekDays = useMemo(() => {
//     const start = startOfWeek(viewDate);
//     return Array.from({ length: 7 }, (_, index) => {
//       const next = new Date(start);
//       next.setDate(start.getDate() + index);
//       return next;
//     });
//   }, [viewDate]);
 
//   const moveView = (direction: number) => {
//     if (viewMode === "month") {
//       const next = new Date(viewDate);
//       next.setMonth(viewDate.getMonth() + direction);
//       setViewDate(next);
//     } else {
//       const next = new Date(viewDate);
//       next.setDate(viewDate.getDate() + direction * 7);
//       setViewDate(next);
//     }
//   };
 
//   const monthLabel = viewDate.toLocaleString("default", {
//     month: "long",
//     year: "numeric"
//   });
 
//   const currentDayKey = new Date().toISOString().slice(0, 10);
 
//   const palette = [
//     "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(165,180,252,0.18))",
//     "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(191,219,254,0.18))",
//     "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(187,247,208,0.18))",
//     "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(251,207,232,0.18))"
//   ];
 
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-900">
//       <Navbar />
 
//       <div className="w-full min-h-screen px-6 lg:px-10">
//         <div className="planner-topbar glass-card mb-6 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/60 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => moveView(-1)}
//               className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/75 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
//               aria-label="Previous"
//             >
//               ‹
//             </button>
//             <button
//               onClick={() => moveView(1)}
//               className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/75 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
//               aria-label="Next"
//             >
//               ›
//             </button>
//           </div>
 
//           <div className="text-center">
//             <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
//               Planner
//             </div>
//             <div className="mt-1 text-2xl font-semibold text-slate-900">
//               {monthLabel}
//             </div>
//           </div>
 
//           <div className="inline-flex rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm shadow-slate-200/40">
//             {(["week", "month"] as const).map((mode) => (
//               <button
//                 key={mode}
//                 onClick={() => setViewMode(mode)}
//                 className={`px-4 py-2 text-sm font-semibold transition ${
//                   viewMode === mode
//                     ? "rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/10"
//                     : "text-slate-600 hover:text-slate-900"
//                 }`}
//               >
//                 {mode === "week" ? "Week" : "Month"}
//               </button>
//             ))}
//           </div>
//         </div>
 
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
//           <div className="glass-card relative overflow-hidden rounded-[28px] border border-white/70 bg-white/50 p-4 shadow-2xl shadow-slate-200/30 backdrop-blur-xl lg:col-span-9 col-span-12">
//             {viewMode === "week" ? (
//               <div className="view-panel" key="week-view">
//                 <div className="mb-4 flex items-center justify-between gap-4">
//                   <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
//                     Week schedule
//                   </div>
//                   <div className="hidden items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-2 text-sm text-slate-600 sm:flex">
//                     <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
//                     Live tasks
//                   </div>
//                 </div>
 
//                 <WeekView
//                   weekDays={weekDays}
//                   currentDayKey={currentDayKey}
//                   getTasksForDate={getTasksForDate}
//                   onSelectTask={(task, day) => {
//                     setSelectedTask(task);
//                     setDate(new Date(day));
//                   }}
//                 />
//               </div>
//             ) : (
//               <div className="view-panel" key="month-view">
//                 <Calendar
//                   showNavigation={false}
//                   activeStartDate={new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)}
//                   onActiveStartDateChange={({ activeStartDate }) => {
//                     if (activeStartDate) setViewDate(activeStartDate);
//                   }}
//                   onChange={(value) => {
//                     if (value instanceof Date) {
//                       setDate(value);
//                       setViewDate(value);
//                     }
//                   }}
//                   value={date}
//                   tileContent={({ date: tileDate, view }) => {
//                     if (view !== "month") return null;
//                     const tasks = getTasksForTile(tileDate);
//                     const dayKey = formatDate(tileDate);
 
//                     return (
//                       <div className="flex flex-col gap-1 mt-1 w-full">
//                         {tasks.length === 0 ? (
//                           <div className="text-xs italic text-slate-300">No tasks</div>
//                         ) : (
//                           <>
//                             {tasks.slice(0, 2).map((task: any, index: number) => {
//                               const colors = colorHexPalette[index % colorHexPalette.length];
//                               return (
//                                <button
//   key={`${dayKey}-${task.id}`}
//   type="button"
//   onClick={(e) => {
//     e.stopPropagation();
//     setSelectedTask(task);
//   }}
//   className="w-full text-left px-2 py-1 rounded-md text-[11px] font-medium truncate"
//   style={{
//     background: colors.bg,
//     border: `1px solid ${colors.border}`,
//     color: colors.text,
//     display: "block"
//   }}
// >
//   {task.title}
// </button>
//  );
//  })}
//                 {tasks.length > 2 && (
//                        <div className="text-[11px] text-slate-500 mt-1">
//                                 +{tasks.length - 2} more
//                               </div>
//                             )}
//                           </>
//                         )}
//                       </div>
//                     );
//                   }}
//                   tileClassName={({ date: tileDate, view }) =>
//                     view === "month" && tileDate.toISOString().slice(0, 10) === currentDayKey
//                       ? "today-cell"
//                       : ""
//                   }
//                 />
//               </div>
//             )}
//           </div>
 
//           <div className="glass-card rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-2xl shadow-slate-200/30 backdrop-blur-xl lg:col-span-3 col-span-12 lg:sticky lg:top-6 h-fit w-full">
//             <div className="mb-6 flex items-center justify-between gap-3">
//               <div>
//                 <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
//                   Tasks on
//                 </p>
//                 <h3 className="mt-2 text-xl font-semibold text-slate-900">
//                   {date ? date.toDateString() : "Select a date"}
//                 </h3>
//               </div>
//               <span className="inline-flex h-11 min-w-[90px] items-center justify-center rounded-2xl bg-slate-100/80 px-4 text-sm font-semibold text-slate-700">
//                 {viewMode === "week" ? "Week" : "Month"}
//               </span>
//             </div>
 
//             <div className="space-y-3 max-h-[600px] overflow-y-auto">
//               {selectedTasks.length === 0 ? (
//                 <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-100/50 p-6 text-center text-sm text-slate-500 font-medium">
//                   No tasks for this date
//                 </div>
//               ) : (
//                 selectedTasks.map((task: any, index: number) => {
//                   const colors = colorPalette[index % colorPalette.length];
//                   return (
//                     <button
//                       key={task.id}
//                       type="button"
//                       onClick={() => setSelectedTask(task)}
//                       className={`task-card group relative flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all duration-200 ${colors.bg} ${colors.border} hover:shadow-lg hover:shadow-slate-900/15 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300/50`}
//                       style={{
//                         backdropFilter: "blur(10px)",
//                         animation: "fadeInUp 0.4s ease-out forwards",
//                         opacity: 1
//                       }}
//                     >
//                       {/* Left accent bar */}
//                       <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${colors.accent} transition-all duration-200 group-hover:w-2`} />
                     
//                       {/* Task content */}
//                       <div className="ml-1 flex flex-1 flex-col gap-1">
//                         <div className="text-xs uppercase tracking-wide font-semibold text-slate-600">
//                           {task.list_name || "Personal"}
//                         </div>
//                         <div className="text-sm font-bold text-slate-800">
//                           {task.title}
//                         </div>
//                         {task.due_date && (
//                           <div className="text-xs text-slate-600 mt-1">
//                             Due: {new Date(task.due_date).toLocaleDateString()}
//                           </div>
//                         )}
//                       </div>
//                     </button>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
 
//       {selectedTask && (
//         <TaskModal
//           task={selectedTask}
//           onClose={() => setSelectedTask(null)}
//           refresh={fetchData}
//         />
//       )}
 
//       <style>{`
// /* ===== ANIMATIONS ===== */
// @keyframes fadeInUp {
//   from {
//     opacity: 0;
//     transform: translateY(12px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
 
// @keyframes fadeIn {
//   from {
//     opacity: 0;
//   }
//   to {
//     opacity: 1;
//   }
// }
 
// /* ===== TOPBAR ===== */
// .planner-topbar {
//   transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
// }
 
// .planner-topbar button {
//   transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
// }
 
// .planner-topbar button:active {
//   transform: scale(0.96);
// }
 
// /* ===== GLASS CARD ===== */
// .glass-card {
//   transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
// }
 
// .glass-card:hover {
//   transform: translateY(-2px);
// }
 
// /* ===== TASK CARD ===== */
// .task-card {
//   transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
// }
 
// .task-card:hover {
//   transform: translateY(-3px) scale(1.02);
//   box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15) !important;
// }
 
// .task-card:active {
//   transform: translateY(-1px) scale(0.98);
// }
 
// .task-card:focus {
//   outline: none;
// }
 
// /* ===== DAY COLUMN ===== */
// .day-column {
//   transition: all 0.3s ease;
// }
 
// .day-column:hover {
//   background-color: rgba(255, 255, 255, 0.55) !important;
//   border-color: rgba(255, 255, 255, 0.8) !important;
// }
 
// /* ===== CALENDAR STYLES ===== */
// .react-calendar {
//   width: 100%;
//   border: none !important;
//   background: transparent !important;
//   padding: 0 !important;
//   font-family: inherit;
// }
 
// .react-calendar__month-view {
//   padding: 0;
// }
 
// .react-calendar__month-view__weekdays {
//   text-align: center;
//   font-weight: 700;
//   color: #475569;
//   margin-bottom: 12px;
//   display: flex;
//   justify-content: space-around;
//   gap: 12px;
// }
 
// .react-calendar__month-view__weekdays__weekday {
//   font-size: 12px;
//   letter-spacing: 0.05em;
//   text-transform: uppercase;
// }
 
// .react-calendar__month-view__days {
//   display: grid;
//   grid-template-columns: repeat(7, 1fr);
//   gap: 12px;
//   padding: 0;
// }
 
// .react-calendar__month-view__days__day {
//   border: none !important;
// }
 
// .react-calendar__tile {
//   display: flex !important;
//   flex-direction: column !important;
//   align-items: flex-start !important;
//   justify-content: flex-start !important;
//   padding: 6px !important;
//   min-height: 120px;
//   gap: 2px;
// }
 
// .react-calendar__tile abbr
 
// .react-calendar__tile:hover {
//   background: rgba(255, 255, 255, 0.7) !important;
//   box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12) !important;
// }
 
// .react-calendar__tile--now {
//   background: linear-gradient(135deg, rgba(199, 210, 254, 0.35), rgba(221, 214, 254, 0.35)) !important;
//   box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) inset, 0 8px 24px rgba(15, 23, 42, 0.08) !important;
//   border-color: rgba(139, 92, 246, 0.3) !important;
// }
 
// .react-calendar__tile--active {
//   background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(191, 219, 254, 0.2)) !important;
//   color: #0f172a !important;
//   border-color: rgba(59, 130, 246, 0.4) !important;
// }
 
// .today-cell {
//   box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35) inset !important;
// }
 
// /* ===== TILE CONTENT ===== */
// .tile-content-grid {
//   display: block;
//   margin-top: 6px;
//   width: 100%;
// }
 
// /* ===== WEEK GRID ===== */
// .custom-week-view {
//   width: 100%;
// }
 
// .custom-week-view * {
//   box-sizing: border-box;
// }
 
// .custom-week-view .week-grid {
//   display: flex;
//   flex-direction: column;
//   gap: 16px;
//   width: 100%;
// }
 
// .custom-week-view .day-column {
//   display: flex;
//   flex-direction: column;
//   width: 100%;
//   min-height: 120px;
//   align-items: stretch;
//   overflow: hidden;
//   background: inherit;
//   border: 1px solid;
//   border-radius: 8px;
// }
 
// .custom-week-view .day-column button {
//   display: block;
//   width: 100%;
// }
 
// .custom-week-view .react-calendar,
// .custom-week-view .react-calendar__tile,
// .custom-week-view .react-calendar__month-view,
// .custom-week-view .react-calendar__month-view__weekdays,
// .custom-week-view .react-calendar__month-view__days {
//   all: unset;
//   box-sizing: border-box;
// }
 
// .tile-content-grid {
//   display: flex;
//   flex-direction: column;
//   gap: 4px;
//   width: 100%;
// }
 
// .react-calendar__tile {
//   display: flex !important;
//   flex-direction: column !important;
//   align-items: flex-start !important;
//   justify-content: flex-start !important;
//   gap: 4px;
//   padding: 6px !important;
//   min-height: 92px;
// }
 
// .react-calendar__tile > div {
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   justify-content: flex-start;
// }
 
 
// .react-calendar__tile abbr {
//   display: block;
//   width: 100%;
//   font-weight: 600;
//   margin-bottom: 2px;
// }
 
// .react-calendar__tile button {
//   width: 100%;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
// }
 
// .react-calendar__month-view__days__day {
//   padding: 4px !important;
// }
 
// .react-calendar__tile abbr {
//   font-size: 0.78rem;
// }
 
// .react-calendar__tile--now {
//   border: 1px solid rgba(79, 70, 229, 0.35);
// }
 
// /* ===== SCROLLBAR STYLING ===== */
// .space-y-3::-webkit-scrollbar,
// .day-task-list::-webkit-scrollbar,
// .react-calendar::-webkit-scrollbar {
//   width: 6px;
// }
 
// .space-y-3::-webkit-scrollbar-track,
// .day-task-list::-webkit-scrollbar-track,
// .react-calendar::-webkit-scrollbar-track {
//   background: transparent;
// }
 
// .space-y-3::-webkit-scrollbar-thumb,
// .day-task-list::-webkit-scrollbar-thumb,
// .react-calendar::-webkit-scrollbar-thumb {
//   background: rgba(100, 116, 139, 0.3);
//   border-radius: 3px;
// }
 
// .space-y-3::-webkit-scrollbar-thumb:hover,
// .day-task-list::-webkit-scrollbar-thumb:hover,
// .react-calendar::-webkit-scrollbar-thumb:hover {
//   background: rgba(100, 116, 139, 0.5);
// }
 
// /* ===== RESPONSIVE ===== */
// @media (max-width: 1024px) {
//   .week-grid {
//     grid-template-columns: repeat(7, minmax(0, 1fr));
//   }
// }
 
// @media (max-width: 768px) {
//   .planner-topbar {
//     align-items: stretch;
//   }
 
//   .week-grid {
//     grid-template-columns: repeat(7, minmax(120px, 1fr));
//     gap: 8px;
//   }
 
//   .day-column {
//     min-height: 320px;
//   }
 
//   .task-card {
//     padding: 8px !important;
//     font-size: 11px !important;
//   }
 
//   .react-calendar__tile {
//     min-height: 120px !important;
//   }
// }
 
// @media (max-width: 640px) {
//   .week-grid {
//     grid-template-columns: repeat(7, minmax(0, 1fr));
//     gap: 6px;
//   }
 
//   .day-column {
//     min-height: 280px;
//   }
// }
// `}</style>
//     </div>
//   );
// };
 
// export default PlannerPage;
 