import { api } from "./api";

export const askChatbot = (question: string, history: any[]) => {
  return api.post("/chatbot/ask", {
    question,
    history,
  });
};