import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import AddList from "../../features/board/AddList";
import AddCard from "../../features/board/AddCard";
import Navbar from "../../components/layout/Navbar";
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");
  const fetchData = async () => {
    try {
      const teamRes = await api.get(`/teams/${id}`);
      setTeam(teamRes.data);

      const boardsRes = await api.get(`/boards/teams/${id}/boards`);
      setBoards(boardsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const createBoard = async () => {
    if (!title) return;

    await api.post("/boards/", {
      title,
      team_id: id
    });

    setTitle("");
    fetchData();
  };
  const addEmail = () => {
    if (!inviteInput) return;
    setInviteEmails([...inviteEmails, inviteInput]);
    setInviteInput("");
  };

  const sendInvite = async () => {
    if (inviteEmails.length === 0) {
      alert("Add at least one email ❗");
      return;
    }

    try {
      await api.post(`/teams/${id}/invite`, {
        emails: inviteEmails,
      });

      alert("Invite sent ✅");

      // ✅ RESET
      setInviteEmails([]);
      setInviteInput("");
      setShowInviteModal(false);

      // ✅ REFRESH TEAM DATA
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed ❌");
    }
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "20px 30px",
      }}
    >
      <Navbar />
      <div style={{ padding: "20px 30px" }}>
        {/* ✅ TEAM HEADER */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* ✅ COVER IMAGE (FIXED) */}
          <div
            style={{
              height: "200px",
              backgroundImage: `url(${team?.image_url
                  ? `http://localhost:8000${team.image_url}`
                  : "https://source.unsplash.com/1200x400/?team,work"
                })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div style={{ padding: "20px 30px" }}>
            <h2 style={{ margin: 0 }}>{team?.name}</h2>
          </div>
        </div>

        {/* ✅ MEMBERS + INVITES */}
        {/* ✅ MEMBERS + INVITES PREMIUM UI */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "25px",
          }}
        >
          {/* ✅ MEMBERS */}
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ margin: 0 }}>Members</h4>

              {/* ✅ ADD MEMBER BUTTON */}
              <button
                onClick={() => setShowInviteModal(true)}
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                + Add
              </button>
            </div>

            {/* LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {team?.members?.map((m: any) => (

                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.6)",
                    transition: "0.25s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(-3px)";
                    el.style.boxShadow = "0 8px 20px rgba(99,102,241,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "none";
                    el.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {m.avatar ? (
                      <img
                        src={`http://localhost:8000/${m.avatar}`}
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span>
                        {m.name
                          ?.split(" ")
                          .map((x: string) => x[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    )}

                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",  // ✅ key change
                        alignItems: "center"
                      }}
                    >
                      {/* LEFT: NAME */}
                      <div style={{ fontWeight: 600 }}>{m.name}</div>

                      {/* RIGHT: ROLE BADGE ✅ */}
                      <div
                        style={{
                          fontSize: "11px",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontWeight: 600,
                          background:
                            m.role === "owner"
                              ? "#fff3cd"
                              : m.role === "admin"
                                ? "#d4edda"
                                : "#e3f2fd",
                          color:
                            m.role === "owner"
                              ? "#85040a"
                              : m.role === "admin"
                                ? "#155724"
                                : "#0d47a1",
                        }}
                      >
                        {m.role?.toUpperCase()}
                      </div>
                    </div>

                    {/* EMAIL BELOW */}
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {m.email}
                    </div>
                  </div>
                </div>

              ))}
            </div>
          </div>

          {/* ✅ INVITES */}
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h4>Pending Invites</h4>
            {team?.invites?.length === 0 && (
              <div
                style={{
                  height: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                {/* ICON */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "10px",
                  }}
                >
                  📩
                </div>

                {/* TEXT */}
                <div style={{ fontWeight: 600, color: "#374151" }}>
                  No pending invites
                </div>

                <div style={{ fontSize: "13px" }}>
                  Invite your team members to collaborate
                </div>
              </div>
            )}

            {/* {team?.invites?.length === 0 && <p>No invites</p>} */}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {team?.invites?.map((i: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.6)",
                  }}
                >
                  {/* ✅ AVATAR PLACEHOLDER */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    📩
                  </div>

                  {/* INFO */}
                  <div>
                    <div style={{ fontWeight: 500 }}>{i.email}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Invitation Pending
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ CREATE BOARD */}
        <div
          style={{
            background: "white",
            marginTop: "25px",
            padding: "20px",
            borderRadius: "14px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h4>Create Board</h4>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board name..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />

            <button
              onClick={createBoard}
              style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none",
                color: "white",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Create
            </button>
          </div>
        </div>

        {/* ✅ BOARDS */}
        <div style={{ marginTop: "30px" }}>
          <h3>Boards</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {boards.map((b) => (
              <div
                key={b.id}
                onClick={async () => {
                  const res = await api.get(`/boards/${b.id}`);
                  setOpenBoard(res.data);
                }}
                style={{
                  padding: "25px",
                  borderRadius: "14px",
                  color: "white",
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
                }}
              >
                <h4>{b.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ BOARD MODAL */}
        {openBoard && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "92%",
                height: "85%",
                background: "#f9fafb",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <h2>{openBoard.title}</h2>
                <button onClick={() => setOpenBoard(null)}>❌</button>
              </div>

              <DragDropContext
                onDragEnd={async (result) => {
                  if (!result.destination) return;

                  await api.patch(`/cards/${result.draggableId}/move`, null, {
                    params: {
                      list_id: result.destination.droppableId,
                      position: result.destination.index,
                    },
                  });

                  const res = await api.get(`/boards/${openBoard.id}`);
                  setOpenBoard(res.data);
                }}
              >
                <div style={{ display: "flex", gap: "20px", overflowX: "auto" }}>
                  {openBoard.lists.map((list: any) => (
                    <Droppable key={list.id} droppableId={list.id.toString()}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}


                          style={{
                            padding: "15px",
                            borderRadius: "16px",
                            minWidth: "260px",

                            // ✅ COLOR LOGIC HERE
                            background:
                              list.title.toLowerCase().includes("todo")
                                ? "#fde8e8"   // red soft
                                : list.title.toLowerCase().includes("progress")
                                  ? "#e0ecff"   // blue soft
                                  : list.title.toLowerCase().includes("done")
                                    ? "#e6f6ec"   // green soft
                                    : "#ffffff",
                          }}

                        >
                          {/* <h4>{list.title}</h4> */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>

                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background:
                                  list.title.toLowerCase().includes("todo")
                                    ? "#ef4444"
                                    : list.title.toLowerCase().includes("progress")
                                      ? "#3b82f6"
                                      : "#16a34a",
                              }}
                            />

                            <h4 style={{ margin: 0 }}>
                              {list.title === "InProgress" ? "In Progress" : list.title}
                            </h4>

                          </div>

                          {list.cards.map((card: any, index: number) => (
                            <Draggable
                              key={card.id}
                              draggableId={card.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  style={{
                                    // background: "#f1f5f9",
                                    background: "white",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    marginBottom: "10px",
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <b>{card.title}</b>

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
      {showInviteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "400px",
              background: "white",
              padding: "25px",
              borderRadius: "14px",
            }}
          >
            <h3>Invite Members 👥</h3>

            {/* INPUT */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <input
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="Enter email"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />

              <button
                onClick={addEmail}
                style={{
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>

            {/* EMAIL LIST */}
            <div style={{ marginTop: "15px" }}>
              {inviteEmails.map((e, i) => (
                <div
                  key={i}
                  style={{
                    background: "#f1f5f9",
                    padding: "8px",
                    borderRadius: "6px",
                    marginBottom: "5px",
                  }}
                >
                  {e}
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={sendInvite}
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
