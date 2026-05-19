import React from "react";
import { motion } from "framer-motion";

type FeatureCardProps = {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  onSelect?: (id: string) => void;
  selected?: boolean;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ id, title, description, icon, onSelect, selected }) => {
  return (
    <motion.div
      layout
      layoutId={`feature-${id}`}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      onClick={() => onSelect && onSelect(id)}
      className={`flex cursor-pointer flex-col justify-between rounded-xl bg-white p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        selected ? "ring-1 ring-sky-200 shadow-[0_30px_60px_rgba(56,189,248,0.2)]" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-b from-sky-100 to-slate-100 text-slate-700">{icon}</div>
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-sm text-slate-600">{description}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
