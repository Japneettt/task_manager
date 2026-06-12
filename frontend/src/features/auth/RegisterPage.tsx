import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    email: "",


    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    role: "",
  });

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const submit = async () => {
    
// ✅ STEP 1: Required field validation (PUT HERE)
  if (!form.email || !form.first_name || !form.last_name || !form.password) {
    alert("Please fill all required fields");
    return;
  }

    if (!agreedToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    if (form.password !== form.confirm_password) {
      alert("Passwords not matching");
      return;
    }

    try {
      console.log("Sending:", form); // ✅ debug
      await api.post("/auth/register", {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,

        confirm_password: form.confirm_password,  // ✅ ADD THIS
        role: form.role || null,                  // ✅ optional safety

      });

      navigate("/verify", { state: form });
    } catch (err: any) {
      console.log(err.response?.data);
      alert(err?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* ── NAV ── */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="white" />
              <rect x="13" y="3" width="8" height="8" rx="2" fill="white" opacity="0.6" />
              <rect x="3" y="13" width="8" height="8" rx="2" fill="white" opacity="0.6" />
              <rect x="13" y="13" width="8" height="8" rx="2" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span style={styles.logoText}>Workivo</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.navBtn}>🌐 English ▾</button>

        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={styles.main}>
        {/* LEFT */}
        <div style={styles.left}>
          <p style={styles.eyebrow}>✦ The all-in-one workspace <span style={styles.eyebrowAccent}>for teams</span></p>
          <h1 style={styles.headline}>
            Plan. Collaborate.<br />Deliver.<br />
            <span style={styles.headlineAccent}>Together.</span>
          </h1>
          <p style={styles.subtext}>
            Create your account and start managing projects, tasks, and teams all in one place.
          </p>

          <div style={styles.features}>
            {[
              {
                icon: "👥",
                title: "Seamless Collaboration",
                desc: "Work together in real-time and stay aligned.",
              },
              {
                icon: "📊",
                title: "Powerful Analytics",
                desc: "Gain insights and make data-driven decisions.",
              },
              {
                icon: "🛡",
                title: "Enterprise Grade Security",
                desc: "Your data is protected with top-tier security and compliance.",
              },
            ].map((f) => (
              <div key={f.title} style={styles.featureRow}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <div>
                  <div style={styles.featureTitle}>{f.title}</div>
                  <div style={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.socialProof}>
            <div style={styles.avatarStack}>
              {["#c084fc", "#818cf8", "#60a5fa", "#34d399"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.avatar,
                    background: c,
                    marginLeft: i === 0 ? 0 : -10,
                    zIndex: 4 - i,
                  }}
                />
              ))}
            </div>
            <div>
              <div style={styles.socialText}>10,000+ teams trust TaskFlow</div>
              <div style={styles.stars}>★★★★★</div>
            </div>
          </div>
        </div>

        {/* RIGHT – FORM CARD */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create your account 👋</h2>
          <p style={styles.cardSubtitle}>Get started with TaskFlow in less than a minute.</p>

          {/* First + Last */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First name</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  style={styles.input}
                  placeholder="Enter your first name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last name</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  style={styles.input}
                  placeholder="Enter your last name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Work email */}
          <div style={styles.field}>
            <label style={styles.label}>Work email</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>✉️</span>
              <input
                style={styles.input}
                placeholder="Enter your work email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {/* Password strength hints */}
            {form.password.length > 0 && (
              <div style={styles.pwChecks}>
                {[
                  { key: "length", label: "8+ characters" },
                  { key: "uppercase", label: "1 uppercase" },
                  { key: "number", label: "1 number" },
                  { key: "special", label: "1 special character" },
                ].map(({ key, label }) => (
                  <span
                    key={key}
                    style={{
                      ...styles.pwCheck,
                      color: passwordChecks[key as keyof typeof passwordChecks]
                        ? "#22c55e"
                        : "#9ca3af",
                    }}
                  >
                    ✓ {label}
                  </span>
                ))}
              </div>
            )}
            {form.password.length === 0 && (
              <div style={styles.pwChecks}>
                {["8+ characters", "1 uppercase", "1 number", "1 special character"].map((l) => (
                  <span key={l} style={{ ...styles.pwCheck, color: "#22c55e" }}>
                    ✓ {l}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
<div style={styles.field}>
  <label style={styles.label}>Confirm Password</label>
  <div style={styles.inputWrap}>
    <span style={styles.inputIcon}>🔒</span>
    <input
      style={styles.input}
      type={showPassword ? "text" : "password"}
      placeholder="Confirm your password"
      value={form.confirm_password}
      onChange={(e) =>
        setForm({ ...form, confirm_password: e.target.value })
      }
    />
  </div>
</div>

          {/* Role */}
          <div style={styles.field}>
            <label style={styles.label}>I am signing up as</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <select
                style={{ ...styles.input, appearance: "none" as any, cursor: "pointer" }}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="" disabled>Select your role</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Project Manager</option>
                <option value="other">Other</option>
              </select>
              <span style={{ ...styles.eyeBtn, pointerEvents: "none" }}>▾</span>
            </div>
          </div>

          {/* Terms */}
          <div style={styles.termsRow}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={styles.checkbox}
              id="terms"
            />
            <label htmlFor="terms" style={styles.termsText}>
              I agree to the{" "}
              <span style={styles.link}>Terms of Service</span> and{" "}
              <span style={styles.link}>Privacy Policy</span>
            </label>
          </div>

          {/* Submit */}
          <button style={styles.submitBtn} onClick={submit}>
            Create Account <span style={{ marginLeft: 8 }}>→</span>
          </button>

          {/* Social login */}
          <div style={styles.dividerRow}>
            <div style={styles.divider} />
            <span style={styles.dividerText}>or sign up with</span>
            <div style={styles.divider} />
          </div>

          <div style={styles.socialBtns}>
            {[
              {
                name: "Google",
                logo: (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                ),
              },

            ].map((s) => (
              <button key={s.name} style={styles.socialBtn}>
                {s.logo}
                <span style={{ marginLeft: 8 }}>{s.name}</span>
              </button>
            ))}
          </div>

          <p style={styles.loginText}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/")}>
              Log in
            </span>
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span>© 2024 TaskFlow. All rights reserved.</span>
        <span style={styles.footerDot}>·</span>
        <span style={styles.link}>Privacy Policy</span>
        <span style={styles.footerDot}>·</span>
        <span style={styles.link}>Terms of Service</span>
      </footer>
    </div>
  );
};

export default RegisterPage;

/* ─────────────── STYLES ─────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #e0e7ff 100%)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  /* NAV */
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 40px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontWeight: 700,
    fontSize: 20,
    color: "#1e1b4b",
    letterSpacing: "-0.5px",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navBtn: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    color: "#374151",
  },
  navIconBtn: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    width: 34,
    height: 34,
    cursor: "pointer",
    fontSize: 15,
  },

  /* MAIN */
  main: {
    flex: 1,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 60,
    padding: "20px 60px 40px",
    maxWidth: 1200,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box" as any,
  },

  /* LEFT */
  left: {
    flex: 1,
    paddingTop: 20,
    maxWidth: 480,
  },
  eyebrow: {
    fontSize: 13,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  eyebrowAccent: {
    color: "#7c3aed",
    fontWeight: 600,
  },
  headline: {
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.1,
    color: "#111827",
    margin: "0 0 16px",
    letterSpacing: "-1.5px",
  },
  headlineAccent: {
    color: "#7c3aed",
  },
  subtext: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 1.6,
    marginBottom: 32,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginBottom: 36,
  },
  featureRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    background: "rgba(124,58,237,0.1)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  featureTitle: {
    fontWeight: 600,
    fontSize: 14,
    color: "#111827",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  socialProof: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "white",
    borderRadius: 14,
    padding: "14px 20px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    width: "fit-content",
  },
  avatarStack: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "2px solid white",
    position: "relative" as any,
  },
  socialText: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
  },
  stars: {
    color: "#f59e0b",
    fontSize: 13,
    letterSpacing: 1,
  },

  /* CARD */
  card: {
    width: 420,
    background: "white",
    borderRadius: 20,
    padding: "32px 36px",
    boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 6px",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    margin: "0 0 24px",
  },

  /* FORM */
  row: {
    display: "flex",
    gap: 12,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 14,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  inputWrap: {
    position: "relative" as any,
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute" as any,
    left: 12,
    fontSize: 14,
    pointerEvents: "none" as any,
  },
  input: {
    width: "100%",
    padding: "10px 36px 10px 36px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 13,
    color: "#111827",
    outline: "none",
    background: "#fafafa",
    boxSizing: "border-box" as any,
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute" as any,
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    padding: 0,
  },
  pwChecks: {
    display: "flex",
    flexWrap: "wrap" as any,
    gap: "4px 12px",
    marginTop: 6,
  },
  pwCheck: {
    fontSize: 11,
    fontWeight: 500,
  },

  /* TERMS */
  termsRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: "#7c3aed",
    cursor: "pointer",
    flexShrink: 0,
  },
  termsText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 1.4,
  },
  link: {
    color: "#7c3aed",
    cursor: "pointer",
    textDecoration: "none",
  },

  /* SUBMIT */
  submitBtn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 20,
    fontFamily: "inherit",
  },

  /* DIVIDER */
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    background: "#e5e7eb",
  },
  dividerText: {
    fontSize: 12,
    color: "#9ca3af",
    whiteSpace: "nowrap" as any,
  },

  /* SOCIAL BTNS */
  socialBtns: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  socialBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "white",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  loginText: {
    textAlign: "center" as any,
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },

  /* FOOTER */
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: "16px",
    fontSize: 12,
    color: "#9ca3af",
  },
  footerDot: {
    color: "#d1d5db",
  },
};