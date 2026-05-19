import React from "react";
import { motion } from "framer-motion";

type DemoStepCardProps = {
  title: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
};

const DemoStepCard: React.FC<DemoStepCardProps> = ({ title, description, active, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: active ? 1.06 : 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, ease: "easeInOut" }}
      onClick={onClick}
      className={`relative rounded-[28px] p-7 min-w-[260px] max-w-[380px] transition ${
        active
          ? "border border-sky-200 bg-white shadow-[0_45px_120px_rgba(14,165,233,0.22)]"
          : "border border-slate-200 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] opacity-40 filter grayscale"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className={`font-semibold text-slate-900 ${active ? "text-lg" : "text-base"} mb-2`}>
        {title}
      </div>
      {description && <div className={`text-slate-600 ${active ? "text-sm" : "text-xs"} leading-6`}>{description}</div>}
      {active && <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-sky-600" />}
    </motion.div>
  );
};

export default DemoStepCard;
