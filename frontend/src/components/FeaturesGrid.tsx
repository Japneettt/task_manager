import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureCard from "./FeatureCard";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const FeaturesGrid: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const features = [
    { id: "f1", title: "Board-based planning", description: "Drag-and-drop boards that stay in sync." },
    { id: "f2", title: "Smart collaboration", description: "Comments, mentions, and shared context." },
    { id: "f3", title: "Actionable insights", description: "Track progress with normalized metrics." },
    { id: "f4", title: "Automations", description: "Automate repetitive workflows and triggers." },
  ];

  return (
    <section className="py-20">
      <motion.div initial="hidden" animate="visible" variants={listVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <FeatureCard key={f.id} id={f.id} title={f.title} description={f.description} onSelect={(id) => setSelected(id)} selected={selected === f.id} />
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <motion.div onClick={() => setSelected(null)} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/50" />

            <motion.div
              layoutId={`feature-${selected}`}
              className="relative z-50 w-[700px] max-w-[90%] rounded-2xl bg-white p-6 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{features.find((p) => p.id === selected)?.title}</h3>
                    <p className="mt-2 text-slate-600">{features.find((p) => p.id === selected)?.description}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="rounded-2xl bg-slate-100 px-3 py-2 text-lg text-slate-700 transition hover:bg-slate-200">
                    ✕
                  </button>
                </div>

                <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="space-y-3 text-sm text-slate-700">
                  <motion.li initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.12 }}>• Deep integration with your tools</motion.li>
                  <motion.li initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.18 }}>• Real-time updates and presence</motion.li>
                  <motion.li initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.24 }}>• Flexible permissions and roles</motion.li>
                </motion.ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturesGrid;
