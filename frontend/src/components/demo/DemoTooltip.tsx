import React from "react";
import { motion } from "framer-motion";

const tooltipVar = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const DemoTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div initial="hidden" animate="visible" exit="hidden" variants={tooltipVar} style={{ background: "#fff", padding: 12, borderRadius: 8, boxShadow: "0 10px 30px rgba(2,6,23,0.12)", maxWidth: 320 }}>
    {children}
  </motion.div>
);

export default DemoTooltip;
