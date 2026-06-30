import { useEffect, useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  CalendarDays,
  UserRound,
  Clock,
  CheckCircle2,
  Target,
  Timer,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LineChart, Line } from "recharts";
import Navbar from "../../components/layout/Navbar";
import {
  getWorkload,
  getProductivity,
  getRecentActivity,
  getActivityHeatmap,
  getActivityInsights,
  api,
} from "../../services/api";
 
const STATUS_COLORS: Record<string, string> = {
  "To Do": "bg-slate-100 text-slate-500",
  "In Progress": "bg-blue-50 text-blue-600",
  Review: "bg-amber-50 text-amber-600",
  Completed: "bg-emerald-50 text-emerald-600",
};
 
const ARROW_COLORS: Record<string, string> = {
  "In Progress": "text-blue-500",
  Review: "text-amber-500",
  Completed: "text-emerald-600",
};
 
// Shared "premium elevated" card treatment — reused across every card on the
// page so the dashboard reads as one cohesive system rather than mismatched
// pieces.
const CARD =
  "rounded-2xl bg-white ring-1 ring-slate-100/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_32px_-16px_rgba(15,23,42,0.12)]";
 
// A small colored accent bar used in front of every section title, so each
// card reads as one quiet, consistent family rather than repeating the hero
// icon badge everywhere.
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 h-4 w-1 shrink-0 rounded-full bg-violet-500" />
      <div>
        <h3 className="m-0 text-[16px] font-bold tracking-tight text-slate-900">
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
 
function formatActivityTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
 
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
 
  if (isToday) return time;
  if (isYesterday) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}, ${time}`;
}
 
type HeatmapDay = { date: string; count: number };
type WeekCell = { date: string; count: number; inRange: boolean };
 
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const CELL = 18; // px — cell height (width flexes to fill the row)
const GAP = 5; // px
const WEEKDAY_COL = 22; // px — fixed-width column for the M/T/W/.. labels
 
// How many weeks are visible in one "page" of the heatmap, and how much
// history we pull up front so Back/Forward can page through it without an
// extra round-trip on every click.
const WINDOW_WEEKS = 26; // ~6 months per page
const HEATMAP_FETCH_DAYS = 728; // ~2 years -> up to 3 pages back
 
function bucketStyle(count: number) {
  if (count >= 8) return "bg-[#6d28d9]";
  if (count >= 4) return "bg-[#8b5cf6]";
  if (count >= 1) return "bg-[#c4b5fd]";
  return "bg-[#eef0f4]";
}
 
/** Builds a week-row x weekday-column grid (GitHub-style) ending today. */
function buildWeeks(days: HeatmapDay[]): WeekCell[][] {
  const byDate = new Map(days.map((d) => [d.date, d.count]));
  const last = new Date(days[days.length - 1]?.date ?? new Date());
 
  const end = new Date(last);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
 
  const start = new Date(days[0]?.date ?? new Date());
  const startDow = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - startDow);
 
  const weeks: WeekCell[][] = [];
  const cursor = new Date(start);
  let week: WeekCell[] = [];
 
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    const inRange = byDate.has(iso);
    week.push({ date: iso, count: byDate.get(iso) ?? 0, inRange });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (week.length) weeks.push(week);
  return weeks;
}
 
function monthLabelsForWeeks(weeks: { date: string }[][]) {
  const labels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const d = new Date(week[0].date);
    if (d.getMonth() !== lastMonth) {
      lastMonth = d.getMonth();
      labels.push({
        weekIndex: i,
        label: d.toLocaleDateString(undefined, { month: "short" }),
      });
    }
  });
  return labels;
}
 
function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
 
/**
 * Builds the descriptive "who moved what, where" sentence for a Recent
 * Activity row, e.g.:
 *   "Priya Sharma moved "Fix UI" card from Sprint Board board in team Design"
 *   "You moved "Fix UI" card on Sprint Board board"   (personal board, no team)
 */
function buildActivitySentence(a: any) {
  const who = a.is_self ? "You" : a.actor_name || "Someone";
  const boardName = a.board_name || "a board";
  const location = a.team_name
    ? `from ${boardName} board in team ${a.team_name}`
    : `on ${boardName} board`;
 
  return (
    <>
      <span className="font-semibold text-slate-900">{who}</span> moved{" "}
      <span className="font-semibold text-slate-900">"{a.card_title}"</span>{" "}
      card {location}
    </>
  );
}
 
function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  delta,
  deltaPositive,
  sparkline,
  sparkColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  delta?: string;
  deltaPositive?: boolean;
  sparkline: number[];
  sparkColor: string;
}) {
  const sparkData = sparkline.map((v, i) => ({ i, v }));
  return (
    <div
      className={`group relative flex-1 min-w-[160px] ${CARD} p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(15,23,42,0.06),0_24px_40px_-16px_rgba(15,23,42,0.16)]`}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div className="h-6 w-14 opacity-80">
          <LineChart width={54} height={22} data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={sparkColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={900}
            />
          </LineChart>
        </div>
      </div>
 
      <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-[21px] font-extrabold tracking-tight text-slate-900">
        {value}
      </div>
      {delta && (
        <div
          className={`mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold ${
            deltaPositive ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          <span>{deltaPositive ? "↑" : "↓"}</span>
          {delta}
        </div>
      )}
    </div>
  );
}
 
