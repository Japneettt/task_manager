const BoardCard = ({ title, tasks }: any) => {
  return (
    <div
      style={{
        background: "#fff",
        padding: "18px",
        borderRadius: "12px",
        width: "200px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h6>{title}</h6>
      <p style={{ color: "#6b7280" }}>{tasks}</p>
    </div>
  );
};

export default BoardCard;