import React from "react";
import { motion } from "framer-motion";

type DemoCardProps = {
  id: string;
  title: string;
  description?: string;
  onClick?: (id: string) => void;
  highlighted?: boolean;
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const DemoCard: React.FC<DemoCardProps> = ({ id, title, description, onClick, highlighted }) => {
  return (
    <motion.div
      layout
      layoutId={`demo-card-${id}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={() => onClick && onClick(id)}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        boxShadow: highlighted ? "0 30px 60px rgba(11,102,228,0.16)" : "0 10px 30px rgba(2,6,23,0.08)",
        cursor: "pointer",
        transform: highlighted ? "scale(1.08)" : undefined,
        zIndex: highlighted ? 80 : undefined,
      }}
    >
      <div style={{ fontWeight: 700, color: "#091E42" }}>{title}</div>
      {description && <div style={{ color: "#44546F", fontSize: 13 }}>{description}</div>}
    </motion.div>
  );
};

export default DemoCard;