const ActivityPage = () => {
  const [stats, setStats] = useState<any>({});
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [heatmapDays, setHeatmapDays] = useState<HeatmapDay[]>([]);
  const [insights, setInsights] = useState<any>(null);
 
  // How many weeks back from "today" the heatmap window is currently
  // scrolled. 0 = most recent window.
  const [pageOffsetWeeks, setPageOffsetWeeks] = useState(0);
 
  const fetchData = async () => {
    const [workloadRes, statsRes, recentRes, heatmapRes, insightsRes] =
      await Promise.allSettled([
        getWorkload(),
        getProductivity(),
        getRecentActivity(),
        getActivityHeatmap(HEATMAP_FETCH_DAYS),
        getActivityInsights(),
      ]);
 
    if (workloadRes.status === "fulfilled") {
      setWorkload(workloadRes.value.data || []);
    } else {
      console.error("getWorkload failed:", workloadRes.reason);
    }
 
    if (statsRes.status === "fulfilled") {
      setStats(statsRes.value.data || {});
    } else {
      console.error("getProductivity failed:", statsRes.reason);
    }
 
    if (recentRes.status === "fulfilled") {
      setRecentActivity(recentRes.value.data || []);
    } else {
      console.error("getRecentActivity failed:", recentRes.reason);
    }
 
    if (heatmapRes.status === "fulfilled") {
      setHeatmapDays(heatmapRes.value.data || []);
    } else {
      console.error("getActivityHeatmap failed:", heatmapRes.reason);
    }
 
    if (insightsRes.status === "fulfilled") {
      setInsights(insightsRes.value.data || null);
    } else {
      console.error("getActivityInsights failed:", insightsRes.reason);
    }
 
    setLoading(false);
  };
 
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
 
  const allWeeks = useMemo(() => buildWeeks(heatmapDays), [heatmapDays]);
 
  // Clamp the offset to the data we actually have, then slice out the
  // visible 26-week page.
  const maxOffsetWeeks = Math.max(0, allWeeks.length - WINDOW_WEEKS);
  const offset = Math.min(pageOffsetWeeks, maxOffsetWeeks);
  const windowEnd = allWeeks.length - offset;
  const windowStart = Math.max(0, windowEnd - WINDOW_WEEKS);
  const visibleWeeks = useMemo(
    () => allWeeks.slice(windowStart, windowEnd),
    [allWeeks, windowStart, windowEnd]
  );
 
  const monthLabels = useMemo(() => monthLabelsForWeeks(visibleWeeks), [visibleWeeks]);
  const monthLabelByWeek = useMemo(
    () => Object.fromEntries(monthLabels.map((m) => [m.weekIndex, m.label])),
    [monthLabels]
  );
 
  const canGoBack = offset < maxOffsetWeeks;
  const canGoForward = offset > 0;
  const goBack = () => setPageOffsetWeeks((o) => Math.min(maxOffsetWeeks, o + WINDOW_WEEKS));
  const goForward = () => setPageOffsetWeeks((o) => Math.max(0, o - WINDOW_WEEKS));
 
  const rangeLabel = useMemo(() => {
    if (!visibleWeeks.length) return "";
    const firstDay = visibleWeeks[0][0]?.date;
    const lastWeek = visibleWeeks[visibleWeeks.length - 1];
    const lastDay = lastWeek[lastWeek.length - 1]?.date;
    if (!firstDay || !lastDay) return "";
    return offset === 0
      ? `${formatMonthYear(firstDay)} – Today`
      : `${formatMonthYear(firstDay)} – ${formatMonthYear(lastDay)}`;
  }, [visibleWeeks, offset]);
 
  const total = Number(stats.total_tasks) || 0;
  const assigned = Number(stats.assigned_tasks) || 0;
  const overdue = Number(stats.overdue_tasks) || 0;
  const completed = Number(stats.completed_tasks) || 0;
 
  const fauxSpark = (base: number) =>
    Array.from({ length: 8 }, (_, i) => Math.max(1, base * (0.6 + 0.07 * i)));
 
  return (
    <div style={{ background: "#f8f9fc", minHeight: "100vh" }}>
      <Navbar />
 
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
 
      <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_10px_24px_-8px_rgba(124,58,237,0.5)]">
            <ActivityIcon size={22} strokeWidth={2.25} />
          </div>
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-500">
              Workspace overview
            </p>
            <h2 className="m-0 text-[32px] font-extrabold leading-tight tracking-tight text-slate-900">
              Activity
            </h2>
          </div>
        </div>
        <p className="mt-2 max-w-[560px] text-[14px] text-slate-500">
          Track your productivity and stay on top of what's happening.
        </p>
 
        {/* Stat cards — slightly smaller footprint */}
        <div className="mt-6 flex flex-wrap gap-3">
          <StatCard
            icon={<CalendarDays size={15} />}
            iconBg="#ede9fe"
            iconColor="#7c3aed"
            label="Total Tasks"
            value={loading ? "—" : total}
            delta="18% from last week"
            deltaPositive
            sparkline={fauxSpark(total || 10)}
            sparkColor="#7c3aed"
          />
          <StatCard
            icon={<UserRound size={15} />}
            iconBg="#dbeafe"
            iconColor="#2563eb"
            label="Assigned"
            value={loading ? "—" : assigned}
            delta="12% from last week"
            deltaPositive
            sparkline={fauxSpark(assigned || 6)}
            sparkColor="#2563eb"
          />
          <StatCard
            icon={<Clock size={15} />}
            iconBg="#ffedd5"
            iconColor="#ea580c"
            label="Overdue"
            value={loading ? "—" : overdue}
            delta="8% from last week"
            deltaPositive={false}
            sparkline={fauxSpark(overdue || 4).reverse()}
            sparkColor="#f59e0b"
          />
          <StatCard
            icon={<CheckCircle2 size={15} />}
            iconBg="#dcfce7"
            iconColor="#16a34a"
            label="Completed Tasks"
            value={loading ? "—" : completed}
            delta="22% from last week"
            deltaPositive
            sparkline={fauxSpark(completed || 8)}
            sparkColor="#22c55e"
          />
        </div>
 
        {/* Heatmap + Insights */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          {/* Heatmap */}
          <div className={`${CARD} p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionTitle title="Activity Heatmap" subtitle="Daily task completion" />
 
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                  <LegendDot className="bg-[#eef0f4]" label="No activity" />
                  <LegendDot className="bg-[#c4b5fd]" label="1–3" />
                  <LegendDot className="bg-[#8b5cf6]" label="4–7" />
                  <LegendDot className="bg-[#6d28d9]" label="8+" />
                </div>
 
                <span className="text-[12px] font-semibold text-slate-600">
                  {rangeLabel}
                </span>
 
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={!canGoBack}
                    aria-label="Show earlier weeks"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={goForward}
                    disabled={!canGoForward}
                    aria-label="Show more recent weeks"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
 
            {/* ✅ Track stretches to fill the full card width: each week
                column is flex-1 (equal share of the available width) instead
                of a fixed pixel size, so there's no leftover whitespace. */}
            <div className="mt-6 overflow-x-auto pb-1">
              <div className="min-w-[520px]">
                {/* month labels row, aligned over the week columns below */}
                <div className="flex" style={{ gap: GAP }}>
                  <div style={{ width: WEEKDAY_COL }} className="shrink-0" />
                  <div className="flex min-w-0 flex-1" style={{ gap: GAP }}>
                    {visibleWeeks.map((week, wi) => (
                      <div
                        key={wi}
                        className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-[12px] font-semibold text-slate-500"
                      >
                        {monthLabelByWeek[wi] ?? ""}
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* weekday labels + day cells */}
                <div className="mt-2 flex" style={{ gap: GAP }}>
                  <div
                    className="flex shrink-0 flex-col"
                    style={{ width: WEEKDAY_COL, gap: GAP }}
                  >
                    {DAY_LABELS.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-end text-[11px] font-medium text-slate-400"
                        style={{ height: CELL }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
 
 
 
                  <div className="flex min-w-0 flex-1" style={{ gap: GAP }}>
                    {visibleWeeks.map((week, wi) => (
                      <div
                        key={wi}
                        className="flex flex-1 flex-col"
                        style={{ gap: GAP }}
                      >
                        {week.map((day) => (
                          <div
                            key={day.date}
                            title={`${day.count} task${
                              day.count === 1 ? "" : "s"
                            } · ${new Date(day.date).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" }
                            )}`}
                            className={`w-full rounded-[5px] transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-violet-300 ${
                              day.inRange
                                ? bucketStyle(day.count)
                                : "bg-transparent"
                            }`}
                            style={{ height: CELL }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          {/* Insights — compact, premium */}
          <div className={`${CARD} flex flex-col gap-2 p-5`}>
            <SectionTitle title="Insights" />
            <p className="-mt-1.5 ml-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              All time
            </p>
 
            <InsightRow
              icon={<CalendarDays size={14} />}
              iconBg="#ede9fe"
              iconColor="#7c3aed"
              label="Most Productive Day"
              value={
                insights?.most_productive_day
                  ? new Date(insights.most_productive_day).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                  : "No data yet"
              }
              pill={
                insights?.most_productive_day
                  ? `${insights.most_productive_count} tasks`
                  : ""
              }
              pillTone="violet"
            />
 
            <InsightRow
              icon={<Target size={14} />}
              iconBg="#ffedd5"
              iconColor="#ea580c"
              label="Completion Rate"
              value={
                insights ? `${Math.round(insights.completion_rate * 100)}%` : "—"
              }
              pill=""
              pillTone="violet"
            />
 
            <InsightRow
              icon={<Timer size={14} />}
              iconBg="#dcfce7"
              iconColor="#16a34a"
              label="Avg. Completion Time"
              value={
                insights?.avg_completion_days != null
                  ? `${insights.avg_completion_days} days`
                  : "No data yet"
              }
              pill=""
              pillTone="violet"
            />
          </div>
        </div>
 
        {/* Recent Activity */}
        <div className={`${CARD} mt-5 p-6`}>
          <div className="flex items-center justify-between">
            <SectionTitle title="Recent Activity" subtitle="Card movements from your boards" />
            <button className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50 hover:text-violet-700">
              View all
              <ArrowRight size={14} />
            </button>
          </div>
 
          <div className="mt-4 divide-y divide-slate-100">
            {recentActivity.length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-slate-400">
                No recent card movements yet.
              </p>
            )}
            {recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-slate-50"
              >
                <span className="w-[140px] shrink-0 text-xs text-slate-400">
                  {formatActivityTime(a.created_at)}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 text-xs font-semibold text-violet-700">
                  {a.actor_initial}
                </span>
                <span className="min-w-[220px] flex-1 text-sm text-slate-700">
                  {buildActivitySentence(a)}
                </span>
                <span className="flex items-center gap-2">
                  <Pill className={STATUS_COLORS[a.from_status] ?? "bg-slate-100 text-slate-500"}>
                    {a.from_status}
                  </Pill>
                  <ArrowRight
                    size={14}
                    className={ARROW_COLORS[a.to_status] ?? "text-violet-500"}
                  />
                  <Pill className={STATUS_COLORS[a.to_status] ?? "bg-slate-100 text-slate-500"}>
                    {a.to_status}
                  </Pill>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
 
function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-2.5 w-2.5 rounded-[3px] ${className}`} />
      {label}
    </span>
  );
}
 
function InsightRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  pill,
  pillTone,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  pill: string;
  pillTone: "violet" | "green" | "rose";
}) {
  const toneClass =
    pillTone === "violet"
      ? "bg-violet-50 text-violet-600"
      : pillTone === "green"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-rose-50 text-rose-600";
 
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-2.5 py-2.5 transition-colors hover:bg-slate-50">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </span>
        <div>
          <div className="text-[11px] text-slate-500">{label}</div>
          <div className="text-[13.5px] font-bold text-slate-900">{value}</div>
        </div>
      </div>
      {pill && (
        <span
          className={`whitespace-nowrap rounded-full px-2 py-1 text-[10.5px] font-bold ${toneClass}`}
        >
          {pill}
        </span>
      )}
    </div>
  );
}
 
function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}
 
export default ActivityPage;
 
// import { useEffect, useMemo, useState } from "react";
// import Navbar from "../../components/layout/Navbar";
// import ActivityHeatmap from "./ActivityHeatMap";
// import {
//     getWorkload,
//     getProductivity,
//     api
// } from "../../services/api";
 
// import {
//     Tooltip, PieChart, Pie, Cell
// } from "recharts";
 
// const ActivityPage = () => {
//     const [workload, setWorkload] = useState<any[]>([]);
//     const [stats, setStats] = useState<any>({});
//     const [selectedTeam, setSelectedTeam] = useState<any>(null);
 
