import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ================= TYPES ================= */

type TaskCard = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  badgeColor: string;
  assignee?: { initials: string; color: string };
  comments?: number;
  due?: string;
  complete?: boolean;
};

type BoardColumn = {
  id: string;
  title: string;
  cards: TaskCard[];
};

type TourStep = {
  title: string;
  description: string;
  activeCardId: string;
  columns: BoardColumn[];
};

/* ================= STEPS ================= */

const steps: TourStep[] = [
  {
    title: "Create tasks to organize your work",
    description: "Add a new card with priority and context so your team can move faster.",
    activeCardId: "task-1",
    columns: [
      {
        id: "todo",
        title: "To do",
        cards: [
          { id: "task-1", title: "Design Landing Page", detail: "High-priority campaign page for launch.", badge: "High", badgeColor: "#fee2e2", due: "Today" },
          { id: "task-2", title: "Product kickoff", detail: "Review goals with the team.", badge: "Medium", badgeColor: "#fef9c3" }
        ]
      },
      {
        id: "progress",
        title: "In progress",
        cards: [
          { id: "task-3", title: "Review assets", detail: "Check visuals before release.", badge: "Low", badgeColor: "#d9f99d", assignee: { initials: "AL", color: "#7c3aed" } }
        ]
      },
      {
        id: "done",
        title: "Done",
        cards: [
          { id: "task-4", title: "Sync analytics", detail: "Verify tracking setup.", badge: "Low", badgeColor: "#d9f99d", complete: true }
        ]
      }
    ]
  },

  {
    title: "Assign tasks to your teammates",
    description: "Add a collaborator so ownership is clear.",
    activeCardId: "task-1",
    columns: [
      {
        id: "todo",
        title: "To do",
        cards: [
          { id: "task-1", title: "Design Landing Page", detail: "Launch page", badge: "High", badgeColor: "#fee2e2", assignee: { initials: "JM", color: "#2563eb" } }
        ]
      },
      { id: "progress", title: "In progress", cards: [] },
      { id: "done", title: "Done", cards: [] }
    ]
  },

  {
    title: "Complete tasks and boost productivity",
    description: "Finish work and close the loop.",
    activeCardId: "task-1",
    columns: [
      {
        id: "done",
        title: "Done",
        cards: [
          { id: "task-1", title: "Design Landing Page", detail: "Completed!", badge: "High", badgeColor: "#fee2e2", complete: true }
        ]
      }
    ]
  }
];

/* ================= COMPONENT ================= */

const DemoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ SAFE FIX (no undefined crash)
  const current = useMemo(() => steps[currentStep] || steps[0], [currentStep]);

  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-md z-50">
          
          {/* BACKDROP */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative z-50 w-[1100px] max-w-[95%] rounded-2xl bg-white/80 backdrop-blur-lg border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8"
          >

            {/* CLOSE */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 border border-gray-200 text-slate-700 shadow-sm transition-all duration-300 hover:bg-white"
            >
              ✕
            </button>

            {/* ===== MAIN LAYOUT FIXED ===== */}
            <div className="flex items-center justify-center gap-12">

              {/* LEFT BOARD */}
              <div className="w-[450px] flex justify-center items-center">
                <div className="flex gap-4">
                  {current.columns.map(col => (
                    <div key={col.id} className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner border border-gray-200">

                      <p className="text-xs uppercase text-gray-500 mb-3">{col.title}</p>

                      <div className="space-y-3">
                        {col.cards.map(card => {
                          const isActive = card.id === current.activeCardId;

                          return (
                            <motion.div
                              key={card.id}
                              className={`bg-white rounded-xl p-4 border border-gray-100 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03] ${
                                isActive ? "border-blue-300 shadow-[0_10px_30px_rgba(59,130,246,0.2)]" : ""
                              }`}
                            >
                              <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{card.detail}</p>
                            </motion.div>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="flex flex-col gap-6 max-w-[400px]">

                <div>
                  <p className="text-xs uppercase text-gray-400 tracking-[0.24em]">Demo Snapshot</p>
                  <h2 className="text-3xl font-semibold mt-2 text-gray-900 tracking-tight">Guided product tour</h2>
                  <p className="text-gray-500 leading-7 mt-3">Interactive preview of your app workflow.</p>
                </div>

                {/* STEP INFO */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-inner">
                  <p className="text-sm text-gray-400">Current step</p>
                  <h3 className="font-semibold mt-3 text-gray-900 text-xl">{current.title}</h3>
                  <p className="text-gray-500 text-sm leading-7 mt-2">{current.description}</p>
                </div>

                {/* BUTTONS */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm transition-all duration-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      currentStep < steps.length - 1
                        ? setCurrentStep(currentStep + 1)
                        : onClose()
                    }
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                  >
                    Next
                  </button>
                </div>

              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;

