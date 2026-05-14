import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import CreateCardModal from "../tasks/CreateCardModal"; // ✅ NEW

type Card = {
  id: string;
  title: string;
  description?: string;
  priority?: string;
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
  const [newListTitle, setNewListTitle] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);

  // ✅ MODAL STATE (NEW)
  const [openModalListId, setOpenModalListId] = useState<string | null>(null);

  const { id } = useParams();

  // ✅ FETCH BOARD
  const fetchBoard = async () => {
    const res = await api.get(`/boards/${id}`);
    const data = res.data;

    setBoard({
      id: data.id,
      title: data.title,
      lists: data.lists.map((l: any) => ({
        id: String(l.id),
        title: l.title,
        position: l.position,
        cards: l.cards.map((c: any) => ({
          id: String(c.id),
          title: c.title,
          description: c.description,
          priority: c.priority,
        })),
      })),
    });
  };

  useEffect(() => {
    if (id) fetchBoard();
  }, [id]);

  // ✅ DRAG
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;

    await api.patch(`/cards/${draggableId}/move`, null, {
      params: {
        list_id: destination.droppableId,
        position: destination.index,
      },
    });

    fetchBoard();
  };

  // ✅ CREATE LIST
  const createList = async () => {
    if (!newListTitle.trim()) return;

    await api.post(`/boards/${id}/lists`, {
      title: newListTitle,
      position: board?.lists.length ?? 0,
    });

    setNewListTitle("");
    setShowNewListInput(false);
    fetchBoard();
  };

  if (!board) return <div>Loading...</div>;

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h3>{board.title}</h3>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: "flex", gap: "16px" }}>
            {board.lists.map((list) => (
              <Droppable droppableId={list.id} key={list.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      width: "260px",
                      background: "#e5e7eb",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <h4>{list.title}</h4>

                    {list.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: "#fff",
                              padding: "10px",
                              marginBottom: "10px",
                              borderRadius: "6px",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <b>{card.title}</b>

                            {/* ✅ NEW DETAILS */}
                            {card.description && (
                              <p style={{ fontSize: "12px" }}>
                                {card.description}
                              </p>
                            )}

                            {card.priority && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#2563eb",
                                }}
                              >
                                {card.priority}
                              </span>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    {/* ✅ ADD CARD BUTTON (NEW MODAL) */}
                    <button
                      onClick={() => setOpenModalListId(list.id)}
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        border: "none",
                        padding: "6px",
                        background: "#dbeafe",
                        cursor: "pointer",
                      }}
                    >
                      + Add Task
                    </button>
                  </div>
                )}
              </Droppable>
            ))}

            {/* ✅ ADD LIST */}
            <div>
              {showNewListInput ? (
                <>
                  <input
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && createList()
                    }
                  />
                  <button onClick={createList}>Add</button>
                </>
              ) : (
                <button onClick={() => setShowNewListInput(true)}>
                  + Add list
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* ✅ MODAL COMPONENT */}
      {openModalListId && (
        <CreateCardModal
          listId={openModalListId}
          onClose={() => setOpenModalListId(null)}
          refresh={fetchBoard}
        />
      )}
    </div>
  );
};

export default BoardPage;