//     const [teamChartData, setTeamChartData] = useState<any>(null);
 
//     const heatmapData = useMemo(() => {
//         const days = 30;
//         const today = new Date();
//         const lastDays = Array.from({ length: days }).map((_, index) => {
//             const date = new Date(today);
//             date.setDate(today.getDate() - (days - 1 - index));
//             return date.toISOString().slice(0, 10);
//         });
 
//         const rawHeatmap = Array.isArray(stats.activity_heatmap)
//             ? stats.activity_heatmap
//             : [];
//         const heatmapMap = rawHeatmap.reduce((acc: Record<string, number>, item: any) => {
//             if (item?.date) {
//                 acc[item.date.slice(0, 10)] = item.count ?? 0;
//             }
//             return acc;
//         }, {});
 
//         const totalCompleted = Number(stats.completed_tasks) || 0;
//         const baseCount = Math.floor(totalCompleted / days);
//         const remainder = totalCompleted % days;
 
//         return lastDays.map((date, index) => ({
//             date,
//             count: heatmapMap[date] ?? baseCount + (index >= days - remainder ? 1 : 0)
//         }));
//     }, [stats]);
 
//     // ✅ FETCH EVERYTHING
//     const fetchData = async () => {
//         try {
//             // const workloadRes = await getWorkload();
//             const workloadRes = await getWorkload();
 
