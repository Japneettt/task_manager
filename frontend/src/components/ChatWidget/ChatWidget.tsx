// // src/components/ChatWidget/ChatWidget.tsx
// import React, { useState, useRef, useEffect } from "react";
// // import axios from "axios";
// import { askChatbot } from "../../services/ChatbotService";
// import "./ChatWidget.css";

// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }
// type ChatSize = "small" | "medium" | "large";
// const SIZE_CONFIG: Record<ChatSize, { width: number; height: number; label: string }> = {
//   small: { width: 300, height: 400, label: "S" },
//   medium: { width: 400, height: 500, label: "M" },
//   large: { width: 500, height: 600, label: "L" },
// };
// const ChatWidget: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [size, setSize] = useState<ChatSize>("medium");
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       role: "assistant",
//       content:
//         "Hi! 👋 I'm Workivo Assistant. Ask me anything about how to use Workivo — boards, tasks, teams, and more!",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll to latest message
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!input.trim() || loading) return;

//     const userMessage: Message = { role: "user", content: input };
//     const updatedMessages = [...messages, userMessage];

//     setMessages(updatedMessages);
//     setInput("");
//     setLoading(true);

//     try {
//       // const token = localStorage.getItem("access_token"); 

//       // const response = await axios.post(
//       //   `${import.meta.env.VITE_API_URL}/chatbot/ask`,
//       //   {
//       //     question: input,
//       //     history: messages, // send full conversation history
//       //   },
//       //   {
//       //     headers: {
//       //       Authorization: `Bearer ${token}`,
//       //       "Content-Type": "application/json",
//       //     },
//       //   }
//       // );
//       const response = await askChatbot(input, updatedMessages);

//       const assistantMessage: Message = {
//         role: "assistant",
//         content: response.data.answer,
//       };

//       setMessages([...updatedMessages, assistantMessage]);
//     } catch (error) {
//       setMessages([
//         ...updatedMessages,
//         {
//           role: "assistant",
//           content: "Sorry, I ran into an error. Please try again!",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const clearChat = () => {
//     setMessages([
//       {
//         role: "assistant",
//         content: "Chat cleared! How can I help you with Workivo?",
//       },
//     ]);
//   };
//   const cycleSize=(direction: "up" | "down")=>{
//     const sizes: ChatSize[] = ["small", "medium", "large"];
//     const currentIndex = sizes.indexOf(size);
//     if (direction === "up" && currentIndex < sizes.length - 1) setSize(sizes[currentIndex + 1]);
//     if(direction === "down" && currentIndex > 0) setSize(sizes[currentIndex - 1]);
//   };
//   const { width, height } = SIZE_CONFIG[size];
  

//   return (
//     <div className="chat-widget-container">
//       {/* Floating button */}
//       <button
//         className="chat-toggle-btn"
//         onClick={() => setIsOpen(!isOpen)}
//         aria-label="Toggle chatbot"
//       >
//         {isOpen ? "✕" : "💬"}
//       </button>

//       {/* Chat window */}
//       {isOpen && (
//         <div className="chat-window" style={{ width, height }}>
//           {/* Header */}
//           <div className="chat-header">
//             <div className="chat-header-info">
//               <span className="chat-avatar">🤖</span>
//               <div>
//                 <p className="chat-name">Workivo Assistant</p>
//                 <p className="chat-status">Online · Powered by AI</p>
//               </div>
//             </div>
//             <div className="chat-header-actions">
//               <div className="size-controls">
//                 <button className="size-btn" onClick={() => cycleSize("up")} disabled ={size ==="large"}title="Increase size">
//                   +
//                 </button>
//                 <span className="size-label">{SIZE_CONFIG[size].label}</span>
//                 <button className="size-btn" onClick={() => cycleSize("down")} disabled={size === "small"} title="Decrease size">
//                   -
//                 </button>
//               </div>
//             <button onClick={clearChat} className="clear-btn" title="Clear chat">
//               🗑
//             </button>
//           </div>
//           </div>

//           {/* Messages */}
//           <div className="chat-messages">
//             {messages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`chat-bubble ${
//                   msg.role === "user" ? "user-bubble" : "bot-bubble"
//                 }`}
//               >
//                 {msg.role === "assistant" && (
//                   <span className="bot-icon">🤖</span>
//                 )}
//                 <div className="bubble-text">{msg.content}</div>
//               </div>
//             ))}

//             {loading && (
//               <div className="chat-bubble bot-bubble">
//                 <span className="bot-icon">🤖</span>
//                 <div className="bubble-text typing-dots">
//                   <span></span>
//                   <span></span>
//                   <span></span>
//                 </div>
//               </div>
//             )}

//             <div ref={bottomRef} />
//           </div>

//           {/* Input */}
//           <div className="chat-input-area">
//             <textarea
//               className="chat-input"
//               placeholder="Ask anything about Workivo..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               rows={1}
//             />
//             <button
//               className="send-btn"
//               onClick={sendMessage}
//               disabled={loading || !input.trim()}
//             >
//               ➤
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWidget;
import React, { useState, useRef, useEffect } from "react";
import { askChatbot } from "../../services/ChatbotService";
import "./ChatWidget.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ChatSize = "small" | "medium" | "large";

