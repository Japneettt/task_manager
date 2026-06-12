// src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Layers3,
  CalendarDays,
  Users,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { api } from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
type DashboardCounts = {
  todo: number;
  in_progress: number;
  done: number;
};

type Productivity = {
  total_tasks: number;
  assigned_tasks: number;
  overdue_tasks: number;
  completed_tasks: number;
};

type TeamType = {
  team_id: string;
  team_name: string;
  members: any[];
  archived: boolean;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<DashboardCounts>({
    todo: 0,
    in_progress: 0,
    done: 0,
  });

  const [productivity, setProductivity] = useState<Productivity>({
    total_tasks: 0,
    assigned_tasks: 0,
    overdue_tasks: 0,
    completed_tasks: 0,
  });

  const [teams, setTeams] = useState<TeamType[]>([]);
  const [personalBoardsCount, setPersonalBoardsCount] =
    useState(0);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] =
    useState(new Date());
  const [currentWeek, setCurrentWeek] =
  useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [allBoards, setAllBoards] = useState<any[]>([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchDashboard();
  }, [currentMonth, currentWeek]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDashboard = async () => {
    try {
      const [
        dashboardRes,
        productivityRes,
        workloadRes,
        meRes,
        recentTasksRes,
        deadlinesRes,
        analyticsRes,
        personalBoardsRes,
        plannerRes,
        overviewRes,
  
      ] = await Promise.all([
        api.get("/dashboard"),
        api.get("/activity/productivity"),
        api.get("/activity/workload"),
        api.get("/users/me"),

        api.get("/dashboard/recent-tasks"),
        api.get("/dashboard/upcoming-deadlines"),
        api.get(
          `/dashboard/analytics-graph?month=${currentMonth.getMonth() + 1
          }&year=${currentMonth.getFullYear()}`
        ),
        api.get("/boards/personal"),
        api.get("/planner"),
        api.get(`/dashboard/task-overview?week_offset=${currentWeek}`),
      ]);
      setAllBoards(personalBoardsRes.data || []);
      setAllTasks([
        ...(recentTasksRes.data || []),
        ...(deadlinesRes.data || []),
      ]);
      setCounts(dashboardRes.data);
      setProductivity(productivityRes.data);
      setTeams(workloadRes.data);
      setRecentTasks(recentTasksRes.data);
      setDeadlines(deadlinesRes.data);
      setAnalyticsData(analyticsRes.data);
      setOverviewData(overviewRes.data);
      setUser(meRes.data);
      setPersonalBoardsCount(personalBoardsRes.data.length);
      setPlannerData(plannerRes.data || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const [user, setUser] = useState<any>(null);

  // ✅ Calculate chart data from planner API
  const todoCount = plannerData?.kanban?.to_do?.length || 0;
  const inProgressCount = plannerData?.kanban?.in_progress?.length || 0;
  const doneCount = plannerData?.kanban?.done?.length || 0;

  const chartData = [
    {
      name: "To Do",
      value: todoCount,
      color: "#8B5CF6",
    },
    {
      name: "In Progress",
      value: inProgressCount,
      color: "#3B82F6",
    },
    {
      name: "Done",
      value: doneCount,
      color: "#22C55E",
    },
  ];

  const [analyticsData, setAnalyticsData] =
    useState<any[]>([]);
  const [overviewData, setOverviewData] =
  useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] =
    useState("");

  const [teamImage, setTeamImage] =
    useState<File | null>(null);
  const [teamMembers, setTeamMembers] =
    useState("");
  const [hoveredTaskIndex, setHoveredTaskIndex] = useState<number | null>(null);
  const [hoveredDeadlineIndex, setHoveredDeadlineIndex] = useState<number | null>(null);

  const handleCreateTeam = async () => {
    try {
      const formData = new FormData();

      formData.append("name", teamName);

      formData.append("type", "private");

      formData.append(
        "description",
        teamDescription
      );

      if (teamImage) {
        formData.append("image", teamImage);
      }

      // ✅ CREATE TEAM
      const res = await api.post(
        "/teams/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const createdTeam = res.data;

      // ✅ INVITE MEMBERS
      if (teamMembers.trim()) {

        const emailArray = teamMembers
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean);

        await api.post(
          `/teams/${createdTeam.id}/invite`,
          {
            emails: emailArray,
          }
        );
      }

      alert("Team created successfully ✅");

      setTeamName("");
      setTeamDescription("");
      setTeamImage(null);
      setTeamMembers("");

      fetchDashboard();

    } catch (err) {
      console.log(err);

      alert("Failed to create team");
    }
  };
  const filteredTasks = search
    ? allTasks.filter(t => t?.title?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : [];

  const filteredBoards = search
    ? allBoards.filter(b => (b.title || "").toLowerCase().includes(debouncedSearch.toLowerCase()))
    : [];

  const filteredTeams = search
    ? teams.filter(t => (t.team_name || "").toLowerCase().includes(debouncedSearch.toLowerCase()))
    : [];
const getWeekRange = () => {
  const today = new Date();

  const currentDay = today.getDay();

  const monday = new Date(today);

  monday.setDate(
    today.getDate() - currentDay + 1 + currentWeek * 7
  );

  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  return `${monday.toLocaleDateString(
    "en-US",
    options
  )} - ${sunday.toLocaleDateString(
    "en-US",
    options
  )}`;
};
  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <Navbar />
      {/* navbar already above */}

      <div style={{ ...styles.container, padding: "10px" }}>
        {/* LEFT */}
        {/* TOP SECTION */}
        <div style={styles.topSection}>

          {/* LEFT CONTENT */}
          <div style={styles.leftTop}>
            {/* HEADER */}
            <div style={styles.header}>
              <div>
                <h1 style={styles.heading}>
                  <span style={styles.helloText}>Hello, </span>
                  <span style={styles.userName}>
                    {user?.first_name}!
                  </span>
                </h1>

                <p style={styles.subheading}>
                  Let's turn today's plans into tomorrow's progress.
                  <br />
                  You've got this!
                </p>
              </div>


              {/* ✅ SEARCH */}
              <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
                <div style={styles.searchContainer}>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks, boards, teams..."
                    style={styles.searchInput}
                  />
                </div>

                {debouncedSearch && (
                  <div style={styles.dropdownResults}>
                    {/* Teams */}
                    {filteredTeams.length > 0 && (
                      <>
                        <div style={styles.dropdownLabel}>Teams</div>
                        {filteredTeams.map((t) => (
                          <div
                            key={t.team_id}
                            style={styles.dropdownItem}
                            onClick={() => navigate(`/teams/${t.team_id}`)}
                          >
                            👥 {t.team_name}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Boards */}
                    {filteredBoards.length > 0 && (
                      <>
                        <div style={styles.dropdownLabel}>Boards</div>
                        {filteredBoards.map((b) => (
                          <div
                            key={b.id}
                            style={styles.dropdownItem}
                            onClick={() => navigate(`/boards/${b.id}`)}
                          >
                            📋 {b.title}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Tasks */}
                    {filteredTasks.length > 0 && (
                      <>
                        <div style={styles.dropdownLabel}>Cards</div>
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            style={styles.dropdownItem}
                          >
                            ✅ {task.title}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>




            {/* TOP CARDS */}
            <div style={styles.cardsGrid}>
              <DashboardCard
                title="Total Tasks"
                value={counts.todo + counts.in_progress + counts.done}
                // value={productivity.total_tasks}
                icon={<LayoutDashboard size={18} />}
                color="#5B5BD6"
              />

              <DashboardCard
                title="To Do"
                value={counts.todo}
                icon={<ClipboardList size={18} />}
                color="#8B5CF6"
              />

              <DashboardCard
                title="In Progress"
                value={counts.in_progress}
                icon={<Clock3 size={18} />}
                color="#3B82F6"
              />

              <DashboardCard
                title="Completed"
                value={counts.done}
                icon={<CheckCircle2 size={18} />}
                color="#22C55E"
              />

              
            </div>

            {/* ANALYTICS */}
            <div style={styles.analyticsWrapper}>
              <div style={styles.analyticsCard}>
                <div style={styles.cardTop}>
                  <h3 style={styles.cardHeading}>Analytics Overview</h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() - 1,
                            1
                          )
                        )
                      }
                      style={styles.monthBtn}
                    >
                      &lt;
                    </button>

                    <span style={styles.monthText}>
                      {months[currentMonth.getMonth()]}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() + 1,
                            1
                          )
                        )
                      }
                      style={styles.monthBtn}
                    >
                      &gt;
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "300px",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient
                          id="greenGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#22C55E"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22C55E"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="blueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="purpleGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />

                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "#8C8CA1",
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        domain={[0, "auto"]}
                        tick={{
                          fill: "#8C8CA1",
                          fontSize: 12,
                        }}
                      />

                      <Tooltip />

                      {/* COMPLETED */}
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#22C55E"
                        fill="url(#greenGradient)"
                        strokeWidth={3}
                      />

                      {/* PROGRESS */}
                      <Area
                        type="monotone"
                        dataKey="progress"
                        stroke="#3B82F6"
                        fill="url(#blueGradient)"
                        strokeWidth={3}
                      />

                      {/* TODO */}
                      <Area
                        type="monotone"
                        dataKey="todo"
                        stroke="#8B5CF6"
                        fill="url(#purpleGradient)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.legend}>
                  <div style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.dot,
                        background: "#22C55E",
                      }}
                    ></span>
                    Completed
                  </div>

                  <div style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.dot,
                        background: "#3B82F6",
                      }}
                    ></span>
                    In Progress
                  </div>

                  <div style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.dot,
                        background: "#8B5CF6",
                      }}
                    ></span>
                    To Do
                  </div>
                </div>
              </div>

              {/* RECENT TASKS */}
              <div style={styles.recentTasks}>
                <div style={styles.cardTop}>
                  <h3 style={styles.cardHeading}>Recent Tasks</h3>
                </div>

                {recentTasks.map((task: any, i: number) => {
                  let color = "#8B5CF6";

                  if (
                    task.status?.toLowerCase().includes("progress")
                  ) {
                    color = "#3B82F6";
                  }

                  if (
                    task.status?.toLowerCase().includes("done") ||
                    task.status?.toLowerCase().includes("completed")
                  ) {
                    color = "#22C55E";
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.taskRow,
                        ...(hoveredTaskIndex === i ? styles.taskRowHover : {}),
                      }}
                      onMouseEnter={() => setHoveredTaskIndex(i)}
                      onMouseLeave={() => setHoveredTaskIndex(null)}
                    >
                      <div>
                        <h4 style={styles.taskTitle}>
                          {task.title}
                        </h4>

                        <p style={styles.taskSub}>
                          {task.priority || "Task"}
                        </p>
                      </div>

                      <div
                        style={{
                          ...styles.status,
                          background: `${color}15`,
                          color,
                        }}
                      >
                        {task.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUICK ACCESS */}
            {/* QUICK ACCESS */}

          </div>
        </div>


        {/* RIGHT CREATE TEAM PANEL */}
        <div style={styles.right}>
          <h3 style={styles.rightTitle}>Create New Team</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Team Name</label>

            <input
              placeholder="Enter team name"
              style={styles.input}
              value={teamName}
              onChange={(e) =>
                setTeamName(e.target.value)
              }
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>

            <textarea
              placeholder="Enter team description"
              style={styles.textarea}
              value={teamDescription}
              onChange={(e) =>
                setTeamDescription(e.target.value)
              }
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Invite Members</label>

            <input
              placeholder="john@gmail.com"
              style={styles.input}
              value={teamMembers}
              onChange={(e) =>
                setTeamMembers(e.target.value)
              }
            />
          </div>

          <div style={styles.uploadBox}>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setTeamImage(e.target.files[0]);
                }
              }}
              style={{
                marginBottom: "14px",
              }}
            />

            <h4 style={styles.uploadIcon}>⬆</h4>

            <p style={styles.uploadText}>
              {teamImage
                ? teamImage.name
                : "Upload Image"}
            </p>

            <span style={styles.uploadSub}>
              JPG, PNG up to 2MB
            </span>

          </div>

          <button style={styles.submitBtn} onClick={handleCreateTeam}>
            Create Team
          </button>
        </div>
      </div>
      {/* FULL WIDTH SECTION */}
      <div style={styles.fullWidthSection}>

        {/* QUICK ACCESS */}
        <div style={styles.quickAccessWrapper}>

          <div style={styles.quickAccessTop}>
            <h3 style={styles.quickAccessHeading}>
              Quick Access
            </h3>
          </div>

          <div style={styles.quickGrid}>

            <div onClick={() => navigate("/boards")}>
              <QuickCard
                icon={<Layers3 size={18} />}
                title="My Boards"
                subtitle={`${personalBoardsCount} Boards`}
              />
            </div>

            <QuickCard
              icon={<ClipboardList size={18} />}
              title="My Tasks"
              subtitle={`${productivity.total_tasks} Tasks`}
            />

            <div onClick={() => navigate("/teams")}>
              <QuickCard
                icon={<Users size={18} />}
                title="My Teams"
                subtitle={`${teams.length} Teams`}
              />
            </div>

            <div onClick={() => navigate("/planner")}>
              <QuickCard
                icon={<CalendarDays size={18} />}
                title="Calendar"
                subtitle="View Schedule"
              />
            </div>

          </div>
        </div>

        {/* BOTTOM */}
        <div style={styles.bottomSection}>

          {/* KEEP YOUR CURRENT */}
          {/* TASK PROGRESS CARD */}
          <div style={styles.progressCard}>
            <h3 style={styles.cardHeading}>Task Progress</h3>

            <div style={styles.progressWrapper}>
              {/* DONUT */}
              <div style={styles.donutContainer}>
                <PieChart width={210} height={210}>
                  <Pie
                    data={[
                      {
                        name: "To Do",
                        value: counts.todo,
                      },
                      {
                        name: "In Progress",
                        value: counts.in_progress,
                      },
                      {
                        name: "Completed",
                        value: counts.done,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#8B5CF6" />
                    <Cell fill="#3B82F6" />
                    <Cell fill="#22C55E" />
                  </Pie>
                </PieChart>

                {/* CENTER TEXT */}
                <div style={styles.centerText}>
                  <h2 style={styles.centerNumber}>
                    {counts.todo + counts.in_progress + counts.done}
                    {/* {productivity.total_tasks} */}
                  </h2>

                  <p style={styles.centerLabel}>
                    Total Tasks
                  </p>
                </div>
              </div>

              {/* RIGHT LEGENDS */}
              <div style={styles.progressLegendRight}>
                <div style={styles.progressItem}>
                  <span
                    style={{
                      ...styles.dot,
                      background: "#8B5CF6",
                    }}
                  ></span>

                  <div>
                    <div>To Do</div>
                    <small>{counts.todo} Tasks</small>
                  </div>
                </div>

                <div style={styles.progressItem}>
                  <span
                    style={{
                      ...styles.dot,
                      background: "#3B82F6",
                    }}
                  ></span>

                  <div>
                    <div>In Progress</div>
                    <small>{counts.in_progress} Tasks</small>
                  </div>
                </div>

                <div style={styles.progressItem}>
                  <span
                    style={{
                      ...styles.dot,
                      background: "#22C55E",
                    }}
                  ></span>

                  <div>
                    <div>Completed</div>
                    <small>{counts.done} Tasks</small>
                  </div>
                </div>
              </div>
            </div>


          </div>


          {/* KEEP YOUR CURRENT */}
          {/* TASK OVERVIEW CARD */}
          <div style={styles.barCard}>
  <div style={styles.cardTop}>
    <h3 style={styles.cardHeading}>
      Tasks Overview
    </h3>

    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }}
>
  <button
    style={styles.monthBtn}
    onClick={() =>
      setCurrentWeek(prev => prev - 1)
    }
  >
    &lt;
  </button>

  <span style={styles.monthText}>
    {getWeekRange()}
  </span>

  <button
    style={styles.monthBtn}
    onClick={() =>
      setCurrentWeek(prev => prev + 1)
    }
  >
    &gt;
  </button>
</div>
  </div>

  <div style={{ width: "100%", height: 250 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={overviewData}
        barCategoryGap={18}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E5E7EB"
        />

        <XAxis
          dataKey="day"
          tick={{
            fill: "#94A3B8",
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{
            fill: "#94A3B8",
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip />

        <Legend />

        <Bar
          dataKey="todo"
          name="To Do"
          fill="#8B5CF6"
          radius={[10, 10, 0, 0]}
        />

        <Bar
          dataKey="progress"
          name="In Progress"
          fill="#60A5FA"
          radius={[10, 10, 0, 0]}
        />

        <Bar
          dataKey="done"
          name="Completed"
          fill="#BFDBFE"
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>


          {/* KEEP YOUR CURRENT */}
          {/* DEADLINE CARD */}
          <div style={styles.deadlineCard}>
            <div style={styles.cardTop}>
              <h3 style={styles.cardHeading}>Upcoming Deadlines</h3>
            </div>
<div style={styles.deadlineScroll}>
            {deadlines.map((item: any, i: number) => {
              const dueDate = item.due_date
                ? new Date(item.due_date)
                : null;

              const today = new Date();

              const diff = dueDate
                ? Math.ceil(
                  (dueDate.getTime() - today.getTime()) /
                  (1000 * 60 * 60 * 24)
                )
                : 0;

              return (
                <div
                  key={i}
                  style={{
                    ...styles.deadlineRow,
                    ...(hoveredDeadlineIndex === i ? styles.deadlineRowHover : {}),
                  }}
                  onMouseEnter={() => setHoveredDeadlineIndex(i)}
                  onMouseLeave={() => setHoveredDeadlineIndex(null)}
                >
                  <div>
                    <h4 style={styles.deadlineTitle}>
                      {item.title}
                    </h4>

                    <p style={styles.deadlineSub}>
                      {dueDate
                        ? dueDate.toDateString()
                        : "No due date"}
                    </p>
                  </div>

                  <span style={styles.deadlineRight}>
                    {diff} days left
                  </span>
                </div>
              );
            })}
            </div>


          </div>
        </div>
      </div>





    </div >
  );
};

const DashboardCard = ({
  title,
  value,
  icon,
  color,
}: any) => {
  return (
    <div style={styles.dashboardCard}>
      <div
        style={{
          ...styles.iconBox,
          background: `${color}15`,
          color,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.cardLabel}>{title}</p>
        <h2 style={styles.cardValue}>{value}</h2>
      </div>
    </div>
  );
};

const QuickCard = ({
  icon,
  title,
  subtitle,
}: any) => {
  return (
    <div style={styles.quickCard}>
      <div style={styles.quickIcon}>{icon}</div>

      <div>
        <h4 style={styles.quickTitle}>{title}</h4>
        <p style={styles.quickSub}>{subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;

const styles: any = {
  page: {
    background: "#F7F8FC",
    minHeight: "100vh",
  },

  container: {
    display: "flex",
    gap: "20px",
    width: "100%",
    alignItems: "flex-start",
  },

  topSection: {
    display: "flex",
    gap: "20px",
    width: "100%",
    alignItems: "flex-start",
  },
  leftTop: {
    flex: 1,
    minWidth: 0,
  },
  fullWidthSection: {
    width: "100%",
    marginTop: "0px",
  },

  right: {
    width: "320px",
    minWidth: "320px",
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    height: "fit-content",
    border: "1px solid #ECECEC",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  heading: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#1E1B4B",
  },

  helloText: {
    color: "#7C3AED",
  },


  userName: {
    color: "#A855F7",
  },

  subheading: {
    color: "#374151",
    marginTop: "10px",
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: "26px",
  },

  createBtn: {
    background:
      "linear-gradient(135deg,#7C3AED,#5B5BD6)",
    border: "none",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "16px",
    marginBottom: "24px",
  },

  dashboardCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    border: "1px solid #ECECEC",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deadlineScroll: {
  maxHeight: "240px",
  overflowY: "auto",
  paddingRight: "6px",
},

  cardLabel: {
    margin: 0,
    color: "#8E8EA9",
    fontSize: "13px",
  },

  cardValue: {
    margin: "6px 0 0",
    fontSize: "28px",
    color: "#18181B",
  },

  analyticsWrapper: {
    display: "flex",
    gap: "18px",
    marginBottom: "10px",
  },

  analyticsCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #ECECEC",
  },

  recentTasks: {
    width: "340px",
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #ECECEC",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardHeading: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#1E1B4B",
  },

  select: {
    border: "1px solid #E5E7EB",
    padding: "8px 12px",
    borderRadius: "10px",
    background: "#fff",
  },

  fakeChart: {
    height: "260px",
    position: "relative",
    overflow: "hidden",
  },

  line1: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderBottom: "4px solid #22C55E",
    borderRadius: "50%",
    top: "-40px",
  },

  line2: {
    position: "absolute",
    width: "100%",
    height: "80%",
    borderBottom: "4px solid #3B82F6",
    borderRadius: "50%",
    top: "20px",
  },

  line3: {
    position: "absolute",
    width: "100%",
    height: "60%",
    borderBottom: "4px solid #8B5CF6",
    borderRadius: "50%",
    top: "80px",
  },

  legend: {
    display: "flex",
    gap: "18px",
    marginTop: "14px",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#6B7280",
    fontSize: "13px",
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },

  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    padding: "12px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },

  taskRowHover: {
    backgroundColor: "#F3F4F6",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-2px)",
  },

  taskTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#191919",
  },

  taskSub: {
    margin: "4px 0 0",
    color: "#8B8B9E",
    fontSize: "12px",
  },

  status: {
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "16px",
    marginBottom: "24px",
  },

  quickCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid #ECECEC",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.2s",
  },

  quickIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#F3F0FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7C3AED",
  },

  quickTitle: {
    margin: 0,
    fontSize: "14px",
  },

  quickSub: {
    marginTop: "4px",
    color: "#8C8CA1",
    fontSize: "12px",
  },
quickAccessWrapper: {
  marginTop: "0px",
  marginBottom: "24px",
},

  quickAccessTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },

  quickAccessHeading: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#1E1B4B",
  },

  viewTeamsText: {
    color: "#7C3AED",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },

  bottomSection: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.35fr 1fr",
    gap: "18px",
    width: "100%",
    alignItems: "stretch",
  },

  progressCard: {
    width: "100%",
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #ECECEC",
  },
  progressWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "20px",
  },

  donutContainer: {
    position: "relative",
    width: "180px",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  centerText: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  centerNumber: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#111827",
  },

  centerLabel: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#9CA3AF",
  },

  progressLegendRight: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    flex: 1,
  },


  progressItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
  },

