import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DemoStepCard from "./DemoStepCard";

type DemoCardItem = {
  id: string;
  title: string;
  description?: string;
};

type DemoBoardProps = {
  columns: Record<string, DemoCardItem[]>;
  activeCardId: string;
};

const columnTitles: Record<string, string> = {
  pending: "Pending",
  progress: "In Progress",
  completed: "Completed",
};

const DemoBoard: React.FC<DemoBoardProps> = ({ columns, activeCardId }) => {
  return (
    <motion.div
      layout
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 18,
        width: "100%",
      }}
    >
      {Object.entries(columns).map(([columnId, cards]) => (
        <motion.div
          key={columnId}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            borderRadius: 24,
            background: "rgba(255, 255, 255, 0.94)",
            border: "1px solid rgba(15, 23, 42, 0.06)",
            padding: 20,
            minHeight: 440,
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div style={{ marginBottom: 18, fontWeight: 800, color: "#0F172A", fontSize: 15 }}>
            {columnTitles[columnId] || columnId}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <AnimatePresence>
              {cards.map((card) => (
                <DemoStepCard
                  key={card.id}
                  title={card.title}
                  description={card.description}
                  active={card.id === activeCardId}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DemoBoard;
