const StatsCard = ({ title, value }: any) => {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "18px",
        borderRadius: "12px",
        width: "220px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <p style={{ fontSize: "14px", color: "#6b7280" }}>{title}</p>
      <h3>{value}</h3>
    </div>
  );
};

export default StatsCard;
