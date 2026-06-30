// import HomeNavbar from "../components/layout/HomeNavbar";
// import PricingSection from "../components/pricing/PricingSection";
// import HeroSection from "../components/HeroSection";
// import FeaturesGrid from "../components/FeaturesGrid";
// import DemoModal from "../components/demo/DemoModal";
// import { useState } from "react";

// const HomePage = () => {
//   const [isDemoOpen, setIsDemoOpen] = useState(false);
//   return (
//     <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100 min-h-screen text-slate-900">
//       <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-200/50 to-transparent blur-3xl" />
//       <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
//       <HomeNavbar />

//       <main className="relative max-w-7xl mx-auto px-6 py-20">
//         <HeroSection onViewDemo={() => setIsDemoOpen(true)} />

//         <div className="py-16">
//           <FeaturesGrid />
//         </div>

//         <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

//         <section id="solutions" className="py-20">
//           <div className="grid gap-6 md:grid-cols-3">
//             {[
//               {
//                 title: "Integrations",
//                 description: "Connect your tools and keep everything in sync.",
//               },
//               {
//                 title: "Automation",
//                 description: "Reduce manual updates with workflow automations.",
//               },
//               {
//                 title: "Reporting",
//                 description: "Turn board activity into actionable team metrics.",
//               },
//             ].map((item) => (
//               <div key={item.title} className="bg-white/95 rounded-2xl border border-slate-200 p-8 shadow-md transition-all duration-300 hover:shadow-xl">
//                 <div className="text-lg font-semibold mb-3">{item.title}</div>
//                 <p className="text-slate-600">{item.description}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         <PricingSection />
//       </main>
//     </div>
//   );
// };

// export default HomePage;
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, useAnimationFrame } from "framer-motion";
import workivoLogo from "../assets/workivo-logo.png";
import DemoModal from "../components/demo/DemoModal";
// ─── Types ────────────────────────────────────────────────────────────────────
interface Card { id: string; title: string; assignee: string; color: string; priority: "high" | "medium" | "low"; progress: number; }
interface Column { id: string; title: string; cards: Card[]; }
interface Message { id: string; user: string; text: string; time: string; avatar: string; }
interface CursorPos { x: number; y: number; }

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATARS = ["AK", "SM", "JL", "PR", "TN", "EM"];
const AVATAR_COLORS = ["#7C5CFF", "#A78BFA", "#8E7BFF", "#C4B5FD", "#6D4AE8", "#9061F9"];
const PRIORITY_COLORS = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };

// ─── Utility Hooks ────────────────────────────────────────────────────────────
function useMouse() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const h = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [x, y]);
  return { x, y };
}

// ─── Cursor Glow ──────────────────────────────────────────────────────────────
function CursorGlow() {
  const { x, y } = useMouse();
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 mix-blend-normal"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
    >
      <div style={{ width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,255,0.08) 0%, transparent 70%)", filter: "blur(20px)" }} />
    </motion.div>
  );
}