barCard: {
  width: "100%",
  height: "fit-content",
  background: "#fff",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid #ECECEC",
  boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
},

  barWrapper: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: "30px",
    height: "220px",
  },

  barGroup: {
    display: "flex",
    gap: "6px",
    alignItems: "flex-end",
  },

  bar: {
    width: "12px",
    borderRadius: "8px",
  },

  deadlineCard: {
    width: "100%",
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #ECECEC",
  },

  deadlineRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    padding: "12px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },

  deadlineRowHover: {
    backgroundColor: "#F3F4F6",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-2px)",
  },

  deadlineTitle: {
    margin: 0,
    fontSize: "14px",
  },

  deadlineSub: {
    marginTop: "5px",
    color: "#8C8CA1",
    fontSize: "12px",
  },

  deadlineRight: {
    color: "#6B7280",
    fontSize: "12px",
  },

  rightTitle: {
    marginTop: 0,
    color: "#1E1B4B",
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#5B5B70",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    outline: "none",
    background: "#FAFAFA",
  },

  textarea: {
    width: "100%",
    height: "90px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    resize: "none",
    background: "#FAFAFA",
  },

  uploadBox: {
    border: "2px dashed #D8CCFF",
    borderRadius: "18px",
    padding: "40px 20px",
    textAlign: "center" as const,
    background: "#FAF8FF",
    marginTop: "20px",
  },

  uploadIcon: {
    fontSize: "32px",
    marginBottom: "8px",
    color: "#7C3AED",
  },

  uploadText: {
    margin: 0,
    fontWeight: 700,
    color: "#7C3AED",
  },

  uploadSub: {
    color: "#8C8CA1",
    fontSize: "12px",
  },

  submitBtn: {
    marginTop: "24px",
    width: "100%",
    background:
      "linear-gradient(135deg,#7C3AED,#5B5BD6)",
    border: "none",
    color: "#fff",
    padding: "14px",
    borderRadius: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  monthBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "16px",
  },

  monthText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1E1B4B",
    minWidth: "90px",
    textAlign: "center" as const,
  },
  searchContainer: {
    background: "#f1f5f9",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "10px 14px",
  } as const,

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#0f172a",
    fontSize: "14px",
  } as const,

  dropdownResults: {
    position: "absolute" as const,
    top: "55px",
    left: 0,
    width: "100%",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    zIndex: 1000,
    maxHeight: "300px",
    overflowY: "auto" as const,
  } as const,

  dropdownLabel: {
    padding: "10px 12px",
    fontWeight: 600,
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase" as const,
  } as const,

  dropdownItem: {
    padding: "8px 12px",
    cursor: "pointer",
    color: "#0f172a",
    fontSize: "14px",
    transition: "background 0.2s",
  } as const,

  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
  },
};