//             const statsRes = await getProductivity();
 
//             setWorkload(workloadRes.data || []);
//             setStats(statsRes.data || {});
 
//         } catch (err) {
//             console.error("ERROR:", err);
//         }
//     };
 
//     // ✅ AUTO REFRESH (REAL-TIME FEEL)
//     useEffect(() => {
//         fetchData();
 
//         const interval = setInterval(() => {
//             fetchData();   // ✅ auto refresh every 5s
//         }, 5000);
 
//         return () => clearInterval(interval);
//     }, []);
//     const handleTeamClick = async (team: any) => {
//         setSelectedTeam(team);
 
//         try {
//             const res = await api.get(`/analytics/team/${team.team_id}`);
 
//             console.log("✅ Team analytics:", res.data);  // DEBUG
 
//             setTeamChartData(res.data);
//         } catch (err) {
//             console.error("❌ Analytics error:", err);
 
//             setTeamChartData({
//                 done: 0,
//                 in_progress: 0,
//                 todo: 0
//             });
//         }
//     };
//     // useEffect(() => {
//     //     fetchData();
//     //     const userData = localStorage.getItem("user");
 
//     //     let user: any = null;
 
//     //     // ✅ TRY PARSE
//     //     try {
//     //         user = JSON.parse(userData as string);
//     //     } catch {
//     //         // ✅ FALLBACK: maybe it's stored as plain string/object
//     //         console.log("⚠️ Fixing corrupted user in localStorage");
 
//     //         user = {
//     //             id: localStorage.getItem("user_id") || null
//     //         };
 
