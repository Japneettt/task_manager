import React from "react";
import { motion } from "framer-motion";
import { easeInOut } from "framer-motion";
const headingInitial = { opacity: 0, y: 30 };
const headingAnimate = { opacity: 1, y: 0 };
const subInitial = { opacity: 0, y: 10 };
const subAnimate = { opacity: 1, y: 0 };
const floating = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: easeInOut },
  },
};

const HeroSection: React.FC<{ onViewDemo?: () => void }> = ({ onViewDemo }) => {
  return (
    <section className="py-20">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-8 lg:pr-12">
          <motion.p initial={headingInitial} animate={headingAnimate} transition={{ duration: 0.6 }} className="text-sky-600 font-semibold">
            Project management made effortless
          </motion.p>

          <motion.h1 initial={headingInitial} animate={headingAnimate} transition={{ duration: 0.6 }} className="text-5xl font-bold tracking-tight text-gray-900 leading-tight sm:text-6xl">
            Build better <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">workboards</span>, ship faster, and stay aligned.
          </motion.h1>

          <motion.p initial={subInitial} animate={subAnimate} transition={{ delay: 0.25, duration: 0.6 }} className="max-w-2xl text-gray-500 text-lg leading-7">
            TaskFlow helps teams organize projects with clean boards, smart workflows, and fast collaboration. Launch your next big idea from planning to done.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 font-medium shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30" onClick={() => window.location.assign("/register")}>Get Started</motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 px-8 py-3 text-sm font-semibold text-slate-700 shadow-md transition-all duration-300 hover:bg-white hover:shadow-xl" onClick={() => (onViewDemo ? onViewDemo() : window.location.assign("/login"))}>
              View Demo
            </motion.button>
          </motion.div>
        </div>

        <div className="grid place-items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <motion.div {...floating.animate} className="relative w-full max-w-[420px] rounded-[28px] bg-white/80 backdrop-blur-lg border border-white/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300">
              <div className="rounded-3xl bg-white/90 p-6 shadow-sm border border-white/80">
                <div className="text-lg font-semibold text-slate-900">Project overview</div>
                <div className="mt-2 text-gray-500">Track priorities, progress, and delivery in one elegant workspace.</div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">Pending</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Completed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
