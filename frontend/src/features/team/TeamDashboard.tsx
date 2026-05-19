import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import AddList from "../board/AddList";
import AddCard from "../board/AddCard";
 
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
 
const TeamDashboard = () => {
  const { id } = useParams();
 
  const [team, setTeam] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [openBoard, setOpenBoard] = useState<any>(null);
 
  const fetchData = async () => {
    const teamRes = await api.get(`/teams/${id}`);
    setTeam(teamRes.data);
 
    const boardsRes = await api.get(`/boards/teams/${id}/boards`);
    setBoards(boardsRes.data.boards || boardsRes.data);
  };
 
  useEffect(() => {
    fetchData();
  }, []);
 
  const createBoard = async () => {
    if (!title.trim()) return;
 
    await api.post("/boards", {
      title,
      description: "",
      team_id: id,
    });
 
    setTitle("");
    await fetchData();
  };
 
  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>{team?.name}</h2>
 
      {/* ✅ MEMBERS */}
      {team && (
        <>
          <h4>Members</h4>
          <div style={{ display: "flex", gap: "10px" }}>
            {team.members?.map((m: any) => (
              <div
                key={m.id}
                style={{
                  background: "#e0e7ff",
                  padding: "8px 12px",
                  borderRadius: "20px"
                }}
              >
                {m.name}
              </div>
            ))}
          </div>
 
          <h4>Pending Invites</h4>
          {team.invites?.map((i: any, index: number) => (
            <div key={index}>📩 {i.email}</div>
          ))}
        </>
      )}
 
      {/* ✅ CREATE BOARD */}
      <h4>Create Board</h4>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board name"
        />
        <button onClick={createBoard}>Create</button>
      </div>
 
      {/* ✅ BOARDS */}
      <h4>Boards</h4>
      <div style={{ display: "flex", gap: "20px" }}>
        {boards.map((b) => (
          <div
            key={b.id}
            onClick={async () => {
              const res = await api.get(`/boards/${b.id}`);
              setOpenBoard(res.data);
            }}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              padding: "20px",
              borderRadius: "10px",
              cursor: "pointer",
              width: "200px",
            }}
          >
            {b.title}
          </div>
        ))}
      </div>
 
      {/* ✅ ✅ ✅ MODAL */}
      {openBoard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              width: "90%",
              height: "80%",
              overflow: "auto",
              borderRadius: "10px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>{team?.name} → {openBoard.title}</h2>
              <button onClick={() => setOpenBoard(null)}>❌</button>
            </div>
 
            {/* ✅ DRAG & DROP */}
            <DragDropContext
              onDragEnd={async (result) => {
                if (!result.destination) return;
 
                await api.patch(`/cards/${result.draggableId}/move`, null, {
                  params: {
                    list_id: result.destination.droppableId,
                    position: result.destination.index
                  }
                });
 
                const res = await api.get(`/boards/${openBoard.id}`);
                setOpenBoard(res.data);
              }}
            >
 
              <div style={{ display: "flex", gap: "20px" }}>
 
                {openBoard.lists.map((list: any) => (
 
                  <Droppable
                    key={list.id}
                    droppableId={list.id.toString()}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          background: "#f4f5f7",
                          padding: "10px",
                          borderRadius: "8px",
                          width: "250px"
                        }}
                      >
                        <h4>{list.title}</h4>
 
                        {/* ✅ CARDS */}
                        {list.cards.map((card: any, index: number) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id.toString()}
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
                                  margin: "8px 0",
                                  borderRadius: "6px",
                                  ...provided.draggableProps.style
                                }}
                              >
                                <div><b>{card.title}</b></div>
 
                                {/* ✅ Show extra data */}
                                {card.description && (
                                  <div style={{ fontSize: "12px" }}>
                                    {card.description}
                                  </div>
                                )}
 
                                {card.due_date && (
                                  <div style={{ fontSize: "12px", color: "red" }}>
                                    📅 {card.due_date}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
 
                        {provided.placeholder}
 
                        {/* ✅ ADD CARD */}
                        <AddCard
                          listId={list.id}
                          boardId={openBoard.id}
                          refreshBoard={setOpenBoard}
                          members={team?.members}
                        />
                      </div>
                    )}
                  </Droppable>
 
                ))}
 
                {/* ✅ ADD LIST */}
                <AddList
                  boardId={openBoard.id}
                  refreshBoard={setOpenBoard}
                />
 
              </div>
            </DragDropContext>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default TeamDashboard;