//     //         // ✅ force store correct format for future
//     //         if (user.id) {
//     //             localStorage.setItem("user", JSON.stringify(user));
//     //         }
//     //     }
 
//     //     // ✅ FINAL CHECK
//     //     if (!user?.id) {
//     //         console.log("❌ User id missing");
//     //         return;
//     //     }
//     const chartData = [
//         { name: "Done", value: teamChartData?.done || 0, color: "#22c55e" },
//         { name: "In Progress", value: teamChartData?.in_progress || 0, color: "#3b82f6" },
//         { name: "Todo", value: teamChartData?.todo || 0, color: "#a855f7" }
//     ];
 
 
//     return (
//         <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
//             <Navbar />
 
//             <div style={{ padding: "24px 24px 40px" }}>
//                 <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", alignItems: "flex-end" }}>
//                     <div>
//                         <h2 style={{ margin: 0, fontSize: "32px", fontWeight: 700, color: "#111827" }}>Activity</h2>
//                         <p style={{ margin: "8px 0 0", color: "#6b7280", maxWidth: 560 }}>Track task activity and team workload with a focused productivity overview.</p>
//                     </div>
//                 </div>
 
//                 {/* ✅ STATS */}
//                 <div style={{ display: "flex", gap: "20px", marginTop: "28px", flexWrap: "wrap" }}>
//                     <Card label="Total Tasks" value={stats.total_tasks} />
//                     <Card label="Assigned" value={stats.assigned_tasks} />
//                     <Card label="Overdue" value={stats.overdue_tasks} />
//                     <Card label="Completed Tasks" value={stats.completed_tasks} />
//                 </div>
 
 
//                 {/* ✅ ACTIVITY HEATMAP */}
//                 <div style={{ marginTop: "30px" }}>
//                     <ActivityHeatmap data={heatmapData} />
//                 </div>
 
//                 {/* ✅ TEAM SPECIFIC GRAPH (ADD HERE) */}
//                 {selectedTeam && teamChartData && (
//                     <div style={{
//                         marginTop: "30px",
//                         background: "#fff",
//                         padding: "20px",
//                         borderRadius: "12px"
//                     }}>
 
//                         <div style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center"
//                         }}>
//                             <h3 style={{ margin: 0 }}>
//                                 {selectedTeam.team_name} Performance
//                             </h3>
 
//                             {/* ✅ CLOSE BUTTON */}
//                             <span
//                                 onClick={() => {
//                                     setSelectedTeam(null);
//                                     setTeamChartData(null);
//                                 }}
//                                 style={{
//                                     cursor: "pointer",
//                                     fontSize: "18px",
//                                     fontWeight: "bold",
//                                     color: "#9ca3af",
//                                     transition: "0.2s"
//                                 }}
//                                 onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
//                                 onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
//                             >
//                                 ✕
//                             </span>
//                         </div>
 
//                         <div style={{
//                             display: "flex",
//                             gap: "40px",
//                             alignItems: "center",
//                             marginTop: "20px"
//                         }}>
 
//                             {/* LEFT */}
//                             <div>
//                                 <h4>Status Summary</h4>
 
//                                 <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
 
//                                     {/* ✅ DONUT CHART */}
//                                     <PieChart width={180} height={180}>
//                                         <Pie
//                                             data={chartData}
//                                             cx="50%"
//                                             cy="50%"
//                                             innerRadius={50}
//                                             outerRadius={70}
//                                             paddingAngle={3}
//                                             dataKey="value"
//                                         >
//                                             {chartData.map((entry, index) => (
//                                                 <Cell key={index} fill={entry.color} />
//                                             ))}
//                                         </Pie>
//                                         <Tooltip />
//                                     </PieChart>
 
//                                     {/* ✅ LEGEND */}
//                                     <div style={{ fontSize: "14px" }}>
//                                         {chartData.map((item, i) => (
//                                             <div key={i} style={{ marginBottom: "6px" }}>
//                                                 <span style={{
//                                                     display: "inline-block",
//                                                     width: "10px",
//                                                     height: "10px",
//                                                     borderRadius: "50%",
//                                                     background: item.color,
//                                                     marginRight: "6px"
//                                                 }} />
//                                                 {item.name}: {item.value}
//                                             </div>
//                                         ))}
//                                     </div>
 
