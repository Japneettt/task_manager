import { useState } from "react";
import { api } from "../../services/api";

const AddList = ({ boardId, refreshBoard }: any) => {
  const [title, setTitle] = useState("");

  const createList = async () => {
    if (!title) return;

    await api.post(`/boards/${boardId}/lists`, null, {
      params: { title }
    });

    setTitle("");

    const res = await api.get(`/boards/${boardId}`);
    refreshBoard(res.data);
  };

  return (
    <div>
      <input
        placeholder="+ Add list"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={createList}>Add</button>
    </div>
  );
};

export default AddList;