import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { useParams } from "react-router-dom";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

type Card = {
  id: string;
  title: string;
};

type List = {
  id: string;
  title: string;
  position: number;
  cards: Card[];
};

type Board = {
  id: string;
  title: string;
  lists: List[];
};

const BoardPage = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const { id } = useParams();

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/boards/${id}`);
      const data = res.data;

      setBoard({
        id: data.id,
        title: data.title,
        lists: data.lists.map((l: any) => ({
          id: String(l.id), // ✅ IMPORTANT
          title: l.title,
          position: l.position,
          cards: l.cards.map((c: any) => ({
            id: String(c.id), // ✅ IMPORTANT
            title: c.title,
          })),
        })),
      });
    } catch (err) {
      console.error("Error fetching board", err);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  // ✅ DRAG HANDLER
  const handleDragEnd = async (result: any) => {
    console.log("DRAG RESULT:", result); // ✅ debug

    if (!result.destination) return;

    const taskId = result.draggableId;
    const newListId = result.destination.droppableId;

    try {
      // await api.patch(`/tasks/${taskId}/move`, null, {
      //   params: { list_id: newListId },
      // });

      await api.patch(`/cards/${taskId}/move`, null, {
        params: {
          list_id: newListId,
          position: result.destination.index
        }
      })


      fetchBoard(); // ✅ refresh
    } catch (err) {
      console.error("Move failed", err);
    }
  };

  if (!board) return <div>Loading...</div>;

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>

        <h3>{board.title}</h3>

        {/* ✅ ADD LIST INPUT HERE */}
        <input
          placeholder="+ Add list"
          style={{
            marginBottom: "20px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const input = e.target as HTMLInputElement;

              if (!input.value) return;

              await api.post(`/boards/${board.id}/lists`, {
                title: input.value,
                position: board.lists.length,
              });


              input.value = "";
              fetchBoard();
            }
          }}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: "flex", gap: "20px" }}>

            {board.lists.map((list) => (
              <Droppable droppableId={String(list.id)} key={list.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1,
                      background: "#e5e7eb",
                      padding: "10px",
                      borderRadius: "10px",
                      minHeight: "400px",
                    }}
                  >
                    <h4>{list.title}</h4>

                    {list.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={String(card.id)} // ✅ MUST BE STRING
                        index={index} // ✅ REQUIRED
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps} // ✅ REQUIRED
                            style={{
                              background: "#fff",
                              padding: "10px",
                              marginBottom: "10px",
                              borderRadius: "8px",
                              userSelect: "none",
                              ...provided.draggableProps.style,
                            }}
                          >
                            {card.title}
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    {/* ✅ ADD TASK */}
                    <input
                      placeholder="+ Add card"
                      style={{ marginTop: "10px", width: "100%" }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;

                          // await api.post("/tasks", null, {
                          //   params: {
                          //     title: input.value,
                          //     list_id: list.id,
                          //   },
                          // });
                          await api.post(`/lists/${list.id}/cards`, {
                            title: input.value,
                            position: list.cards.length,
                          });

                          input.value = "";
                          fetchBoard();
                        }
                      }}
                    />
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default BoardPage;