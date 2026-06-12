import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FaqPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I create a team?",
      answer:
        "Go to the Teams page and click on 'Create Team'. Fill in the team name, description, and invite members by email, then save.",
    },
    {
      question: "How can I invite members?",
      answer:
        "Use the Teams page and Invite Members flow to send invitations by email.",
    },
    {
      question: "How can I assign tasks?",
      answer:
        "Inside a board, open a task card and assign members using the assignee option.",
    },
    {
      question: "How do I delete a team?",
      answer:
        "Go to team settings and choose delete. Only owners can delete a team.",
    },
  ];

  const [selected, setSelected] = useState(0);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 style={styles.title}>FAQ</h2>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        
        {/* LEFT PANEL */}
        <div style={styles.left}>
          <h3 style={styles.leftTitle}>Frequently Asked Questions</h3>

          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              style={{
                ...styles.faqItem,
                background:
                  selected === index ? "#eef2ff" : "transparent",
              }}
              onClick={() => setSelected(index)}
            >
              <span>{faq.question}</span>
              <span style={{ color: "#9ca3af" }}>›</span>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.right}>
          <h3 style={styles.question}>{faqs[selected].question}</h3>
          <p style={styles.answer}>{faqs[selected].answer}</p>

          <div style={styles.helpBox}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Was this helpful?
            </span>

            <div style={styles.helpBtns}>
              <button style={styles.helpBtn}>👍</button>
              <button style={styles.helpBtn}>👎</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FaqPage;
const styles: Record<string, React.CSSProperties> = {

  page: {
    padding: 24,
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: 600,
  },

  backBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#4f46e5",
  },

  container: {
    display: "flex",
    gap: 20,
  },

  /* LEFT PANEL */
  left: {
    width: 320,
    background: "white",
    borderRadius: 16,
    padding: 16,
    border: "1px solid #e5e7eb",
  },

  leftTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: "#374151",
  },

  faqItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    color: "#111827",
  },

  /* RIGHT PANEL */
  right: {
    flex: 1,
    background: "white",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e5e7eb",
  },

  question: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
  },

  answer: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.6,
  },

  helpBox: {
    marginTop: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  helpBtns: {
    display: "flex",
    gap: 8,
  },

  helpBtn: {
    border: "1px solid #e5e7eb",
    background: "white",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },
};