import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PricingCard from "./PricingCard";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const PricingSection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const plans = [
    {
      id: "starter",
      title: "Starter",
      price: "$0",
      features: ["Unlimited boards", "3 members", "Basic analytics"],
    },
    {
      id: "growth",
      title: "Growth",
      price: "$12/user",
      isPopular: true,
      features: ["Advanced reporting", "Team permissions", "Custom workflows"],
    },
    {
      id: "enterprise",
      title: "Enterprise",
      price: "Custom",
      features: ["Dedicated support", "Security controls", "SLA"],
    },
  ];

  return (
    <section id="pricing" style={{ padding: "40px 0 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <p style={{ color: "#2563eb", fontWeight: 700, marginBottom: "12px" }}>
          Simple pricing for teams of any size
        </p>
        <h2 style={{ fontSize: "2rem", margin: 0 }}>Everything you need to move faster.</h2>
      </div>

      <motion.div
        className="grid"
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {plans.map((plan, idx) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.18 }}>
            <div style={{ opacity: selected && selected !== plan.id ? 0.85 : 1, transform: selected && selected !== plan.id ? "scale(0.96)" : undefined }}>
              <PricingCard
                id={plan.id}
                title={plan.title}
                price={plan.price}
                features={plan.features}
                isPopular={plan.isPopular}
                onSelect={(id) => setSelected(id === selected ? null : id)}
                selected={selected === plan.id}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="overlay"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              onClick={() => setSelected(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50"
            />

            <motion.div
              layoutId={`card-${selected}`}
              className="bg-white w-[900px] max-w-[95%] rounded-2xl shadow-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{plans.find((p) => p.id === selected)?.title}</h3>
                    <div className="mt-2 text-2xl font-extrabold text-slate-900">{plans.find((p) => p.id === selected)?.price}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="rounded-2xl bg-slate-100 px-3 py-2 text-lg text-slate-700 transition hover:bg-slate-200">
                    ✕
                  </button>
                </div>

                <div>
                  <ul className="space-y-3 pl-4 text-sm text-slate-700">
                    {plans
                      .find((p) => p.id === selected)
                      ?.features.map((f) => (
                        <motion.li key={f} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
                          • {f}
                        </motion.li>
                      ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center mt-6 gap-4">
                  <button className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                    Close
                  </button>
                  <button className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                    Start free
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PricingSection;
