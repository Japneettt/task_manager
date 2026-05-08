const TaskList = () => {
  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "12px" }}>
      <h5>My Tasks</h5>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>✔ Analyze dashboard UI</li>
        <li>✔ Fix bugs</li>
        <li>✔ Build board feature</li>
      </ul>
    </div>
  );
};

export default TaskList;