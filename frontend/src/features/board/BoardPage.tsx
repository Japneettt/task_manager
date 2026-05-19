import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

type Card = {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
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

const STATIC_LISTS = ["Pending", "Progress", "Completed"];

const BoardPage = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [cardForm, setCardForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [newListTitle, setNewListTitle] = useState("");
  const [selectedListId, setSelectedListId] = useState<string>("");
  const { id } = useParams();

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/boards/${id}`);
      const data = res.data;

      let lists = data.lists.map((l: any) => ({
        id: String(l.id),
        title: l.title,
        position: l.position,
        cards: l.cards.map((c: any) => ({
          id: String(c.id),
          title: c.title,
          description: c.description || "",
          due_date: c.due_date || "",
          priority: c.priority || "low",
        })),
      }));

      // ✅ Ensure static lists exist
      await ensureStaticLists(data.id, lists);

      setBoard({
        id: data.id,
        title: data.title,
        lists,
      });
    } catch (err) {
      console.error("Error fetching board", err);
    }
  };

  const ensureStaticLists = async (boardId: string, existingLists: List[]) => {
    const existingTitles = existingLists.map((l) => l.title);

    for (const listTitle of STATIC_LISTS) {
      if (!existingTitles.includes(listTitle)) {
        try {
          await api.post(`/boards/${boardId}/lists`, {
            title: listTitle,
            position: existingLists.length,
          });
        } catch (err) {
          console.error(`Error creating list ${listTitle}:`, err);
        }
      }
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  // ✅ DRAG HANDLER
  const handleDragEnd = async (result: any) => {
    console.log("DRAG RESULT:", result);

    if (!result.destination) return;

    const cardId = result.draggableId;
    const newListId = result.destination.droppableId;

    try {
      await api.patch(`/cards/${cardId}/move`, null, {
        params: {
          list_id: newListId,
          position: result.destination.index,
        },
      });

      fetchBoard();
    } catch (err) {
      console.error("Move failed", err);
    }
  };

  // ✅ HANDLE ADD CARD
  const handleAddCard = async () => {
    if (!cardForm.title.trim() || !selectedListId) {
      alert("Please enter a card title");
      return;
    }

    try {
      await api.post(`/lists/${selectedListId}/cards`, {
        title: cardForm.title,
        description: cardForm.description,
        due_date: cardForm.due_date || null,
        position:
          board?.lists.find((l) => l.id === selectedListId)?.cards.length || 0,
      });

      setCardForm({ title: "", description: "", due_date: "" });
      setShowCardDialog(false);
      fetchBoard();
    } catch (err) {
      console.error("Error adding card", err);
      alert("Failed to add card");
    }
  };

  // ✅ HANDLE ADD LIST
  const handleAddList = async () => {
    if (!newListTitle.trim()) {
      alert("Please enter a list title");
      return;
    }

    try {
      await api.post(`/boards/${board?.id}/lists`, {
        title: newListTitle,
        position: board?.lists.length || 0,
      });

      setNewListTitle("");
      setShowListDialog(false);
      fetchBoard();
    } catch (err) {
      console.error("Error adding list", err);
      alert("Failed to add list");
    }
  };

  const openCardDialog = (listId: string) => {
    setSelectedListId(listId);
    setShowCardDialog(true);
  };

  if (!board) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>{board.title}</h2>

        {/* ✅ ADD LIST BUTTON */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowListDialog(true)}
            style={{
              padding: "8px 16px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + Add List
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "20px" }}>
            {board.lists.map((list) => (
              <Droppable droppableId={String(list.id)} key={list.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: "0 0 320px",
                      background: snapshot.isDraggingOver ? "#f0f0f0" : "#e5e7eb",
                      padding: "15px",
                      borderRadius: "10px",
                      minHeight: "500px",
                    }}
                  >
                    <h4 style={{ marginBottom: "15px", fontWeight: "600" }}>
                      {list.title}
                    </h4>

                    {list.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={String(card.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: snapshot.isDragging
                                ? "#4f46e5"
                                : "#fff",
                              color: snapshot.isDragging ? "#fff" : "#000",
                              padding: "12px",
                              marginBottom: "10px",
                              borderRadius: "8px",
                              userSelect: "none",
                              boxShadow: snapshot.isDragging
                                ? "0 5px 15px rgba(0,0,0,0.3)"
                                : "0 1px 3px rgba(0,0,0,0.1)",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div style={{ fontWeight: "600", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>{card.title}</span>
                              {card.priority && (
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: "999px",
                                    fontSize: "10px",
                                    textTransform: "capitalize",
                                    background:
                                      card.priority === "high"
                                        ? "#fecaca"
                                        : card.priority === "medium"
                                        ? "#fef9c3"
                                        : "#d1fae5",
                                    color:
                                      card.priority === "high"
                                        ? "#b91c1c"
                                        : card.priority === "medium"
                                        ? "#92400e"
                                        : "#047857",
                                  }}
                                >
                                  {card.priority}
                                </span>
                              )}
                            </div>
                            {card.description && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  marginBottom: "4px",
                                  opacity: 0.8,
                                }}
                              >
                                {card.description}
                              </div>
                            )}
                            {card.due_date && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: snapshot.isDragging ? "#fff" : "#666",
                                }}
                              >
                                📅 {new Date(card.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    {/* ✅ ADD CARD BUTTON */}
                    <button
                      onClick={() => openCardDialog(list.id)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#d1d5db",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        marginTop: "10px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      + Add card
                    </button>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* ✅ ADD CARD DIALOG */}
      <Modal show={showCardDialog} onHide={() => setShowCardDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter card title"
                value={cardForm.title}
                onChange={(e) =>
                  setCardForm({ ...cardForm, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter card description"
                value={cardForm.description}
                onChange={(e) =>
                  setCardForm({ ...cardForm, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={cardForm.due_date}
                onChange={(e) =>
                  setCardForm({ ...cardForm, due_date: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCardDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCard}>
            Add Card
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ ADD LIST DIALOG */}
      <Modal show={showListDialog} onHide={() => setShowListDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>List Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter list title"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowListDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddList}>
            Add List
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BoardPage;
