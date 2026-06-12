import { useNavigate } from "react-router-dom";
import { useState } from "react";

const FaqPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      icon: "📋",
      question: "How do I create a new board?",
      answer:
        "Go to the Boards section, click Create Board, then give your board a name and description.",
    },
    {
      icon: "👥",
      question: "How can I invite team members?",
      answer:
        "Use the Teams page and Invite Members flow to send invitations by email.",
    },
    {
      icon: "📅",
      question: "How do I reschedule tasks in planner?",
      answer:
        "Go to the Planner page where you can easily drag and drop tasks or update their due dates to reschedule them.",
    },
    {
      icon: "🔒",
      question: "Where can I change my password?",
      answer:
        "Open the settings menu from your profile in the top-right corner and select Change Password.",
    },
    {
      icon: "⚠️",
      question: "What should I do if I lose access to my account?",
      answer:
        "If you lose access, you can recover your account using your registered secondary email. Go to your profile settings and add a recovery email to ensure quick access recovery, then verify your account through email verification.",
    },
    {
      icon: "📩",
      question: "How can I send a query to the admin?",
      answer:
        "You can go to the Help or Support section and submit your query directly to the admin. Your request will be reviewed and responded to through your registered email.",
    },
    {
      icon: "⚙️",
      question: "How can I manage my profile details?",
      answer:
        "Go to your profile page where you can update your personal details, upload profile picture, and add optional fields like secondary email.",
    },
  ];

  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 style={styles.title}>FAQ</h2>
      </div>

      <div style={styles.container}>

        {/* LEFT PANEL */}
        <div style={styles.left}>

          {/* ✅ BOLD HEADING */}
          <div style={styles.leftHeading}>Frequently Asked Questions</div>

          {/* SEARCH */}
          <input
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          {filteredFaqs.map((item, index) => (
            <div
              key={item.question}
              onClick={() => setSelected(index)}
              style={{
                ...styles.leftItem,
                background:
                  selected === index
                    ? "linear-gradient(135deg,#ede9fe,#e0e7ff)"
                    : "transparent",
              }}
            >
              <div style={styles.leftContent}>
                <span style={styles.icon}>{item.icon}</span>
                <span>{item.question}</span>
              </div>
              <span style={styles.arrow}>›</span>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.right}>
          <h3 style={styles.question}>
            {filteredFaqs[selected]?.question}
          </h3>

          <p style={styles.answer}>
            {filteredFaqs[selected]?.answer}
          </p>

          <div style={styles.helpBox}>
            <span style={styles.helpText}>Was this helpful?</span>

            <div style={styles.helpBtns}>
              <button style={styles.helpBtn}>👍 Yes</button>
              <button style={styles.helpBtn}>👎 No</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FaqPage;


/* ✅ STYLES */
const styles: Record<string, React.CSSProperties> = {

  page: {
    padding: "24px",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #e0e7ff 100%)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#1e1b4b",
  },

  backBtn: {
    background: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#7c3aed",
  },

  container: {
    display: "flex",
    gap: "20px",
    maxWidth: "1100px",
  },

  /* LEFT PANEL */
  left: {
    width: "340px",
    background: "rgba(255,255,255,0.9)",
    borderRadius: "20px",
    padding: "16px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
  },

  /* ✅ BOLD HEADING */
  leftHeading: {
    fontWeight: 700,
    fontSize: "15px",
    marginBottom: "12px",
    color: "#111827",
  },

  search: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    outline: "none",
  },

  leftItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    marginBottom: "6px",
    transition: "all 0.25s ease",
  },

  leftContent: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  icon: {
    fontSize: "16px",
  },

  arrow: {
    color: "#9ca3af",
  },

  /* RIGHT PANEL */
  right: {
    flex: 1,
    background: "rgba(255,255,255,0.95)",
    borderRadius: "20px",
    padding: "24px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
  },

  question: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "12px",
  },

  answer: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.7,
  },

  helpBox: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "space-between",
  },

  helpText: {
    fontSize: "13px",
    color: "#6b7280",
  },

  helpBtns: {
    display: "flex",
    gap: "10px",
  },

  helpBtn: {
    border: "1px solid #e5e7eb",
    background: "white",
    padding: "6px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};