//                                 </div>
 
 
//                             </div>
 
//                             {/* RIGHT */}
//                             <div style={{ flex: 1 }}>
//                                 <h4>Team Workload</h4>
 
//                                 {selectedTeam.members?.map((m: any, i: number) => {
 
//                                     const colors = ["#3b82f6", "#f59e0b", "#22c55e", "#a855f7"];
 
//                                     const val = Math.floor(Math.random() * 100);
 
//                                     return (
//                                         <div key={i} style={{ marginBottom: "12px" }}>
 
//                                             <div style={{
//                                                 display: "flex",
//                                                 justifyContent: "space-between",
//                                                 fontSize: "12px"
//                                             }}>
//                                                 <span>{m.name}</span>
//                                                 <span>{val}%</span>
//                                             </div>
 
//                                             <div style={{
//                                                 height: "6px",
//                                                 background: "#eee",
//                                                 borderRadius: "10px"
//                                             }}>
//                                                 <div style={{
//                                                     width: `${val}%`,
//                                                     height: "100%",
//                                                     background: colors[i % colors.length],
//                                                     borderRadius: "10px"
//                                                 }} />
//                                             </div>
 
//                                         </div>
//                                     );
//                                 })}
//                             </div>
 
//                         </div>
//                     </div>
//                 )}
 
//                 <h3 style={{ marginTop: "30px" }}>Team Workload</h3>
 
//                 <div style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
//                     gap: "20px",
//                     marginTop: "20px"
//                 }}>
//                     {workload.map((team) => {
//                         // console.log("TEAM DATA:", team);   // ✅ ADD HERE
 
//                         // ✅ fake progress (or later connect backend)
//                         const progress = Math.floor(Math.random() * 80) + 20;
 
//                         return (
//                             <div
//                                 key={team.team_id}
//                                 style={{
//                                     position: "relative",
//                                     cursor: "pointer",
//                                     background: "#ffffff",
//                                     padding: "22px",
//                                     borderRadius: "24px",
//                                     boxShadow: "0 20px 50px rgba(99, 102, 241, 0.08)",
//                                     transition: "transform 0.3s ease, box-shadow 0.3s ease",
//                                 }}
//                                 onMouseEnter={(e) => {
//                                     const el = e.currentTarget as HTMLDivElement;
//                                     el.style.transform = "translateY(-3px)";
//                                     el.style.boxShadow = "0 24px 60px rgba(99, 102, 241, 0.12)";
//                                 }}
//                                 onMouseLeave={(e) => {
//                                     const el = e.currentTarget as HTMLDivElement;
//                                     el.style.transform = "translateY(0)";
//                                     el.style.boxShadow = "0 20px 50px rgba(99, 102, 241, 0.08)";
//                                 }}
//                             >
 
//                                 {/* ✅ ACTION ICONS */}
//                                 <div style={{
//                                     position: "absolute",
//                                     top: "10px",
//                                     right: "10px",
//                                     display: "flex",
//                                     gap: "10px"
//                                 }}>
 
//                                     {/* 🗑 DELETE */}
//                                     <span
//                                         onClick={async (e) => {
//                                             e.stopPropagation();
//                                                 if (!confirm("Delete this team?")) return;
 
//                                             try {
//                                                 await api.delete(`/teams/${team.team_id}`);
//                                                 console.log("✅ Deleted");
 
//                                                 // refresh list
//                                                 await fetchData();
//                                             } catch (err: any) {
//                                                 console.error("❌ Delete failed:", err);
//                                                 alert(err?.response?.data?.detail || "Failed to delete team");
//                                             }
//                                         }}
//                                         style={{
//                                             cursor: "pointer",
//                                             fontSize: "16px",
//                                             background: "rgba(0,0,0,0.05)",
//                                             padding: "4px",
//                                             borderRadius: "6px"
//                                         }}
//                                     >
//                                         🗑️
//                                     </span>
 
//                                 </div>
 
 
 