// ─── Animated Blob ────────────────────────────────────────────────────────────
function Blob({ style, color1, color2 }: { style?: React.CSSProperties; color1: string; color2: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", background: `radial-gradient(circle, ${color1}, ${color2})`, filter: "blur(60px)", opacity: 0.35, ...style }}
      animate={{ borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 70% 30% 60%", "70% 30% 40% 60% / 30% 60% 40% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%"] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Floating Particle Field ──────────────────────────────────────────────────
function ParticleField() {
  const particles = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `rgba(124,92,255,${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = () => { start += to / 60; if (start < to) { setVal(Math.floor(start)); requestAnimationFrame(step); } else setVal(to); };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────
function MagneticBtn({ children, primary, onClick }: { children: React.ReactNode; primary?: boolean; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.25);
  };
  const handleLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative px-7 py-3.5 rounded-2xl font-semibold text-sm overflow-hidden transition-shadow ${primary
          ? "text-white shadow-lg shadow-purple-300/40"
          : "text-purple-700 border border-purple-200 bg-white/70 backdrop-blur-sm hover:border-purple-400"
        }`}
      style={primary ? { background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", ...(sx as any) } : undefined}
    >
      {primary && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100"
          style={{ background: "linear-gradient(135deg,#8E7BFF,#C4B5FD)" }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(248,246,255,0)", "rgba(255,255,255,0.85)"]);
  const shadow = useTransform(scrollY, [0, 80], ["0 0 0 rgba(124,92,255,0)", "0 4px 30px rgba(124,92,255,0.08)"]);
  // const links = ["Product", "Features", "Pricing", "Enterprise", "Blog"];
  const links = [
  "Overview",
  "Features",
  "Intelligence",
  "Contact",
];
  return (
    <motion.nav
      style={{ backgroundColor: bg, boxShadow: shadow, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-4 border-b border-purple-100/40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          {/* <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#7C5CFF,#A78BFA)" }}
            animate={{ rotate:[0,5,-5,0] }}
            transition={{ duration:6, repeat:Infinity, ease:"easeInOut" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="2" fill="white" opacity="0.9"/>
              <rect x="9" y="1" width="6" height="6" rx="2" fill="white" opacity="0.6"/>
              <rect x="1" y="9" width="6" height="6" rx="2" fill="white" opacity="0.6"/>
              <rect x="9" y="9" width="6" height="6" rx="2" fill="white" opacity="0.9"/>
            </svg>
          </motion.div> */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <img src={workivoLogo} alt="Workivo" className="h-10 w-auto object-contain" />

            <span
              className="font-bold text-3xl tracking-tight"
              style={{
                color: "#1f2937",
              }}
            >
              Workivo
            </span>
          </motion.div>

        </motion.div>
        <div className="hidden md:flex items-center gap-8">
  {links.map((l, i) => (
    <motion.button
      key={l}
      onClick={() => {
        const ids: Record<string, string> = {
          Overview: "overview",
          Features: "features",
          Intelligence: "intelligence",
          Contact: "contact",
        };

        document
          .getElementById(ids[l])
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }}
      className="text-sm text-slate-600 hover:text-purple-700 font-medium transition-colors relative group"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      {l}

      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
      />
    </motion.button>
  ))}
</div>
        {/* <div className="hidden md:flex items-center gap-8">
          {links.map((l, i) => (
            <motion.a
              key={l}
              href="#"
              className="text-sm text-slate-600 hover:text-purple-700 font-medium transition-colors relative group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {l}
              <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </motion.a>
          ))}
        </div> */}
        {/* <div className="flex items-center gap-3">
          <motion.a href="#" className="text-sm text-slate-600 hover:text-purple-700 font-medium hidden md:block" whileHover={{ scale:1.03 }}>Log in</motion.a>
          <MagneticBtn primary>Get started free</MagneticBtn>
        </div> */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate("/login")}
            className="text-sm text-slate-600 hover:text-purple-700 font-medium hidden md:block"
            whileHover={{ scale: 1.03 }}
          >
            Log in
          </motion.button>

          <MagneticBtn
            primary
            onClick={() => navigate("/register")}
          >
            Get started free
          </MagneticBtn>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Live Board Demo Component ────────────────────────────────────────────────
const INITIAL_COLUMNS: Column[] = [
  {
    id: "todo", title: "To Do", cards: [
      { id: "c1", title: "Design system update", assignee: "AK", color: "#7C5CFF", priority: "high", progress: 0 },
      { id: "c2", title: "API integration docs", assignee: "SM", color: "#A78BFA", priority: "medium", progress: 0 },
    ]
  },
  {
    id: "progress", title: "In Progress", cards: [
      { id: "c3", title: "Auth flow redesign", assignee: "JL", color: "#8E7BFF", priority: "high", progress: 65 },
      { id: "c4", title: "Dashboard analytics", assignee: "PR", color: "#C4B5FD", priority: "medium", progress: 40 },
    ]
  },
  {
    id: "review", title: "In Review", cards: [
      { id: "c5", title: "Mobile responsive UI", assignee: "TN", color: "#7C5CFF", priority: "low", progress: 90 },
    ]
  },
  {
    id: "done", title: "Done", cards: [
      { id: "c6", title: "Onboarding flow", assignee: "EM", color: "#A78BFA", priority: "medium", progress: 100 },
    ]
  },
];

function LiveBoardCard({ card, isActive }: { card: Card; isActive?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: isActive ? 1.03 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-xl p-3 mb-2 cursor-grab active:cursor-grabbing"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        boxShadow: isActive
          ? "0 12px 40px rgba(124,92,255,0.25), 0 0 0 2px rgba(124,92,255,0.4)"
          : "0 2px 8px rgba(124,92,255,0.08), 0 0 0 1px rgba(124,92,255,0.06)",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-slate-700 leading-tight flex-1 mr-2">{card.title}</p>
        <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: PRIORITY_COLORS[card.priority] }} />
      </div>
      {card.progress > 0 && (
        <div className="mb-2">
          <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#7C5CFF,#A78BFA)" }}
              initial={{ width: 0 }}
              animate={{ width: `${card.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: card.color }}
          >
            {card.assignee[0]}
          </div>
          <span className="text-[10px] text-slate-400">{card.assignee}</span>
        </div>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF" }}>
          {card.priority}
        </span>
      </div>
    </motion.div>
  );
}

function AnimatedBoard() {
  const [cols, setCols] = useState<Column[]>(INITIAL_COLUMNS);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [newCardCol, setNewCardCol] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [cursors, setCursors] = useState<{ [k: string]: CursorPos }>({ alice: { x: 120, y: 80 }, bob: { x: 280, y: 160 } });

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  // Animate cards moving between columns
  useEffect(() => {
    const interval = setInterval(() => {
      setCols(prev => {
        const next = prev.map(c => ({ ...c, cards: [...c.cards] }));
        const srcIdx = Math.floor(Math.random() * 3);
        const src = next[srcIdx];
        if (src.cards.length === 0) return prev;
        const cardIdx = Math.floor(Math.random() * src.cards.length);
        const [card] = src.cards.splice(cardIdx, 1);
        const destIdx = (srcIdx + 1) % 4;
        next[destIdx].cards.push({ ...card, progress: Math.min(card.progress + 20, 100) });
        setActiveCard(card.id);
        showNotif(`${card.assignee} moved "${card.title.slice(0, 20)}..."`);
        setTimeout(() => setActiveCard(null), 800);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [showNotif]);

  // Animate cursors
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => ({
        alice: { x: 80 + Math.random() * 200, y: 40 + Math.random() * 180 },
        bob: { x: 220 + Math.random() * 200, y: 60 + Math.random() * 180 },
      }));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Add a new card periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const titles = ["New feature request", "Bug fix", "Performance audit", "Security review", "UX improvements"];
      const assignees = AVATARS;
      const newCard: Card = {
        id: `c${Date.now()}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as any,
        progress: 0,
      };
      setCols(prev => {
        const next = [...prev];
        next[0] = { ...next[0], cards: [newCard, ...next[0].cards.slice(0, 3)] };
        return next;
      });
      setNewCardCol("todo");
      showNotif(`New task added by ${newCard.assignee}`);
      setTimeout(() => setNewCardCol(null), 600);
    }, 5000);
    return () => clearInterval(interval);
  }, [showNotif]);

  const colColors = ["#E9E3FF", "#FEF3C7", "#DBEAFE", "#D1FAE5"];
  const colDot = ["#7C5CFF", "#F59E0B", "#3B82F6", "#10B981"];

  return (
    <div className="relative w-full h-full select-none">
      {/* Live cursors */}
      {Object.entries(cursors).map(([name, pos]) => (
        <motion.div
          key={name}
          className="absolute z-30 pointer-events-none"
          animate={{ x: pos.x, y: pos.y }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M0 0l10 14 2-5 5-2z" fill={name === "alice" ? "#7C5CFF" : "#10B981"} />
          </svg>
          <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ml-3 -mt-1"
            style={{ background: name === "alice" ? "#7C5CFF" : "#10B981", whiteSpace: "nowrap" }}>
            {name === "alice" ? "Alice K." : "Bob M."}
          </div>
        </motion.div>
      ))}
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-2 right-2 z-40 px-3 py-2 rounded-xl text-[11px] font-semibold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", maxWidth: 180 }}
          >
            🔔 {notification}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Board columns */}
      <div className="grid grid-cols-4 gap-2 h-full p-2">
        {cols.map((col, ci) => (
          <div key={col.id} className="flex flex-col rounded-xl overflow-hidden" style={{ background: `${colColors[ci]}60` }}>
            <div className="flex items-center gap-1.5 px-2.5 py-2">
              <div className="w-2 h-2 rounded-full" style={{ background: colDot[ci] }} />
              <span className="text-[11px] font-bold text-slate-600">{col.title}</span>
              <span className="ml-auto text-[10px] font-bold text-slate-400 bg-white/60 rounded-full px-1.5">{col.cards.length}</span>
            </div>
            <div className="flex-1 overflow-hidden px-1.5 pb-1.5">
              <AnimatePresence>
                {col.cards.slice(0, 3).map(card => (
                  <LiveBoardCard key={card.id} card={card} isActive={card.id === activeCard} />
                ))}
              </AnimatePresence>
              {newCardCol === col.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mx-2 mt-1"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero( {
  onViewDemo,
}: {
  onViewDemo: () => void;
}) {

  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const phrases = ["Manage Work.", "Collaborate Instantly.", "Built for Modern Teams."];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    if (!deleting && charIdx < phrase.length) {
      const t = setTimeout(() => { setTyped(phrase.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 60);
      return () => clearTimeout(t);
    } else if (!deleting && charIdx === phrase.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => { setTyped(phrase.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 35);
      return () => clearTimeout(t);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx(p => (p + 1) % phrases.length);
    }
  }, [charIdx, deleting, phraseIdx]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, -60]);
  const opacity = useTransform(scrollY, [0, 350], [1, 0]);

  return (
    <motion.section
      id="overview"
      style={{ y, opacity }}
      className="relative min-h-screen pt-24 pb-16 overflow-hidden flex items-center"
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#F8F6FF 0%,#F5F3FF 40%,#F3F7FF 70%,#FFFFFF 100%)" }} />
      <Blob style={{ width: 600, height: 500, top: -100, left: -100 }} color1="rgba(167,139,250,0.3)" color2="rgba(124,92,255,0.1)" />
      <Blob style={{ width: 400, height: 400, bottom: 0, right: -100 }} color1="rgba(199,210,254,0.4)" color2="rgba(167,139,250,0.15)" />
      <ParticleField />

      <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.2)", color: "#7C5CFF" }}
          >
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>✦</motion.span>
            Trusted by 50,000+ teams worldwide
          </motion.div>

          <h1 className="text-5xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-4">
            <span style={{ background: "linear-gradient(135deg,#1e1b4b,#4c1d95)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {typed}
            </span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block ml-1 w-1 rounded-full align-middle"
              style={{ height: "0.85em", background: "#7C5CFF", verticalAlign: "middle" }}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-lg text-slate-500 mb-8 max-w-md leading-relaxed"
          >
            The all-in-one workspace where enterprise teams plan, build, and collaborate — with AI that actually works.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            {/* <MagneticBtn primary>Start for free →</MagneticBtn> */}
            <MagneticBtn
              primary
              onClick={() => navigate("/register")}
            >
              Start for free →
            </MagneticBtn>
            <MagneticBtn onClick={onViewDemo}>▶ Watch demo</MagneticBtn>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {AVATAR_COLORS.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: c }}
                >
                  {AVATARS[i][0]}
                </motion.div>
              ))}
            </div>
            <div>
              <div className="flex text-yellow-400 text-sm">{"★".repeat(5)}</div>
              <p className="text-xs text-slate-500">Loved by <strong>50k+</strong> teams</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — Live Board */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              height: 360,
              boxShadow: "0 40px 100px rgba(124,92,255,0.2), 0 0 0 1px rgba(124,92,255,0.1)",
              background: "rgba(248,246,255,0.9)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Board header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100/60" style={{ background: "rgba(255,255,255,0.8)" }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <span className="text-xs font-semibold text-slate-500 ml-2">Product Roadmap Q1 2025</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["#7C5CFF", "#10B981", "#F59E0B"].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-white text-[8px] font-bold" style={{ background: c }}>
                      {AVATARS[i][0]}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-green-400"
                  />
                  <span className="text-[10px] text-green-600 font-semibold">3 online</span>
                </div>
              </div>
            </div>
            <div className="p-0 h-[calc(100%-48px)]">
              <AnimatedBoard />
            </div>
          </motion.div>

          {/* Floating notification */}
          <motion.div
            animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -left-6 px-3 py-2.5 rounded-2xl text-xs font-semibold shadow-xl"
            style={{ background: "white", border: "1px solid rgba(124,92,255,0.15)", minWidth: 160 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[9px] font-bold">AK</div>
              <div>
                <div className="text-slate-700 font-semibold">Alice commented</div>
                <div className="text-slate-400 text-[10px]">"Looks great! 🚀"</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [4, -4, 4], rotate: [1, -1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-4 px-3 py-2 rounded-2xl text-xs shadow-xl"
            style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", color: "white", minWidth: 130 }}
          >
            <div className="font-bold">Sprint velocity</div>
            <div className="text-2xl font-black">94<span className="text-sm font-normal opacity-80">%</span></div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { label: "Teams using Workivo", value: 50000, suffix: "+" },
    { label: "Tasks completed daily", value: 2400000, suffix: "+" },
    { label: "Uptime guarantee", value: 99, suffix: ".9%" },
    { label: "Countries", value: 140, suffix: "+" },
  ];
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(124,92,255,0.04),rgba(167,139,250,0.08),rgba(124,92,255,0.04))" }} />
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-4xl font-black mb-1" style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="text-sm text-slate-500 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Collaboration Demo ────────────────────────────────────────────────────────
function CollabDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", user: "Alice K.", text: "Just pushed the new design system 🎨", time: "2m", avatar: "#7C5CFF" },
    { id: "m2", user: "Bob M.", text: "Nice! I'll review the components now", time: "1m", avatar: "#10B981" },
  ]);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const newMessages = [
    { user: "Priya R.", text: "Can someone review the PR? @team", time: "now", avatar: "#F59E0B" },
    { user: "Tom N.", text: "On it! Looks great so far 👍", time: "now", avatar: "#EF4444" },
    { user: "Alice K.", text: "Sprint is looking good, all tasks on track ✅", time: "now", avatar: "#7C5CFF" },
  ];
  const [nmIdx, setNmIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const user = ["Bob M.", "Alice K.", "Priya R."][Math.floor(Math.random() * 3)];
      setTyping(true);
      setTypingUser(user);
      setTimeout(() => {
        setTyping(false);
        const nm = newMessages[nmIdx % newMessages.length];
        setMessages(prev => [...prev.slice(-4), { ...nm, id: `m${Date.now()}` }]);
        setNmIdx(p => p + 1);
      }, 1800);
    }, 3500);
    return () => clearInterval(t);
  }, [nmIdx]);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#F5F3FF,#F8F6FF,#F3F7FF)" }} />
      <Blob style={{ width: 500, height: 400, top: 0, right: -100 }} color1="rgba(167,139,250,0.2)" color2="rgba(124,92,255,0.08)" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7C5CFF" }}>Real-time Collaboration</div>
            <h2 className="text-4xl xl:text-5xl font-black text-slate-900 mb-6 leading-tight">
              Work together,<br />
              <span style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in real time.</span>
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              See every change as it happens. Cursor presence, live comments, instant mentions — your team moves at the speed of thought.
            </p>
            <div className="space-y-4">
              {["Live cursor presence for every team member", "Instant comments and @mentions", "Conflict-free simultaneous editing"].map((f, i) => (
                <motion.div key={f} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,92,255,0.1)" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: "#7C5CFF" }} />
                  </div>
                  <span className="text-slate-600 font-medium text-sm">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Chat panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 80px rgba(124,92,255,0.18)", background: "white" }}>
              {/* Channel header */}
              <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>
                  <span className="text-white text-sm">#</span>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">engineering-team</div>
                  <div className="flex items-center gap-1.5">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[11px] text-green-600 font-medium">6 members online</span>
                  </div>
                </div>
                <div className="ml-auto flex -space-x-1.5">
                  {AVATAR_COLORS.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ background: c }}>
                      {AVATARS[i][0]}
                    </div>
                  ))}
                </div>
              </div>
              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[200px]">
                <AnimatePresence>
                  {messages.map(m => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 15, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: m.avatar }}>
                        {m.user[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-800">{m.user}</span>
                          <span className="text-[10px] text-slate-400">{m.time} ago</span>
                        </div>
                        <div className="text-sm text-slate-600 mt-0.5 leading-relaxed">{m.text}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-100">
                      <span className="text-[10px] text-slate-500 mr-1">{typingUser} is typing</span>
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400"
                          animate={{ y: [-2, 2, -2] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              {/* Input */}
              <div className="px-4 pb-4">
                <div className="rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-2 text-sm text-slate-400"
                  style={{ background: "rgba(248,246,255,0.8)" }}>
                  <span>Message #engineering-team</span>
                  <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="ml-auto text-purple-400">|</motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Features Grid ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "⚡", title: "Personal Boards", desc: "Customizable kanban boards for your individual workflow and priorities." },
  { icon: "🤝", title: "Team Workspace", desc: "Shared spaces where entire teams collaborate on projects seamlessly." },
  { icon: "🧠", title: "AI Assistant", desc: "Natural language interface to query your data, summarize tasks, and generate reports." },
  { icon: "📊", title: "Analytics", desc: "Real-time dashboards tracking velocity, completion rates, and team productivity." },
  { icon: "💬", title: "Realtime Chat", desc: "Slack-style messaging with threads, reactions, and file sharing built-in." },
  { icon: "📅", title: "Planner Calendar", desc: "Drag tasks to dates, schedule sprints, and view timelines at a glance." },
  { icon: "🔔", title: "Smart Inbox", desc: "AI-filtered notifications so you always see what matters most." },
  { icon: "🔗", title: "Backend Integration", desc: "Connect your existing stack — GitHub, Jira, Salesforce, and 200+ more." },
  { icon: "🗂️", title: "Knowledge Base", desc: "AI-powered documentation that writes itself from your team's conversations." },
  { icon: "📎", title: "File Attachments", desc: "Drag and drop files directly onto tasks with version history." },
  { icon: "📈", title: "Activity Timeline", desc: "See every change, comment, and update in a beautiful chronological feed." },
  { icon: "🛡️", title: "Enterprise Security", desc: "SOC2 Type II, SSO, granular permissions, and audit logs out of the box." },
];

function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rotateX.set(-y * 12);
    rotateY.set(x * 12);
  };
  const handleLeave = () => { rotateX.set(0); rotateY.set(0); setHovered(false); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: i * 0.05, duration: 0.5 }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d", perspective: 800 }}
      className="relative rounded-2xl p-6 cursor-default"
    >
      {/* Gradient border */}
      <div className="absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg,rgba(124,92,255,0.3),rgba(167,139,250,0.1),rgba(196,181,253,0.2))",
          padding: "1px",
          opacity: hovered ? 1 : 0.5,
        }}
      >
        <div className="w-full h-full rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)" }} />
      </div>

      {hovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%,rgba(124,92,255,0.06),transparent 70%)" }}
        />
      )}

      <div className="relative z-10">
        <motion.div
          animate={hovered ? { y: [-3, 3, -3], scale: 1.1 } : { y: 0, scale: 1 }}
          transition={{ duration: 1.5, repeat: hovered ? Infinity : 0, ease: "easeInOut" }}
          className="text-3xl mb-4"
        >
          {f.icon}
        </motion.div>
        <h3 className="font-bold text-slate-800 mb-2 text-base">{f.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
      </div>
    </motion.div>
  );
}

function FeaturesGrid() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#F8F6FF,#FFFFFF)" }} />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7C5CFF" }}>Everything you need</div>
          <h2 className="text-4xl xl:text-5xl font-black text-slate-900 mb-4">
            One platform,{" "}
            <span style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              infinite possibilities.
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Built for the way modern teams actually work — not how they did a decade ago.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── AI Section ────────────────────────────────────────────────────────────────
type ChatMsg = { role: "user" | "ai"; text: string };
const DEMO_CONVO: ChatMsg[] = [
  { role: "user", text: "Show me the sprint summary for this week" },
  { role: "ai", text: "This week your team completed 23 of 31 tasks (74%). Top performer: Alice K. with 8 completions. 3 blockers identified in the backend integration work — want me to draft a status report?" },
  { role: "user", text: "Draft the status report" },
  { role: "ai", text: "Generating sprint report... ✨ Pulling task data, calculating velocity, and formatting for stakeholder review. Report will be ready in your inbox in 30 seconds." },
];

function AISection() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([DEMO_CONVO[0], DEMO_CONVO[1]]);
  const [thinking, setThinking] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [streamIdx, setStreamIdx] = useState(2);

  useEffect(() => {
    const t = setInterval(() => {
      const nextUser = DEMO_CONVO[streamIdx % DEMO_CONVO.length];
      if (nextUser.role === "user") {
        setMsgs(prev => [...prev, nextUser]);
        setStreamIdx(p => p + 1);
        setThinking(true);
        setTimeout(() => {
          setThinking(false);
          const aiMsg = DEMO_CONVO[(streamIdx + 1) % DEMO_CONVO.length];
          if (aiMsg?.role === "ai") {
            let i = 0;
            const streamText = () => {
              if (i < aiMsg.text.length) {
                setStreamedText(aiMsg.text.slice(0, i + 1));
                i++;
                setTimeout(streamText, 20);
              } else {
                setMsgs(prev => [...prev.slice(-4), { role: "ai", text: aiMsg.text }]);
                setStreamedText("");
                setStreamIdx(p => p + 2);
              }
            };
            streamText();
          }
        }, 1500);
      }
    }, 6000);
    return () => clearInterval(t);
  }, [streamIdx]);

  const suggestions = ["Summarize overdue tasks", "Who's available this week?", "Generate sprint report", "Find blockers"];

  return (
    <section id ="intelligence" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#F5F3FF,#F3F7FF)" }} />
      <Blob style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} color1="rgba(167,139,250,0.15)" color2="rgba(124,92,255,0.05)" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Chat UI */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="rounded-3xl overflow-hidden" style={{
              boxShadow: "0 30px 100px rgba(124,92,255,0.2), 0 0 0 1px rgba(124,92,255,0.1)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
            }}>
              {/* Header */}
              <div className="px-6 py-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  🧠
                </motion.div>
                <div>
                  <div className="font-bold text-white">Workivo AI</div>
                  <div className="text-purple-200 text-xs flex items-center gap-1">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Always available
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[260px]">
                <AnimatePresence>
                  {msgs.slice(-4).map((m, i) => (
                    <motion.div key={`${m.text.slice(0, 10)}-${i}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                          ? "text-white rounded-br-sm"
                          : "text-slate-700 rounded-bl-sm"
                        }`}
                        style={m.role === "user"
                          ? { background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }
                          : { background: "rgba(248,246,255,0.8)", border: "1px solid rgba(124,92,255,0.1)" }
                        }
                      >
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {thinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>
                      <span className="text-white text-xs">AI</span>
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5" style={{ background: "rgba(248,246,255,0.8)", border: "1px solid rgba(124,92,255,0.1)" }}>
                      {[0, 1, 2].map(j => (
                        <motion.div key={j} className="w-2 h-2 rounded-full bg-purple-400"
                          animate={{ y: [-3, 3, -3] }} transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.15 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
                {streamedText && (
                  <div className="flex">
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-slate-700 leading-relaxed"
                      style={{ background: "rgba(248,246,255,0.8)", border: "1px solid rgba(124,92,255,0.1)" }}>
                      {streamedText}
                      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle" />
                    </div>
                  </div>
                )}
              </div>
              {/* Suggestions */}
              <div className="px-5 pb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestions.map(s => (
                    <motion.button key={s} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                      style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.15)" }}>
                      {s}
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200"
                  style={{ background: "rgba(248,246,255,0.6)" }}>
                  <span className="text-sm text-slate-400 flex-1">Ask Workivo AI anything...</span>
                  <motion.div whileHover={{ scale: 1.1 }} className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs cursor-pointer"
                    style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>↑</motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7C5CFF" }}>AI Assistant</div>
            <h2 className="text-4xl xl:text-5xl font-black text-slate-900 mb-6 leading-tight">
              Your smartest<br />
              <span style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                team member.
              </span>
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Workivo AI knows your entire project history, your team's capacity, and your goals — answering questions in plain English and taking action on your behalf.
            </p>
            {["Query tasks in natural language", "Auto-generate reports & summaries", "Predict blockers before they happen", "Integrates with your knowledge base"].map((f, i) => (
              <motion.div key={f} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>✓</div>
                <span className="text-slate-600 font-medium">{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Analytics Section ─────────────────────────────────────────────────────────
function MiniAreaChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 300, h = 80, pad = 8;
  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id={`g-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={areaD} fill={`url(#g-${color.replace("#", "")})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
    </svg>
  );
}

function AnalyticsSection() {
  const [data] = useState([30, 45, 38, 60, 55, 70, 65, 80, 75, 90, 85, 95]);
  const [data2] = useState([20, 35, 28, 45, 40, 60, 55, 65, 60, 72, 68, 78]);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#FFFFFF,#F8F6FF)" }} />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7C5CFF" }}>Analytics</div>
          <h2 className="text-4xl xl:text-5xl font-black text-slate-900 mb-4">
            Data that drives{" "}
            <span style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              decisions.
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 80px rgba(124,92,255,0.12), 0 0 0 1px rgba(124,92,255,0.08)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Tasks Completed", value: 1284, trend: "+12%", color: "#7C5CFF" },
              { label: "Team Velocity", value: 94, suffix: "%", trend: "+8%", color: "#A78BFA" },
              { label: "Active Projects", value: 23, trend: "+3", color: "#8E7BFF" },
              { label: "Avg Cycle Time", value: "2.4", suffix: "d", trend: "-18%", color: "#6D4AE8" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>
                  {typeof s.value === "number" ? <Counter to={s.value} suffix={s.suffix} /> : s.value}{s.suffix || ""}
                </div>
                <div className="text-xs font-semibold text-green-500">{s.trend} vs last sprint</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-bold text-slate-600 mb-2">Task Completion Rate</div>
              <MiniAreaChart data={data} color="#7C5CFF" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-600 mb-2">Team Velocity</div>
              <MiniAreaChart data={data2} color="#A78BFA" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP Engineering, Scale AI", text: "Workivo replaced five tools for us. The AI alone saves our team 4 hours per week per person.", avatar: "#7C5CFF" },
  { name: "Marcus Webb", role: "CTO, Notion (prev.)", text: "The real-time collaboration is the smoothest I've ever used. It feels like magic.", avatar: "#A78BFA" },
  { name: "Priya Nair", role: "Head of Product, Stripe", text: "We onboarded 200 engineers in a single afternoon. The setup experience is incredible.", avatar: "#8E7BFF" },
  { name: "James Park", role: "Founder, LinearApp", text: "Finally a tool that respects your time. No bloat, no setup hell, just pure productivity.", avatar: "#6D4AE8" },
  { name: "Emma Rodriguez", role: "Design Lead, Figma", text: "The design of Workivo itself is a masterclass. Our designers fell in love before anyone else.", avatar: "#C4B5FD" },
  { name: "Alex Kim", role: "Engineering Manager, Vercel", text: "Workivo's API integrations work flawlessly with our CI/CD pipeline. Game changer.", avatar: "#9061F9" },
];

function Testimonials() {
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);
  const cardW = 340;
  const gap = 20;
  const totalW = (cardW + gap) * TESTIMONIALS.length;

  useAnimationFrame((_, delta) => {
    if (!paused) {
      x.set((x.get() - delta * 0.03) % totalW);
    }
  });

  return (
    <section className="py-24 overflow-hidden relative">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#F5F3FF,#F8F6FF)" }} />
      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 px-8">
          <div className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7C5CFF" }}>What teams say</div>
          <h2 className="text-4xl xl:text-5xl font-black text-slate-900">
            Loved by{" "}
            <span style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              world-class teams.
            </span>
          </h2>
        </motion.div>

        <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div style={{ maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)" }}>
            <motion.div className="flex gap-5 py-4" style={{ x, width: totalW * 2 }}>
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <motion.div
                  key={`${t.name}-${i}`}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{ width: cardW, flexShrink: 0 }}
                  className="rounded-2xl p-6 cursor-default"
                >
                  <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderRadius: 16, padding: 24, boxShadow: "0 4px 24px rgba(124,92,255,0.1), 0 0 0 1px rgba(124,92,255,0.08)" }}>
                    <div className="flex text-yellow-400 text-sm mb-4">{"★".repeat(5)}</div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: t.avatar }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                        <div className="text-slate-400 text-xs">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ───────────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#7C5CFF 0%,#8E7BFF 40%,#A78BFA 70%,#C4B5FD 100%)" }} />
      <Blob style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.3 }} color1="rgba(255,255,255,0.3)" color2="transparent" />
      <ParticleField />

      <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="2" y="2" width="14" height="14" rx="4" fill="white" opacity="0.9" />
              <rect x="20" y="2" width="14" height="14" rx="4" fill="white" opacity="0.6" />
              <rect x="2" y="20" width="14" height="14" rx="4" fill="white" opacity="0.6" />
              <rect x="20" y="20" width="14" height="14" rx="4" fill="white" opacity="0.9" />
            </svg>
          </motion.div>

          <h2 className="text-5xl xl:text-6xl font-black text-white mb-6 leading-tight">
            Start building<br />better teams today.
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-xl mx-auto">
            Join 50,000+ teams already using Workivo. Free forever for small teams, powerful enough for enterprise.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {/* <motion.button
              whileHover={{ scale:1.05, y:-2 }}
              whileTap={{ scale:0.97 }}
              className="px-8 py-4 rounded-2xl font-bold text-purple-700 text-sm shadow-xl"
              style={{ background:"white", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}
            >
              Start free — no credit card
            </motion.button> */}
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-bold text-purple-700 text-sm shadow-xl"
              style={{
                background: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
              }}
            >
              Start free — no credit card
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl font-bold text-white text-sm border border-white/30"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
            >
              ▶ View live demo
            </motion.button>
          </div>

          <p className="text-purple-200 text-sm mt-6">14-day enterprise trial · No setup fees · Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate();
  const cols = [
    { title: "Product", links: ["Features", "Integrations", "Changelog", "Roadmap", "Pricing"] },
    { title: "Solutions", links: ["Engineering", "Design", "Marketing", "Product", "Enterprise"] },
    { title: "Resources", links: ["Documentation", "API Reference", "Blog", "Community", "Status"] },
    { title: "Company", links: ["About", "Careers", "Press", "Partners", "Contact"] },
  ];

  return (
    <footer id="contact" className="relative overflow-hidden pt-16 pb-8">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#F5F3FF,#F8F6FF)" }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(124,92,255,0.3),transparent)" }} />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="2" fill="white" opacity="0.9" />
                  <rect x="9" y="1" width="6" height="6" rx="2" fill="white" opacity="0.6" />
                  <rect x="1" y="9" width="6" height="6" rx="2" fill="white" opacity="0.6" />
                  <rect x="9" y="9" width="6" height="6" rx="2" fill="white" opacity="0.9" />
                </svg>
              </div>
              <span className="font-black text-xl" style={{ background: "linear-gradient(135deg,#7C5CFF,#6D4AE8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Workivo</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">The enterprise workspace that teams actually love using.</p>
            <div className="flex gap-3">
              {["𝕏", "in", "▶", "🐙"].map((s, i) => (
                <motion.a key={i} href="#" whileHover={{ scale: 1.15, y: -2 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.1)" }}>
                  {s}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="font-bold text-slate-800 text-sm mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l}>
                    <motion.a href="#" whileHover={{ x: 3, color: "#7C5CFF" }}
                      className="text-sm text-slate-500 transition-colors inline-block">
                      {l}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-purple-100/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2025 Workivo Inc. All rights reserved.</p>
<div className="flex gap-6">
  <motion.button
    onClick={() => navigate("/privacy-policy")}
    whileHover={{ color: "#4C1D95" }}
    className="text-sm font-medium transition-colors"
    style={{ color: "#312E81" }}
  >
    Privacy
  </motion.button>

  <motion.button
    onClick={() => navigate("/terms-of-service")}
    whileHover={{ color: "#4C1D95" }}
    className="text-sm font-medium transition-colors"
    style={{ color: "#312E81" }}
  >
    Terms
  </motion.button>
</div>
        </div>
      </div>
    </footer>
  );
}

// ─── Live Interactive Demo Section ────────────────────────────────────────────
function LiveDemoSection() {
  const [activeTab, setActiveTab] = useState<"board" | "chat" | "planner">("board");
  const tabs = [
    { id: "board" as const, label: "📋 Board View" },
    { id: "chat" as const, label: "💬 Team Chat" },
    { id: "planner" as const, label: "📅 Planner" },
  ];

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const tasks = [
    { day: 0, title: "Design review", color: "#7C5CFF" },
    { day: 1, title: "API docs", color: "#A78BFA" },
    { day: 2, title: "Sprint planning", color: "#8E7BFF" },
    { day: 3, title: "Code review", color: "#6D4AE8" },
    { day: 4, title: "Demo prep", color: "#C4B5FD" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#F3F7FF,#F5F3FF,#F8F6FF)" }} />
      <Blob style={{ width: 500, height: 400, bottom: 0, left: -50 }} color1="rgba(124,92,255,0.1)" color2="rgba(167,139,250,0.05)" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7C5CFF" }}>Interactive Demo</div>
          <h2 className="text-4xl xl:text-5xl font-black text-slate-900 mb-4">
            Try it{" "}
            <span style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              right now.
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">No account needed. Explore the real product experience — live in your browser.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 30px 100px rgba(124,92,255,0.18), 0 0 0 1px rgba(124,92,255,0.1)", background: "white" }}>
          {/* Tab bar */}
          <div className="flex items-center gap-1 p-3 border-b border-slate-100" style={{ background: "rgba(248,246,255,0.8)" }}>
            <div className="flex gap-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
            </div>
            {tabs.map(t => (
              <motion.button key={t.id} onClick={() => setActiveTab(t.id)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={activeTab === t.id
                  ? { background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", color: "white" }
                  : { color: "#64748b" }
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {t.label}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: 480 }}
            >
              {activeTab === "board" && (
                <div style={{ height: "100%" }}>
                  <AnimatedBoard />
                </div>
              )}
              {activeTab === "chat" && (
                <div className="p-6 h-full flex flex-col">
                  <div className="flex-1 space-y-4 overflow-hidden">
                    {[
                      { user: "Alice K.", msg: "Hey team! Sprint demo is scheduled for 3pm today 🎉", avatar: "#7C5CFF", time: "10:24 AM" },
                      { user: "Bob M.", msg: "Perfect timing. The board is looking great!", avatar: "#10B981", time: "10:25 AM" },
                      { user: "Priya R.", msg: "@team I pushed the final changes. All tests passing ✅", avatar: "#F59E0B", time: "10:27 AM" },
                      { user: "Tom N.", msg: "Merging now. Great work everyone 🚀", avatar: "#EF4444", time: "10:28 AM" },
                      { user: "Alice K.", msg: "Let's crush this sprint! 💪", avatar: "#7C5CFF", time: "10:29 AM" },
                    ].map((m, i) => (
                      <motion.div key={m.time} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: m.avatar }}>{m.user[0]}</div>
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-bold text-sm text-slate-800">{m.user}</span>
                            <span className="text-xs text-slate-400">{m.time}</span>
                          </div>
                          <div className="text-sm text-slate-600 px-3 py-2 rounded-2xl inline-block" style={{ background: "rgba(248,246,255,0.8)", border: "1px solid rgba(124,92,255,0.1)" }}>{m.msg}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-400" style={{ background: "rgba(248,246,255,0.6)" }}>
                      Message the team...
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} className="px-4 py-3 rounded-xl text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>Send</motion.button>
                  </div>
                </div>
              )}
              {activeTab === "planner" && (
                <div className="p-6 h-full">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {DAYS.map(d => (
                      <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((_, i) => (
                      <div key={i} className="rounded-xl p-2 min-h-[120px] border border-dashed border-purple-100" style={{ background: "rgba(248,246,255,0.5)" }}>
                        <div className="text-xs font-bold text-slate-400 mb-2">{i + 9}</div>
                        {tasks.filter(t => t.day === i).map(t => (
                          <motion.div key={t.title}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="px-2 py-1.5 rounded-lg text-white text-[10px] font-semibold mb-1 cursor-grab"
                            style={{ background: t.color, boxShadow: `0 2px 8px ${t.color}40` }}
                          >
                            {t.title}
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Team Workspace Section ───────────────────────────────────────────────────
function TeamSection() {
  const members = [
    { name: "Alice Kim", role: "Lead Designer", tasks: 12, done: 9, avatar: "#7C5CFF" },
    { name: "Bob Martinez", role: "Frontend Dev", tasks: 18, done: 14, avatar: "#A78BFA" },
    { name: "Priya Nair", role: "Backend Dev", tasks: 15, done: 11, avatar: "#F59E0B" },
    { name: "Tom Chen", role: "Product Manager", tasks: 8, done: 8, avatar: "#10B981" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#F5F3FF,#F8F6FF)" }} />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Team dashboard */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 80px rgba(124,92,255,0.14)", background: "white" }}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Team Overview</span>
                <div className="flex items-center gap-2">
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-600 font-semibold">Live</span>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {members.map((m, i) => (
                  <motion.div key={m.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="px-5 py-4 flex items-center gap-4 hover:bg-purple-50/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: m.avatar }}>{m.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.role}</div>
                    </div>
                    <div className="w-28">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-bold" style={{ color: m.avatar }}>{Math.round(m.done / m.tasks * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: m.avatar }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.done / m.tasks * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-bold text-slate-800">{m.done}/{m.tasks}</div>
                      <div className="text-xs text-slate-400">tasks</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#7C5CFF" }}>Team Workspace</div>
            <h2 className="text-4xl xl:text-5xl font-black text-slate-900 mb-6 leading-tight">
              Manage your whole<br />
              <span style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                team in one place.
              </span>
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              See who's working on what, track capacity, assign tasks, and ensure nothing falls through the cracks.
            </p>
            {["Live workload visibility across your team", "Smart task auto-assignment based on capacity", "Role-based permissions and access control", "Manager dashboards with burndown charts"].map((f, i) => (
              <motion.div key={f} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#7C5CFF,#A78BFA)" }}>✓</div>
                <span className="text-slate-600 font-medium">{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <div className="relative" style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#F8F6FF" }}>
      <CursorGlow />
      <Navbar />
      <Hero
        onViewDemo={() => setIsDemoOpen(true)}
      />
      <StatsBar />
      <CollabDemo />
      <LiveDemoSection />
      <FeaturesGrid />
      <TeamSection />
      <AISection />
      <AnalyticsSection />
      <Testimonials />
      <CTASection />
      <Footer />
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}