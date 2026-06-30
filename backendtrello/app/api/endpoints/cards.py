from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from uuid import UUID
from typing import Optional
import asyncio
from app.websocket.manager import manager
# ✅ DB
from app.core.database import get_db
from app.api.endpoints.users import get_current_user
# ✅ Models
from app.models.card import Card
from app.models.lists import List
from app.models.notification import Notification
from app.models.boards import Board
from app.models.team_member import TeamMember
from app.models.user import User
from app.models.team import Team
from app.models.activity_log import ActivityLog
# ✅ Schemas
from app.schemas.card import CardCreate, CardRead
from fastapi import UploadFile, File, Form
from pathlib import Path
import uuid
router = APIRouter()
 
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

CARD_UPLOAD_DIR = BASE_DIR / "uploads" / "task_files"

CARD_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ✅ ADD HERE
async def save_card_file(file: UploadFile):

    extension = Path(file.filename).suffix

    filename = f"{uuid.uuid4().hex}{extension}"

    filepath = CARD_UPLOAD_DIR / filename

    content = await file.read()

    with open(filepath, "wb") as buffer:
        buffer.write(content)

    return {
        "url": f"/uploads/task_files/{filename}",
        "name": file.filename
    }

# ✅ CREATE NOTIFICATION
def create_notification(db, user_id, title, message, entity_id=None):
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        entity_id=entity_id
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    return notif
 
def _status_label(list_title: str) -> str:
    if not list_title:
        return "To Do"
    s = list_title.strip().lower()
    if s in ("done", "completed"):
        return "Completed"
    if s in ("in progress", "progress", "doing", "inprogress"):
        return "In Progress"
    if s in ("review",):
        return "Review"
    return "To Do"
 
 
# ✅ Build a human-readable "who moved what where" message, e.g.:
#   "Priya Sharma moved "Fix UI" card from Sprint Board board in team Design from To Do to Completed"
#   "Priya Sharma moved "Fix UI" card on Sprint Board board from To Do to Completed"   (no team -> personal board)
def _build_move_message(actor: User, card_title: str, board: Optional[Board], team: Optional[Team], from_label: str, to_label: str) -> str:
    actor_name = f"{actor.first_name} {actor.last_name}".strip() if actor else "Someone"
    board_name = board.title if board and board.title else "a board"
 
    if team:
        location = f"from {board_name} board in team {team.name}"
    else:
        location = f"on {board_name} board"
 
    return f'{actor_name} moved "{card_title}" card {location} from {from_label} to {to_label}'