//                                 {/* ✅ CLICKABLE CONTENT */}
//                                 <div onClick={() => handleTeamClick(team)}>
 
 
 
 
//                                     {/* ✅ HEADER */}
//                                     <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                                         <div style={{
//                                             width: "30px",
//                                             height: "30px",
//                                             borderRadius: "8px",
//                                             background: "#6366f1",
//                                             display: "flex",
//                                             alignItems: "center",
//                                             justifyContent: "center",
//                                             color: "#fff",
//                                             fontWeight: "bold"
//                                         }}>
//                                             {/* {team.team_name.charAt(0)} */}
//                                             {team.team_name?.charAt(0) || "?"}
//                                         </div>
//                                         <h4 style={{ margin: 0 }}>{team.team_name || "unnamed team"}</h4>
 
//                                         {/* <h4 style={{ margin: 0 }}>{team.team_name}</h4> */}
//                                     </div>
 
//                                     {/* ✅ MEMBERS AVATAR STYLE */}
//                                     <div style={{
//                                         display: "flex",
//                                         marginTop: "10px"
//                                     }}>
//                                         {team.members?.slice(0, 4).map((member: any, i: number) => (
//                                             <div
//                                                 key={member.user_id}
//                                                 style={{
//                                                     width: "30px",
//                                                     height: "30px",
//                                                     borderRadius: "50%",
//                                                     background: "#ddd",
//                                                     display: "flex",
//                                                     alignItems: "center",
//                                                     justifyContent: "center",
//                                                     marginLeft: i === 0 ? 0 : "-8px",
//                                                     border: "2px solid white",
//                                                     fontSize: "12px"
//                                                 }}
//                                             >
//                                                 {member.name[0]}
//                                             </div>
//                                         ))}
//                                     </div>
 
//                                     {/* ✅ DATE */}
//                                     <div style={{
//                                         marginTop: "10px",
//                                         fontSize: "12px",
//                                         color: "#6b7280"
//                                     }}>
//                                         • Aug 16 2025
//                                         <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>Owner: {team.owner_name || 'Unknown'} • {team.owner_role || 'member'}</div>
//                                     </div>
 
//                                     {/* ✅ PROGRESS */}
//                                     <div style={{ marginTop: "14px" }}>
//                                         <div style={{ fontSize: "12px", marginBottom: "4px" }}>
//                                             Project Progress
//                                         </div>
 
//                                         <div style={{
//                                             height: "6px",
//                                             background: "#eee",
//                                             borderRadius: "10px",
//                                             overflow: "hidden"
//                                         }}>
//                                             <div style={{
//                                                 width: `${progress}%`,
//                                                 height: "100%",
//                                                 background: "linear-gradient(90deg,#7c3aed,#4f46e5)"
//                                             }} />
//                                         </div>
 
//                                         <div style={{
//                                             textAlign: "right",
//                                             fontSize: "12px",
//                                             marginTop: "4px",
//                                             color: "#555"
//                                         }}>
//                                             {progress}%
//                                         </div>
//                                     </div>
//                                 </div>
 
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </div>
//     );
// };
 
// // ✅ CARD
// const Card = ({ label, value }: any) => {
 
//     const config: any = {
//         "Total Tasks": { color: "#22c55e", icon: "✅", sub: "in the last 7 days" },
//         "Assigned": { color: "#3b82f6", icon: "🖊️", sub: "recent updates" },
//         "Overdue": { color: "#ef4444", icon: "⏰", sub: "need attention" },
//         "Completed Tasks": { color: "#a855f7", icon: "➕", sub: "recently added" },
//     };
 
//     const item = config[label] || config["Total Tasks"];
 
//     return (
//         <div
//             style={{
//                 background: "#fff",
//                 padding: "18px",
//                 borderRadius: "14px",
//                 minWidth: "220px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "14px",
//                 boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
//             }}
//         >
 
//             {/* ✅ ICON */}
//             <div
//                 style={{
//                     width: "42px",
//                     height: "42px",
//                     borderRadius: "50%",
//                     background: `${item.color}20`,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "18px"
//                 }}
//             >
//                 {item.icon}
//             </div>
 
//             {/* ✅ TEXT */}
//             <div style={{ flex: 1 }}>
//                 <div style={{ fontWeight: 600, fontSize: "16px" }}>
//                     {value} {label.toLowerCase()}
//                 </div>
 
//                 <div style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     marginTop: "2px"
//                 }}>
//                     {item.sub}
//                 </div>
//             </div>
//         </div>
//     );
// };
 
// export default ActivityPage;