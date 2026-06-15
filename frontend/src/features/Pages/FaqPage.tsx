import { useNavigate } from "react-router-dom";

const FaqPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I create a new board?",
      answer:
        "Go to the Boards section, click Create Board, then give your board a name and description.",
    },
    {
      question: "How can I invite team members?",
      answer:
        "Use the Teams page and Invite Members flow to send invitations by email.",
    },
    {
      question: "Where can I change my password?",
      answer:
        "Open the settings menu in the top-right corner and select Change Password.",
    },
    {
      question: "What should I do if I lose access to my account?",
      answer:
        "Contact support or use account recovery if available. Keep your email address up to date.",
    },
  ];

  return (
    <div className="pageShell">
      <div className="pageHeader">
        <button className="backBtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>FAQ</h2>
      </div>

      <div className="contentCard">
        <p className="helpText">
          Answers to common questions about using TaskFlow.
        </p>

        <div className="faqList">
          {faqs.map((item) => (
            <div key={item.question} className="faqItem">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
      .pageShell {
        padding: 24px;
        background: #f8fafc;
        min-height: 100vh;
      }
      .pageHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .backBtn {
        border: none;
        background: transparent;
        font-size: 14px;
        color: #4f46e5;
        cursor: pointer;
      }
      .contentCard {
        max-width: 760px;
        background: #ffffff;
        border: 1px solid rgba(226,232,240,1);
        border-radius: 24px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
        padding: 28px;
      }
      .helpText {
        color: #475569;
        margin-bottom: 20px;
      }
      .faqList {
        display: grid;
        gap: 18px;
      }
      .faqItem {
        background: #f8fafc;
        border-radius: 18px;
        padding: 18px 20px;
        border: 1px solid rgba(226,232,240,1);
      }
      .faqItem h3 {
        margin: 0 0 10px;
        font-size: 16px;
        color: #0f172a;
      }
      .faqItem p {
        margin: 0;
        color: #475569;
        line-height: 1.7;
      }
      `}</style>
    </div>
  );
};

export default FaqPage;
