import { useEffect, useState } from "react";
import { api } from "../../services/api";
 
const UserQueries = () => {
  const [queries, setQueries] = useState<any[]>([]);
 
  useEffect(() => {
    api.get("/admin/queries").then((res) => {
      setQueries(res.data);
    });
  }, []);
 
  return (
    <div>
      <h2>User Queries</h2>
 
      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
 
        <tbody>
          {queries.map((q) => (
            <tr key={q.id}>
              <td>{q.user}</td>
              <td>{q.message}</td>
              <td>{new Date(q.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
 
export default UserQueries;