const SIZE_CONFIG: Record<ChatSize, { width: number; height: number; label: string }> = {
  small:  { width: 300, height: 400, label: "S" },
  medium: { width: 360, height: 520, label: "M" },
  large:  { width: 500, height: 680, label: "L" },
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi! 👋 I'm Workivo Assistant. Ask me anything about how to use Workivo — boards, tasks, teams, and more!",
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [size, setSize]         = useState<ChatSize>("medium");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  // ── Check if user is logged in ──────────────────────────────────
  // const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const [isLoggedIn, setIsLoggedIn] = useState(
  localStorage.getItem("isLoggedIn") === "true"
);

// ✅ re-check when login/logout happens
useEffect(() => {
  const handleLogin = () => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  };

  window.addEventListener("storage", handleLogin); // 👈 important
  window.addEventListener("workivo:login", handleLogin);
  window.addEventListener("workivo:logout", handleLogin);

  return () => {
    window.removeEventListener("storage", handleLogin);
    window.removeEventListener("workivo:login", handleLogin);
    window.removeEventListener("workivo:logout", handleLogin);
  };
}, []);
  // ── Clear chat whenever the logged-in user changes ───────────────
  // We store which user's chat this is. If it changes → wipe messages.
  useEffect(() => {
    const currentUserId = localStorage.getItem("userId"); // store this on login
    const chatOwner     = sessionStorage.getItem("chat_owner");

    if (!currentUserId) {
      // Not logged in — wipe everything
      setMessages([INITIAL_MESSAGE]);
      setIsOpen(false);
      sessionStorage.removeItem("chat_owner");
      return;
    }

    if (chatOwner && chatOwner !== currentUserId) {
      // Different user logged in — clear old chat
      setMessages([INITIAL_MESSAGE]);
      setIsOpen(false);
    }

    // Record which user owns this chat session
    sessionStorage.setItem("chat_owner", currentUserId);
  }, []);

  // ── Listen for logout events ─────────────────────────────────────
  useEffect(() => {
    const handleLogout = () => {
      setMessages([INITIAL_MESSAGE]);
      setIsOpen(false);
      setInput("");
      sessionStorage.removeItem("chat_owner");
    };

    // Custom event fired when user logs out (see logout handler below)
    window.addEventListener("workivo:logout", handleLogout);
    return () => window.removeEventListener("workivo:logout", handleLogout);
  }, []);

  // ── Auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Don't render if not logged in ───────────────────────────────
  if (!isLoggedIn) return null;

  // const sendMessage = async () => {
  //   if (!input.trim() || loading) return;

  //   const userMessage: Message = { role: "user", content: input };
  //   const updatedMessages = [...messages, userMessage];
  //   setMessages(updatedMessages);
  //   setInput("");
  //   setLoading(true);

  //   try {
  //     // const token = localStorage.getItem("token");
  //     const response = await askChatbot(input, messages);
  //     setMessages([...updatedMessages, { role: "assistant", content: response.data.answer }]);
  //   } catch {
  //     setMessages([...updatedMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again!" }]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userMessage: Message = { role: "user", content: input };
  const updatedMessages = [...messages, userMessage];

  setMessages(updatedMessages);
  setInput("");
  setLoading(true);

  try {
    const response = await askChatbot(input, messages); 

    setMessages([
      ...updatedMessages,
      {
        role: "assistant",
        content: response.data.answer,
      },
    ]);
  } catch (err: any) {
    console.error("Chatbot error:", err?.response || err); 

    setMessages([
      ...updatedMessages,
      {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again!",
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const cycleSize = (direction: "up" | "down") => {
    const sizes: ChatSize[] = ["small", "medium", "large"];
    const current = sizes.indexOf(size);
    if (direction === "up" && current < sizes.length - 1) setSize(sizes[current + 1]);
    if (direction === "down" && current > 0) setSize(sizes[current - 1]);
  };

  const { width, height } = SIZE_CONFIG[size];

  return (
    <div className="chat-widget-container">
      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle chatbot">
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="chat-window" style={{ width, height }}>
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-avatar">🤖</span>
              <div>
                <p className="chat-name">Workivo Assistant</p>
                <p className="chat-status">Online · Powered by AI</p>
              </div>
            </div>
            <div className="chat-header-actions">
              <div className="size-controls">
                <button className="size-btn" onClick={() => cycleSize("up")} disabled={size === "large"} title="Increase size">+</button>
                <span className="size-label">{SIZE_CONFIG[size].label}</span>
                <button className="size-btn" onClick={() => cycleSize("down")} disabled={size === "small"} title="Decrease size">−</button>
              </div>
              <button onClick={clearChat} className="clear-btn" title="Clear chat">🗑</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                {msg.role === "assistant" && <span className="bot-icon">🤖</span>}
                <div className="bubble-text">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot-bubble">
                <span className="bot-icon">🤖</span>
                <div className="bubble-text typing-dots"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Ask anything about Workivo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
