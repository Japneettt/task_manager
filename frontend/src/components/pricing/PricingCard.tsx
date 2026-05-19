import React from "react";
import { motion } from "framer-motion";

type PricingCardProps = {
  id: string;
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  onSelect?: (id: string) => void;
  selected?: boolean;
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const PricingCard: React.FC<PricingCardProps> = ({
  id,
  title,
  price,
  features,
  isPopular,
  onSelect,
  selected,
}) => {
  return (
    <motion.div
      layout
      layoutId={`card-${id}`}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={cardVariants}
      whileHover={{ scale: selected ? 1.02 : 1.06, y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onClick={() => onSelect && onSelect(id)}
      className={`bg-white rounded-2xl p-6 shadow-md cursor-pointer select-none transform-gpu
        ${selected ? "z-40" : "z-10"}
        ${isPopular ? "ring-2 ring-indigo-200" : ""}`}
      style={{
        boxShadow: selected
          ? "0 30px 60px rgba(2,6,23,0.2)"
          : "0 12px 30px rgba(2,6,23,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-indigo-600">{title}</div>
          {isPopular && (
            <div className="text-xs text-yellow-600 font-medium">Popular</div>
          )}
        </div>
        <div className="text-2xl font-extrabold">{price}</div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        {features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i }}
            className="flex items-center gap-2"
          >
            <span className="w-3 h-3 rounded-full bg-indigo-200" />
            {f}
          </motion.li>
        ))}
      </ul>

      <div className="mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(id);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:scale-105 transform-gpu"
        >
          Choose plan
        </button>
      </div>
    </motion.div>
  );
};

export default PricingCard;
