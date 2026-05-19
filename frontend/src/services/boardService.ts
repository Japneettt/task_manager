import { api } from "./api";
 
export type Board = {
  id: string;
  name: string;
  description: string | null;
};
 
export const getBoards = async (): Promise<Board[]> => {
  const res = await api.get("/boards");
  return res.data;
};