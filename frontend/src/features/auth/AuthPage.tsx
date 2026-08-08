import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

import workivoLogo from "../../assets/workivo-logo.png";

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ── Feature list (Workivo: boards / lists / teams) ────────────────────────────
const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    title: "Boards That Fit Your Flow",
    desc: "Organize work into To Do, Doing, and Done lists on every board.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Teams & Task Assignment",
    desc: "Build teams, assign tasks, and keep everyone moving in sync.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Enterprise Grade Security",
    desc: "Your data is protected with top-tier security and compliance.",
  },
];

// ── Floating UI card mockups (SVG) ────────────────────────────────────────────
const FloatingCards = () => (
  <div className="tf-mockup">
    {/* Phone frame */}
    <div className="tf-phone">
      <div className="tf-phone-inner">
        <div className="tf-sidebar">
          {[
            <path key="h" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
          ].map((_, i) => (
            <div key={i} className="tf-sidebar-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {i === 0 && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
                {i === 1 && <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>}
                {i === 2 && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
                {i === 3 && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
                {i === 4 && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
              </svg>
            </div>
          ))}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="tf-sidebar-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {i === 1 && <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /></>}
                {i === 2 && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
                {i === 3 && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /></>}
                {i === 4 && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
              </svg>
            </div>
          ))}
        </div>
        <div className="tf-phone-content" />
      </div>
    </div>

    {/* Team Progress card */}
    <div className="tf-card tf-card-top">
      <p className="tf-card-label">Team Progress</p>
      <div className="tf-donut-wrap">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#EDE9FE" strokeWidth="10" />
          <circle cx="32" cy="32" r="26" fill="none" stroke="url(#pg)" strokeWidth="10"
            strokeDasharray={`${0.75 * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
            strokeLinecap="round" transform="rotate(-90 32 32)" />
          <defs>
            <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="tf-donut-label">
          <span className="tf-donut-pct">75%</span>
          <span className="tf-donut-sub">Completed</span>
        </div>
      </div>
    </div>

    {/* Tasks card */}
    <div className="tf-card tf-card-mid">
      <p className="tf-card-label">Tasks</p>
      <div className="tf-task-row"><span className="tf-task-dot tf-dot-gray" /><span className="tf-task-name">To Do</span><span className="tf-task-count">12</span></div>
      <div className="tf-task-row"><span className="tf-task-dot tf-dot-indigo" /><span className="tf-task-name">Doing</span><span className="tf-task-count">8</span></div>
      <div className="tf-task-row"><span className="tf-task-dot tf-dot-green" /><span className="tf-task-name">Done</span><span className="tf-task-count">24</span></div>
    </div>

    {/* Productivity card */}
    <div className="tf-card tf-card-bot">
      <p className="tf-card-label">Productivity</p>
      <p className="tf-card-growth">+15.6%</p>
      <svg viewBox="0 0 120 40" width="120" height="40" style={{ overflow: "visible" }}>
        <polyline points="0,35 20,28 40,30 60,18 80,22 100,12 120,8"
          fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="120" cy="8" r="4" fill="#7C3AED" />
      </svg>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      // localStorage.setItem("refreshToken", res.data.refresh_token); 
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("workivo:login"));
      const userRes =await api.get("users/me");
      localStorage.setItem("userId", userRes.data.id);
      localStorage.setItem("user", JSON.stringify(userRes.data)); // ✅ ADD THIS LINE
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tf-root">
      {/* ── Scoped styles ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          width: 100%;
          height: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .tf-root {
          min-height: 100vh;
          width: 100%;
          background: #F8F7FF;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        /* ── NAV ── */
        .tf-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 40px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(124,58,237,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .tf-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 800;
          color: #1E1B4B;
          letter-spacing: -0.5px;
        }
        .tf-nav-logo-img {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          object-fit: cover;
          display: block;
        }
        .tf-nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6B7280;
          font-size: 14px;
        }
        .tf-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 8px;
          cursor: pointer;
          background: none;
          border: none;
          color: #6B7280;
          font-size: 13px;
          transition: background 0.15s;
        }
        .tf-nav-btn:hover { background: #F3F4F6; }
        .tf-nav-divider { width: 1px; height: 20px; background: #E5E7EB; }

        /* ── LAYOUT ── */
        .tf-body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 480px;
          gap: 0;
          max-width: 1320px;
          margin: 0 auto;
          width: 100%;
          padding: 48px 40px 32px;
          align-items: center;
        }

        /* ── LEFT ── */
        .tf-left { padding-right: 48px; min-width: 0; }

        .tf-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(124,58,237,0.08);
          color: #7C3AED;
          border-radius: 100px;
          padding: 5px 14px 5px 10px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 28px;
        }

        .tf-headline {
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 800;
          color: #1E1B4B;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin-bottom: 6px;
        }
        .tf-headline-accent { color: #7C3AED; display: block; }

        .tf-subtext {
          font-size: 15px;
          color: #6B7280;
          line-height: 1.65;
          margin-bottom: 36px;
          max-width: 380px;
        }

        .tf-features { display: flex; flex-direction: column; gap: 22px; margin-bottom: 40px; min-width: 0; }
        .tf-feature { display: flex; align-items: flex-start; gap: 14px; }
        .tf-feature-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(124,58,237,0.09);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .tf-feature-title { font-size: 14px; font-weight: 700; color: #1E1B4B; margin-bottom: 2px; }
        .tf-feature-desc { font-size: 13px; color: #6B7280; line-height: 1.5; }

        .tf-social-proof {
          display: flex; align-items: center; gap: 16px;
          background: white;
          border-radius: 16px;
          padding: 14px 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          max-width: 320px;
        }
        .tf-avatars { display: flex; }
        .tf-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          border: 2.5px solid white;
          object-fit: cover;
          margin-left: -10px;
          background: linear-gradient(135deg, #7C3AED, #6366F1);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: white;
        }
        .tf-avatar:first-child { margin-left: 0; }
        .tf-proof-text { font-size: 13px; font-weight: 600; color: #1E1B4B; }
        .tf-stars { display: flex; gap: 2px; margin-top: 2px; }

        /* ── MOCKUP ── */
        .tf-mockup {
          position: relative;
          width: 100%;
          height: 440px;
          margin: 0 auto;
        }

        .tf-phone {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 360px;
          background: linear-gradient(160deg, #7C3AED 0%, #6366F1 50%, #8B5CF6 100%);
          border-radius: 28px;
          box-shadow: 0 30px 80px rgba(124,58,237,0.35), 0 0 0 1px rgba(255,255,255,0.15);
          overflow: hidden;
          z-index: 1;
        }
        .tf-phone-inner { display: flex; height: 100%; }
        .tf-sidebar {
          width: 44px;
          background: rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0;
          gap: 12px;
        }
        .tf-sidebar-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .tf-sidebar-icon:hover { background: rgba(255,255,255,0.15); }
        .tf-phone-content { flex: 1; background: rgba(255,255,255,0.06); }

        .tf-card {
          position: absolute;
          background: white;
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          z-index: 10;
        }
        .tf-card-label { font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }

        .tf-card-top { top: 10px; right: -10px; width: 150px; }
        .tf-donut-wrap { display: flex; align-items: center; gap: 10px; }
        .tf-donut-label { display: flex; flex-direction: column; }
        .tf-donut-pct { font-size: 18px; font-weight: 800; color: #1E1B4B; }
        .tf-donut-sub { font-size: 10px; color: #7C3AED; font-weight: 600; }

        .tf-card-mid { top: 50%; left: -20px; transform: translateY(-50%); width: 158px; }
        .tf-task-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .tf-task-row:last-child { margin-bottom: 0; }
        .tf-task-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .tf-dot-gray { background: #9CA3AF; }
        .tf-dot-indigo { background: #6366F1; }
        .tf-dot-green { background: #10B981; }
        .tf-task-name { font-size: 12px; color: #374151; flex: 1; }
        .tf-task-count { font-size: 12px; font-weight: 700; color: #1E1B4B; }

        .tf-card-bot { bottom: 20px; right: -10px; width: 160px; }
        .tf-card-growth { font-size: 14px; font-weight: 700; color: #10B981; margin-bottom: 6px; }

        /* ── RIGHT (form) ── */
        .tf-right {
          background: white;
          border-radius: 24px;
          box-shadow: 0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04);
          padding: 40px 40px 36px;
          border: 1px solid rgba(124,58,237,0.08);
          min-width: 0;
        }

        .tf-form-title { font-size: 24px; font-weight: 800; color: #1E1B4B; margin-bottom: 4px; letter-spacing: -0.5px; }
        .tf-form-sub { font-size: 14px; color: #6B7280; margin-bottom: 28px; }

        .tf-field-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
        .tf-forgot { color: #7C3AED; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; }
        .tf-forgot:hover { text-decoration: underline; }

        .tf-input-wrap { position: relative; margin-bottom: 18px; }
        .tf-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; display: flex; }
        .tf-input-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #9CA3AF; cursor: pointer; display: flex; background: none; border: none; padding: 0; }

        .tf-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          color: #1E1B4B;
          background: #FAFAFA;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .tf-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); background: white; }
        .tf-input::placeholder { color: #9CA3AF; }
        .tf-input-pw { padding-right: 44px; }

        .tf-remember {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 22px;
        }
        .tf-checkbox {
          width: 18px; height: 18px; border-radius: 5px;
          appearance: none; -webkit-appearance: none;
          border: 2px solid #E5E7EB;
          cursor: pointer;
          flex-shrink: 0;
          position: relative;
          transition: background 0.15s, border-color 0.15s;
          background: white;
        }
        .tf-checkbox:checked { background: #7C3AED; border-color: #7C3AED; }
        .tf-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 3px; top: 0px;
          width: 5px; height: 9px;
          border: 2px solid white;
          border-top: none; border-left: none;
          transform: rotate(45deg);
        }
        .tf-remember-label { font-size: 14px; color: #374151; cursor: pointer; }

        .tf-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .tf-btn {
          width: 100%;
          padding: 13px 20px;
          background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%);
          color: white;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          letter-spacing: 0.2px;
          margin-bottom: 20px;
        }
        .tf-btn:hover:not(:disabled) { opacity: 0.93; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,58,237,0.4); }
        .tf-btn:active:not(:disabled) { transform: translateY(0); }
        .tf-btn:disabled { opacity: 0.65; cursor: not-allowed; }

      
        .tf-secure {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 12px; color: #9CA3AF;
        }

        /* ── FOOTER ── */
        .tf-footer {
          text-align: center;
          padding: 20px;
          font-size: 13px;
          color: #9CA3AF;
          border-top: 1px solid #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .tf-footer a { color: #9CA3AF; text-decoration: none; }
        .tf-footer a:hover { color: #7C3AED; }
        .tf-footer-dot { width: 3px; height: 3px; border-radius: 50%; background: #D1D5DB; flex-shrink: 0; }

        /* ── BG BLOBS ── */
        .tf-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .tf-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
        }
        .tf-blob-1 { width: 500px; height: 500px; background: #EDE9FE; top: -100px; left: -100px; }
        .tf-blob-2 { width: 400px; height: 400px; background: #E0E7FF; top: 200px; right: -80px; opacity: 0.35; }
        .tf-blob-3 { width: 300px; height: 300px; background: #FCE7F3; bottom: -60px; left: 30%; opacity: 0.3; }

        @media (max-width: 900px) {
          .tf-body { grid-template-columns: 1fr; padding: 24px 20px; }
          .tf-left { display: none; }
          .tf-right { max-width: 460px; margin: 0 auto; width: 100%; }
        }
      `}</style>

      {/* BG blobs */}
      <div className="tf-bg">
        <div className="tf-blob tf-blob-1" />
        <div className="tf-blob tf-blob-2" />
        <div className="tf-blob tf-blob-3" />
      </div>

      {/* NAV */}
        {/* <nav className="tf-nav" style={{ position: "relative", zIndex: 1 }}>
          <div className="tf-nav-logo">
            <img src={workivoLogo} alt="Workivo" className="tf-nav-logo-img" />
            Workivo
          </div>
        </nav> */}

      {/* BODY */}
      <div className="tf-body" style={{ position: "relative", zIndex: 1 }}>
          {/* LEFT */}
          <div className="tf-left">
            <div className="tf-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              The all-in-one workspace <span style={{ color: "#7C3AED", fontWeight: 700 }}>for teams</span>
            </div>

            <h1 className="tf-headline">
              Plan. Collaborate.<br />Deliver.<br />
              <span className="tf-headline-accent">Together.</span>
            </h1>
            <p className="tf-subtext">
              Workivo helps teams organize work into boards and lists, assign tasks, and track progress together in one connected workspace.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 36 }}>
              <FloatingCards />
              <div className="tf-features">
                {features.map((f) => (
                  <div className="tf-feature" key={f.title}>
                    <div className="tf-feature-icon">{f.icon}</div>
                    <div>
                      <div className="tf-feature-title">{f.title}</div>
                      <div className="tf-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="tf-social-proof">
              <div className="tf-avatars">
                {["JD", "AK", "MP", "SR"].map((init, i) => (
                  <div
                    key={i}
                    className="tf-avatar"
                    style={{
                      background: [
                        "linear-gradient(135deg,#7C3AED,#6366F1)",
                        "linear-gradient(135deg,#6366F1,#8B5CF6)",
                        "linear-gradient(135deg,#8B5CF6,#A78BFA)",
                        "linear-gradient(135deg,#4F46E5,#7C3AED)",
                      ][i],
                    }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="tf-proof-text">10,000+ teams trust Workivo</div>
                <div className="tf-stars">
                  {[1, 2, 3, 4, 5].map((s) => <IconStar key={s} />)}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Login card */}
          <div className="tf-right">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <img src={workivoLogo} alt="Workivo" className="h-10 w-auto object-contain" />

              <div>
                <h2
                  className="tf-form-title"
                  style={{
                    marginBottom: "4px",
                  }}
                >
                  Welcome Back
                </h2>

                <p
                  className="tf-form-sub"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  Log in to your account to continue
                </p>
              </div>
            </div>

            {error && <div className="tf-error">{error}</div>}

            <form onSubmit={handleLogin}>



              {/* Email */}
              <div>
                <label className="tf-field-label">Email address</label>
                <div className="tf-input-wrap">
                  <span className="tf-input-icon"><IconMail /></span>
                  <input
                    className="tf-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="tf-field-label">
                  Password
                  <span className="tf-forgot" onClick={() => { }}>Forgot password?</span>
                </label>
                <div className="tf-input-wrap">
                  <span className="tf-input-icon"><IconLock /></span>
                  <input
                    className={`tf-input tf-input-pw`}
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="tf-input-eye" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="tf-remember">
                <input
                  type="checkbox"
                  className="tf-checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember" className="tf-remember-label">Remember me</label>
              </div>

              {/* Submit */}
              <button type="submit" className="tf-btn" disabled={loading}>
                {loading ? "Logging in…" : "Log In"}
                {!loading && <IconArrow />}
              </button>
            </form>

            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await api.post("/auth/admin/login", {
                    email,
                    password,
                  });

                  localStorage.setItem("token", res.data.access_token);
                  localStorage.setItem("isAdmin", "true");
                  localStorage.setItem("userId", res.data.user.id);

                  navigate("/admin");
                } catch (err: any) {
                  setError(err?.response?.data?.detail || "Admin login failed");
                }
              }}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                fontWeight: 600,
                color: "#fff",
                background: "#3b5998",
                cursor: "pointer",
              }}
            >
              🔐 Login as Admin
            </button>

            {/* Secure */}
            <div className="tf-secure">
              <IconShield />
              Your data is encrypted and secure
            </div>

            {/* Sign up link */}
            <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280", marginTop: 20 }}>
              Don't have an account?{" "}
              <span
                onClick={() => window.location.href = "/register"}
                style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}
              >
                Sign up
              </span>
            </p>
          </div>
        </div>

      {/* FOOTER */}
      <footer className="tf-footer" style={{ position: "relative", zIndex: 1 }}>
        <span>© 2024 Workivo. All rights reserved.</span>
        <div className="tf-footer-dot" />
        <a href="/privacy-policy">Privacy Policy</a>
        <div className="tf-footer-dot" />
        <a href="/terms-of-service">Terms of Service</a>
      </footer>
    </div>
  );
};

export default AuthPage;
