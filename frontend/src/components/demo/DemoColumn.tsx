import React from "react";
import { motion } from "framer-motion";
import DemoCard from "./DemoCard";

type DemoColumnProps = {
  id: string;
  title: string;
  cards: any[];
  onCardClick?: (id: string) => void;
  highlightedCardId?: string | null;
};

const columnVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const DemoColumn: React.FC<DemoColumnProps> = ({ id, title, cards, onCardClick, highlightedCardId }) => {
  return (
    <motion.div variants={columnVariants} initial="hidden" animate="visible" style={{ background: "rgba(255,255,255,0.6)", padding: 12, borderRadius: 12, minHeight: 120 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cards.map((c) => (
          <DemoCard key={c.id} id={c.id} title={c.title} description={c.description} onClick={onCardClick} highlighted={highlightedCardId === c.id} />
        ))}
      </div>
    </motion.div>
  );
};

export default DemoColumn;
