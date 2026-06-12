import { useMemo, useState } from "react";
 
interface MiniDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  onSave: () => void;
  loading?: boolean;
}
 
const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
 
const MiniDatePicker: React.FC<MiniDatePickerProps> = ({ selectedDate, onChange, onSave, loading }) => {
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
 
  const selectedKey = selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` : null;
 
  const days = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ label: string; date?: Date }> = [];
 
    for (let i = 0; i < firstDayIndex; i += 1) {
      cells.push({ label: "" });
    }
 
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ label: String(day), date: new Date(year, month, day) });
    }
 
    return cells;
  }, [year, month]);
 
  const monthLabel = currentMonth.toLocaleString("default", { month: "long" });
 
  return (
    <div className="w-[280px] rounded-xl bg-white p-4 shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between text-sm font-medium text-slate-700">
        <button
          type="button"
          onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          className="rounded-lg px-2 py-1 text-slate-500 transition-colors duration-200 hover:bg-slate-100"
        >
          &lt;
        </button>
        <span className="text-sm font-semibold">{`${monthLabel} ${year}`}</span>
        <button
          type="button"
          onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          className="rounded-lg px-2 py-1 text-slate-500 transition-colors duration-200 hover:bg-slate-100"
        >
          &gt;
        </button>
      </div>
 
      {/* Weekday labels */}
      <div className="mb-2 grid grid-cols-7 gap-2 text-[11px] font-semibold text-slate-500">
        {weekdayLabels.map((label) => (
          <div key={label} className="flex h-6 items-center justify-center">
            {label}
          </div>
        ))}
      </div>
 
      {/* Day grid */}
      <div className="mb-4 grid grid-cols-7 gap-2">
        {days.map((cell, index) => {
          const isSelected = cell.date
            ? `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}` === selectedKey
            : false;
          const isToday = cell.date
            ? `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}` === today
            : false;
 
          return (
            <button
              key={`${cell.label}-${index}`}
              type="button"
              disabled={!cell.date}
              onClick={() => cell.date && onChange(cell.date)}
              className={`h-8 w-8 rounded-md text-sm transition-all duration-200 ${
                cell.date
                  ? `flex items-center justify-center font-medium ${
                      isSelected
                        ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                        : "text-slate-700 hover:bg-purple-100"
                    }`
                  : "pointer-events-none"
              } ${isToday ? "border border-purple-400" : ""}`}
            >
              {cell.label}
            </button>
          );
        })}
      </div>
 
      {/* Save button */}
      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Save
      </button>
    </div>
  );
};
 
export default MiniDatePicker;