# ✅ CREATE CARD
@router.post("/lists/{list_id}/cards", response_model=CardRead)
def create_card(
    list_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
 
    # ✅ Query params
    title: Optional[str] = Query(None),
    description: Optional[str] = Query(None),
    assigned_to: Optional[UUID] = Query(None),
    due_date: Optional[str] = Query(None),
 
    # ✅ Body input
    data: CardCreate = None,
):
    # ✅ Validate list
    lst = db.execute(
        select(List).where(List.id == list_id)
    ).scalars().first()
 
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
 
    # ✅ Resolve data source
    if data:
        card_title = data.title
        card_desc = data.description
        card_position = data.position
        card_assigned = data.assigned_to
        card_due_date = data.due_date
        card_priority = data.priority
        card_badge = data.badge 
    elif title:
        card_title = title
        card_desc = description
        card_position = 0
        card_assigned = assigned_to
        card_due_date =due_date
        card_priority = "Medium"
        card_badge = None
    else:
        raise HTTPException(status_code=400, detail="Title required")
 
    board = db.query(Board).filter(Board.id == lst.board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    if card_assigned:
        # Personal boards should only assign tasks to the owner.
        if board.team_id is None and card_assigned != current_user.id:
            raise HTTPException(
                status_code=400,
                detail="Cannot assign personal board tasks to a user before acceptance"
            )

        # Team boards should only assign tasks to accepted team members.
        if board.team_id is not None and card_assigned != board.owner_id:
            membership = db.query(TeamMember).filter(
                TeamMember.team_id == board.team_id,
                TeamMember.user_id == card_assigned
            ).first()
            if not membership:
                raise HTTPException(
                    status_code=400,
                    detail="User must be an accepted team member to assign this task"
                )

    # ✅ Create card
    card = Card(
        title=card_title,
        description=card_desc,
        position=card_position,
        list_id=list_id,
        board_id=lst.board_id,
        assigned_to=card_assigned,
        due_date = card_due_date.isoformat() if card_due_date else None,
        # due_date=str(card_due_date) if card_due_date else None ,  # ✅ FIXED
        priority=card_priority,
        badge=card_badge  # ✅ NEW: Add badge
    )
    print("FINAL DATA →", {
    "title": card_title,
    "assigned_to": card_assigned,
    "due_date": card_due_date
})
 
    db.add(card)
    db.commit()
    db.refresh(card)
 
    # ✅ SEND REALTIME NOTIFICATION
    # if assigned_to:
    if card_assigned:
        notif = create_notification(
            db=db,
            user_id=card_assigned,
            title="Task Assigned",
            message=f"You were assigned: {card.title}",
            entity_id=card.id
        )
 
        # asyncio.create_task(
        #     manager.send(
        #         str(assigned_to),
        #         {
        #             "type": "activity",
        #             "payload": {
        #                 "title": notif.title,
        #                 "message": notif.message,
        #                 "created_at": notif.created_at.isoformat()
        #             }
        #         }
        #     )
        # )
 
    return card
 
 
# ✅ GET CARD
@router.get("/cards/{card_id}", response_model=CardRead)
def get_card(card_id: UUID, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
 
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
 
    return card
 
 
# ✅ UPDATE CARD
@router.patch("/cards/{card_id}", response_model=CardRead)
def update_card(card_id: UUID, data: CardCreate, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
 
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
 
    card.title = data.title
    card.description = data.description
    card.position = data.position
    card.priority = data.priority
    card.badge = data.badge  # ✅ NEW: Update badge
    card.due_date = data.due_date.isoformat() if data.due_date else None
    # card.due_date = data.due_date
    
        # Handle assigned_to if provided
    if data.assigned_to:
        if isinstance(data.assigned_to, str):
            user = db.query(User).filter(User.email == data.assigned_to).first()
            if user:
                card.assigned_to = user.id
        else:
            card.assigned_to = data.assigned_to
 
 
    db.commit()
    db.refresh(card)
 
    return card
 
 
# ✅ DELETE CARD
@router.delete("/cards/{card_id}")
def delete_card(card_id: UUID, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
 
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
 
    db.delete(card)
    db.commit()
 
    return {"message": "Card deleted successfully"}
 
 
# ✅ MOVE CARD
@router.patch("/cards/{card_id}/move")
def move_card(
    card_id: UUID,
    list_id: UUID,
    position: int = 0,
    db: Session = Depends(get_db),
    current_user: User=Depends(get_current_user),
):
    card = db.query(Card).filter(Card.id == card_id).first()
 
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    old_list = db.query(List).filter(List.id == card.list_id).first()
    new_list = db.query(List).filter(List.id == list_id).first()
 
    card.list_id = list_id
    card.position = position
    # ✅ auto-complete / un-complete based on destination list
    new_title = (new_list.title or "").strip().lower() if new_list else ""
    if new_title in ("done", "completed"):
        if not card.completed_at:
            card.completed_at = datetime.now(timezone.utc)
    else:
        # moved OUT of Done/Completed back into another column -> reopen it
        card.completed_at = None
 
    db.commit()
    db.refresh(card)
    from_label = _status_label(old_list.title if old_list else "")
    to_label = _status_label(new_list.title if new_list else "")
 
    # ✅ log the move for the Recent Activity feed
    db.add(ActivityLog(
        board_id=card.board_id,
        card_id=card.id,
        actor_id=current_user.id,
        card_title=card.title,
        from_status=from_label,
        to_status=to_label,
    ))
    db.commit()
    # Notify relevant users about the move (assigned user and board owner)
    try:
        board = db.query(Board).filter(Board.id == card.board_id).first()
        team = db.query(Team).filter(Team.id == board.team_id).first() if board and board.team_id else None
        
        recipients = set()
        if card.assigned_to:
            recipients.add(str(card.assigned_to))
        if board and board.owner_id:
            recipients.add(str(board.owner_id))
        # If this is a team board, notify all team members
        if board and board.team_id:
            members = db.query(TeamMember).filter(TeamMember.team_id == board.team_id).all()
            for m in members:
                recipients.add(str(m.user_id))
                
        recipients.discard(str(current_user.id))
        message = _build_move_message(current_user, card.title, board, team, from_label, to_label)
        for user_id in recipients:
            create_notification(
                db=db,
                user_id=UUID(user_id),
                title="Card Moved",
                message=message,
                entity_id=card.id,
            )
        payload = {
            "type": "card_moved",
            "payload": {
                "card_id": str(card.id),
                "board_id": str(card.board_id),
                "list_id": str(card.list_id),
                "position": card.position,
                "message": message,
            },
        }

        for user_id in recipients:
            # fire-and-forget
            asyncio.create_task(manager.send_to_user(user_id, payload))
    except Exception:
        pass

    return {"message": "Card moved"}
 
 
# ✅ UPDATE DUE DATE
@router.patch("/cards/{card_id}/update-due-date")
def update_due_date(card_id: UUID, due_date: str, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
 
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
 
    card.due_date = due_date
 
    db.commit()
    db.refresh(card)

    # Notify relevant users that card was updated
    try:
        board = db.query(Board).filter(Board.id == card.board_id).first()
        recipients = set()
        if card.assigned_to:
            recipients.add(str(card.assigned_to))
        if board and board.owner_id:
            recipients.add(str(board.owner_id))
        if board and board.team_id:
            members = db.query(TeamMember).filter(TeamMember.team_id == board.team_id).all()
            for m in members:
                recipients.add(str(m.user_id))

        payload = {"type": "card_updated", "payload": {"card_id": str(card.id), "board_id": str(card.board_id)}}
        for user_id in recipients:
            asyncio.create_task(manager.send_to_user(user_id, payload))
    except Exception:
        pass

    return {"message": "Due date updated"}
 
from app.models.lists import List

@router.patch("/cards/{card_id}/complete")
def complete_card(card_id: UUID, db: Session = Depends(get_db),current_user:User=Depends(get_current_user)):
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    old_list=db.query(List).filter(List.id==card.list_id).first()
    # ✅ mark as completed
    card.completed_at = datetime.utcnow()

    # ✅ ✅ MOVE CARD TO DONE LIST (MAIN FIX)
    done_list = db.query(List).filter(
        List.board_id == card.board_id,
        func.lower(List.title).in_(["done", "completed"])
    ).first()

    if done_list:
        card.list_id = done_list.id   # ✅ THIS FIXES EVERYTHING

    db.commit()
    db.refresh(card)
    # ✅ log it too, so it shows up consistently in Recent Activity
    db.add(ActivityLog(
        board_id=card.board_id,
        card_id=card.id,
        actor_id=current_user.id,
        card_title=card.title,
        from_status=_status_label(old_list.title if old_list else ""),
        to_status="Completed",
    ))
    db.commit()

    return {"message": "Task completed ✅"}


@router.post("/cards/{card_id}/upload")
async def upload_card_file(
    card_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    card = db.query(Card).filter(
        Card.id == card_id
    ).first()

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    uploaded = await save_card_file(file)

    card.attachment_url = uploaded["url"]
    card.attachment_name = uploaded["name"]

    db.commit()

    return {
        "message": "File uploaded",
        "attachment_url": uploaded["url"]
    }
# @router.patch("/cards/{card_id}/complete")
# def complete_card(card_id: UUID, db: Session = Depends(get_db)):
#     card = db.query(Card).filter(Card.id == card_id).first()
 
#     if not card:
#         raise HTTPException(status_code=404, detail="Card not found")
 
#     # ✅ mark as completed instead of deleting
#     card.completed_at = datetime.utcnow()
 
#     db.commit()
#     db.refresh(card)

#     # Notify relevant users so dashboards/planner refresh
#     try:
#         board = db.query(Board).filter(Board.id == card.board_id).first()
#         recipients = set()
#         if card.assigned_to:
#             recipients.add(str(card.assigned_to))
#         if board and board.owner_id:
#             recipients.add(str(board.owner_id))
#         if board and board.team_id:
#             members = db.query(TeamMember).filter(TeamMember.team_id == board.team_id).all()
#             for m in members:
#                 recipients.add(str(m.user_id))

#         payload = {"type": "card_completed", "payload": {"card_id": str(card.id), "board_id": str(card.board_id)}}
#         for user_id in recipients:
#             asyncio.create_task(manager.send_to_user(user_id, payload))
#     except Exception:
#         pass

#     return {"message": "Task completed ✅"}
 
 