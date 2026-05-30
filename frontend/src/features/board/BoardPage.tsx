import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import TaskCard from "./TaskCard";
import EditCardModal from "./EditCardModal";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

type Card = {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: string;
  badge?: string | null;
  assigned_to?: string | null;
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

const STATIC_LISTS = ["To Do", "In Progress", "Done"];

const normalizeTitle = (t: string | null | undefined) => {
  if (!t) return t;
  const s = t.trim().toLowerCase();
  if (["pending", "todo", "to do"].includes(s)) return "To Do";
  if (["progress", "in progress", "doing", "inprogress"].includes(s)) return "In Progress";
  if (["completed", "done"].includes(s)) return "Done";
  return t.trim();
};

const BoardPage = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [showEditCardDialog, setShowEditCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardForm, setCardForm] = useState({
    title: "",
    description: "",
    badge: "",
    due_date: "",
    priority: "Medium",
  });
  const [newListTitle, setNewListTitle] = useState("");
  const [selectedListId, setSelectedListId] = useState<string>("");
  const { id } = useParams();

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/boards/${id}`);
      const data = res.data;
      console.log("BOARD RESPONSE:", data);

      let listsRaw = data.lists.map((l: any) => ({
        id: String(l.id),
        title: l.title,
        position: l.position,
        cards: l.cards.map((c: any) => ({
              id: String(c.id),
              title: c.title,
              description: c.description ?? null,
              due_date: c.due_date ?? null,
              priority: c.priority || "Medium",
              badge: c.badge ?? null,
              assigned_to: c.assigned_to ?? null,
            })),
      }));

      // Ensure canonical lists exist on backend (this will also merge duplicates)
      await ensureStaticLists(data.id, listsRaw);

      // Re-fetch lists after ensure to get merged/normalized results
      const fresh = await api.get(`/boards/${id}`);
      const freshLists = fresh.data.lists || [];

      // Build map of canonical title -> list, merging duplicates if any
      const listMap: Record<string, any> = {};
      for (const l of freshLists) {
        const canon = normalizeTitle(l.title) || l.title;
            if (!listMap[canon]) {
          listMap[canon] = {
            id: String(l.id),
            title: canon,
            position: l.position,
            cards: (l.cards || []).map((c: any) => ({
              id: String(c.id),
              title: c.title,
              description: c.description ?? null,
              due_date: c.due_date ?? null,
              priority: c.priority || "Medium",
              badge: c.badge ?? null,
              assigned_to: c.assigned_to ?? null,
            })),
          };
        } else {
          // merge cards
          listMap[canon].cards.push(...(l.cards || []).map((c: any) => ({
            id: String(c.id),
            title: c.title,
            description: c.description ?? null,
            due_date: c.due_date ?? null,
            priority: c.priority || "Medium",
            badge: c.badge ?? null,
            assigned_to: c.assigned_to ?? null,
          })));
        }
      }

      // Ensure order: Pending, In Progress, Completed
      const ordered = STATIC_LISTS.map((t) => listMap[t] || { id: `${t}-empty`, title: t, position: 0, cards: [] });

      setBoard({
        id: data.id,
        title: data.title,
        lists: ordered,
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
        description: cardForm.description || null,
        badge: cardForm.badge || null,
        priority: cardForm.priority || "Medium",
        due_date: cardForm.due_date || null,
        position:
          board?.lists.find((l) => l.id === selectedListId)?.cards.length || 0,
      });

      setCardForm({ title: "", description: "", badge: "", due_date: "", priority: "Medium" });
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

      <div className="board-wrapper" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0 }}>{board.title}</h2>
            <p style={{ margin: "8px 0 0", color: "#64748b" }}>
              Your workboard with 3 fixed columns and live card data.
            </p>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="board-container">
            {board.lists.map((list) => (
              <Droppable droppableId={String(list.id)} key={list.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="list"
                    style={{
                      background:
                        list.title === "To Do"
                          ? "#fef2f2"
                          : list.title === "In Progress"
                          ? "#eff6ff"
                          : "#f0fdf4",
                      padding: "18px",
                      borderRadius: "16px",
                      minHeight: "520px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background:
                            list.title === "To Do"
                              ? "#ef4444"
                              : list.title === "In Progress"
                              ? "#4f46e5"
                              : "#16a34a",
                          display: "inline-block",
                        }}
                      />
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>
                        {list.title}
                      </h4>
                    </div>

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
                          >
                            <TaskCard
                              {...card}
                              isDragging={snapshot.isDragging}
                              boardId={board.id}
                              onEdit={(card) => {
                                setEditingCard(card);
                                setShowEditCardDialog(true);
                              }}
                              onDelete={() => fetchBoard()}
                              onRefresh={fetchBoard}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    <div style={{ marginTop: "auto" }}>
                      <button
                        onClick={() => openCardDialog(list.id)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#e2e8f0",
                          color: "#0f172a",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          marginTop: "18px",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        + Add card
                      </button>
                    </div>
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
              <Form.Label>Badge/Status</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Not Started, On Track, At Risk"
                value={cardForm.badge}
                onChange={(e) =>
                  setCardForm({ ...cardForm, badge: e.target.value })
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
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={cardForm.priority}
                onChange={(e) =>
                  setCardForm({ ...cardForm, priority: e.target.value })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
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

      {/* ✅ EDIT CARD MODAL */}
      <EditCardModal
        card={editingCard}
        show={showEditCardDialog}
        onHide={() => {
          setShowEditCardDialog(false);
          setEditingCard(null);
        }}
        onSave={() => {
          setShowEditCardDialog(false);
          setEditingCard(null);
          fetchBoard();
        }}
      />
    </div>
  );
};

export default BoardPage;
