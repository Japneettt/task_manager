// import { useEffect, useState } from "react";
// import { api } from "../../services/api";

// const AdminDashboard = () => {
//   const [data, setData] = useState<any>({});
//   const [users, setUsers] = useState<any[]>([]);
//   const [teams, setTeams] = useState<any[]>([]);

//   useEffect(() => {
//     api.get("/admin/dashboard").then(res => setData(res.data));
//     api.get("/admin/users").then(res => setUsers(res.data.data || []));
//     api.get("/teams").then(res => setTeams(res.data || []));
//   }, []);

//   return (
//     <div>

//       <h2 style={{ marginBottom: "20px" }}>Analytics</h2>

//       {/* ✅ TOP STATS */}
//       <div className="topStats">
//         <Stat title="Total Teams" value={data.total_teams} />
//         <Stat title="Active Users" value={data.active_users} />
//         <Stat title="Completed Today" value={data.completed_today} />
//         <Stat title="Overdue Tasks" value={data.overdue} />
//       </div>
//       <div className="dashboardGrid">

//   {/* ✅ TOP USERS */}
//   <div className="card">
//     <div className="cardHeader">
//       <h3>Top Users</h3>
//     </div>

//     {users.slice(0, 5).map((u) => {
//       const initials =
//         (u.first_name?.[0] || "") +
//         (u.last_name?.[0] || "");

//       return (
//         <div className="userItem" key={u.id}>

//           <div className="userAvatar">
//             {initials.toUpperCase()}
//           </div>

//           <div className="userInfo">
//             <div className="userName">
//               {u.first_name} {u.last_name}
//             </div>
//             <div className="userEmail">
//               {u.email}
//             </div>
//           </div>

//           <div className="userScore">
//             {Math.floor(Math.random() * 100)}%
//           </div>

//         </div>
//       );
//     })}
//   </div>

//   {/* ✅ TOP TEAMS */}
//   <div className="card">
//     <div className="cardHeader">
//       <h3>Top Teams</h3>
//     </div>

//     {teams.slice(0, 5).map((team) => (
//       <div className="teamItem" key={team.id}>

//         <div className="teamLeft">
//           <div className="teamIcon"></div>
//           <div>
//             <div className="teamName">
//               {team.name}
//             </div>
//             <div className="teamSub">
//               Team
//             </div>
//           </div>
//         </div>

//         <div className="teamValue">
//           {Math.floor(Math.random() * 900)} tasks
//         </div>

//       </div>
//     ))}
//   </div>

//   {/* ✅ BUSY PERIOD HEATMAP */}
//   <div className="card">
//     <div className="cardHeader">
//       <h3>Busy Periods</h3>
//     </div>

//     <div className="heatmapContainer">

//       {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day, i) => (
//         <div className="heatRow" key={i}>

//           {Array.from({ length: 10 }).map((_, j) => {
//             const level = Math.floor(Math.random() * 5);

//             return (
//               <div
//                 key={j}
//                 className={`heatCell level-${level}`}
//               />
//             );
//           })}

//         </div>
//       ))}

//     </div>

//   </div>

// </div>


//     </div>
//   );
// };

// const Stat = ({ title, value }: any) => (
//   <div className="statCard">
//     <div className="statTitle">{title}</div>
//     <div className="statValue">{value || 0}</div>
//   </div>
// );

// export default AdminDashboard;
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import {
  LineChart, Line, XAxis, Tooltip,
  BarChart, Bar
} from "recharts";

const AdminDashboard = () => {
  const [data, setData] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get("/admin/dashboard").then(res => setData(res.data));
    api.get("/admin/users").then(res => setUsers(res.data.data || []));
  }, []);

  return (
    <div className="dashboardContainer">

      <h2>Analytics Dashboard</h2>

      {/* ✅ TOP METRICS */}
      <div className="metricsGrid">
        <Card title="Total Teams" value={data.total_teams} />
        <Card title="Active Users" value={data.active_users} />
        <Card title="Completed Today" value={data.completed_today} />
        <Card title="Overdue Tasks" value={data.overdue} />

        {/* ✅ PRODUCTIVITY RING */}
        <div className="glassCard circleCard">
          <h4>Productivity</h4>
          <div className="circle">
            {data.productivity || 0}%
          </div>
        </div>
      </div>

      {/* ✅ MAIN GRID */}
      <div className="analyticsGrid">

        {/* 🚀 LINE CHART */}
        <div className="glassCard">
          <h4>Productivity Trend</h4>

          <LineChart width={400} height={250} data={[
            { day: "Mon", val: 20 },
            { day: "Tue", val: 40 },
            { day: "Wed", val: 60 },
            { day: "Thu", val: 50 },
            { day: "Fri", val: 80 }
          ]}>
            <XAxis dataKey="day" />
            <Tooltip />
            <Line dataKey="val" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </div>

        {/* 🚀 BAR CHART */}
        <div className="glassCard">
          <h4>Peak Working Hours</h4>

          <BarChart width={400} height={250} data={[
            { hour: "9AM", val: 20 },
            { hour: "11AM", val: 40 },
            { hour: "1PM", val: 70 },
            { hour: "3PM", val: 65 },
            { hour: "6PM", val: 30 }
          ]}>
            <XAxis dataKey="hour" />
            <Tooltip />
            <Bar dataKey="val" fill="#22c55e" />
          </BarChart>
        </div>

        {/* 🔥 MOST ACTIVE USERS */}
        <div className="glassCard">
          <h4>Most Active Users</h4>

          {users.slice(0, 5).map((u) => (
            <div className="listItem" key={u.id}>
              <div className="avatar">
                {(u.first_name?.[0] || "") +
                 (u.last_name?.[0] || "")}
              </div>

              <div>
                <div>{u.first_name} {u.last_name}</div>
                <small>{u.email}</small>
              </div>

              <span>{Math.floor(Math.random()*100)}%</span>
            </div>
          ))}
        </div>

        {/* 🔥 HEATMAP */}
        <div className="glassCard">
          <h4>Team Activity Heatmap</h4>

          {[...Array(6)].map((_, i) => (
            <div className="heatRow" key={i}>
              {[...Array(10)].map((_, j) => {
                const level = Math.floor(Math.random() * 5);
                return <div className={`heatCell l${level}`} key={j}></div>;
              })}
            </div>
          ))}
        </div>

        {/* ✅ ONLINE USERS */}
        <div className="glassCard">
          <h4>Online Members</h4>

          {users.slice(0, 5).map(u => (
            <div className="listItem" key={u.id}>
              <div className="avatar greenDot">
                {(u.first_name?.[0] || "")}
              </div>
              <span>{u.first_name}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

const Card = ({ title, value }: any) => (
  <div className="glassCard">
    <h4>{title}</h4>
    <h2>{value || 0}</h2>
  </div>
);

export default AdminDashboard;