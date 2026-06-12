import React from "react";
 
type HeatmapDatum = {
  date: string;
  count: number;
};
 
type ActivityHeatmapProps = {
  data: HeatmapDatum[];
  title?: string;
  subtitle?: string;
};
 
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 
const getIntensityStyle = (count: number) => {
  if (count >= 8) return "bg-[#6d28d9] text-white border-[#6d28d9]";
  if (count >= 4) return "bg-[#a78bfa] text-slate-900 border-[#a78bfa]";
  if (count >= 1) return "bg-[#ede9fe] text-slate-900 border-[#ede9fe]";
  return "bg-slate-100 text-slate-400 border-slate-200";
};
 
const buildMonthRows = (data: HeatmapDatum[]) => {
  if (!data.length) return [];
 
  const countByDate = new Map<string, number>();
  data.forEach((item) => {
    const key = item.date.slice(0, 10);
    countByDate.set(key, item.count);
  });
 
  const dateStrings = Array.from(countByDate.keys()).sort();
  const start = new Date(dateStrings[0]);
  const end = new Date(dateStrings[dateStrings.length - 1]);
  const rows: Array<{ monthLabel: string; year: number; cells: HeatmapDatum[] }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
 
  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: daysInMonth }, (_, idx) => {
      const date = new Date(year, month, idx + 1).toISOString().slice(0, 10);
      return { date, count: countByDate.get(date) ?? 0 };
    });
 
    rows.push({
      monthLabel: `${monthNames[month]} ${year}`,
      year,
      cells
    });
 
    cursor.setMonth(cursor.getMonth() + 1);
  }
 
  return rows;
};
 
const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  title = "Activity Heatmap",
  subtitle = "Your daily productivity overview"
}) => {
  const rows = buildMonthRows(data);
  const maxColumns = Math.max(...rows.map((row) => row.cells.length), 0);
  const xLabels = Array.from({ length: maxColumns }, (_, index) => {
    if ([0, 6, 13, 20, 27, 30].includes(index)) return `${index + 1}`;
    return "";
  });
 
  return (
    <section className="w-full rounded-2xl bg-white p-6 shadow-md transition-all duration-300 ease-in-out">
      <div className="mb-6 flex flex-col gap-2">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          {title}
        </div>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
 
      <div className="overflow-x-auto">
        <div
          className="grid items-center gap-2"
          style={{
            gridTemplateColumns: `120px repeat(${maxColumns}, minmax(24px, 1fr))`
          }}
        >
          <div />
          {xLabels.map((label, index) => (
            <div key={`axis-${index}`} className="text-center text-[11px] text-gray-400">
              {label}
            </div>
          ))}
 
          {rows.map((row) => (
            <React.Fragment key={row.monthLabel}>
              <div className="flex items-center text-xs font-semibold text-slate-600">
                {row.monthLabel}
              </div>
              {row.cells.map((cell) => {
                const styleClass = getIntensityStyle(cell.count);
                const dateObj = new Date(cell.date);
                const label = cell.count === 1 ? "task" : "tasks";
                return (
                  <button
                    key={cell.date}
                    type="button"
                    className={`group h-10 rounded-md border transition-all duration-200 hover:scale-110 ${styleClass}`}
                    title={`${cell.count} ${label} completed on ${dateObj.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric"
                    })}`}
                  >
                    <span className="sr-only">{cell.date}</span>
                  </button>
                );
              })}
              {Array.from({ length: maxColumns - row.cells.length }).map((_, idx) => (
                <div
                  key={`empty-${row.monthLabel}-${idx}`}
                  className="h-10 rounded-md border border-slate-200 bg-slate-50"
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
 
      <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
        <span className="rounded-full bg-slate-100 px-3 py-2">Low activity</span>
        <span className="rounded-full bg-[#ede9fe] px-3 py-2 text-slate-700">1–3 tasks</span>
        <span className="rounded-full bg-[#a78bfa] px-3 py-2 text-slate-900">4–7 tasks</span>
        <span className="rounded-full bg-[#6d28d9] px-3 py-2 text-white">8+ tasks</span>
      </div>
    </section>
  );
};
 
export default ActivityHeatmap;