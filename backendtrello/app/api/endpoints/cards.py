from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from uuid import UUID
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.models.card import Card
from app.models.lists import List
from app.models.boards import Board
from app.schemas.card import CardCreate, CardRead
from app.services.notification_service import create_notification
from app.api.endpoints.users import get_current_user
from app.models.user import User

router = APIRouter()

# ✅ CREATE CARD
@router.post("/lists/{list_id}/cards", response_model=CardRead)
def create_card(
    list_id: UUID,
    db: Session = Depends(get_db),
    title: Optional[str] = Query(None),
    description: Optional[str] = Query(None),
    assigned_to: Optional[UUID] = Query(None),
    due_date: Optional[str] = Query(None),
    data: Optional[CardCreate] = None,
):

    lst = db.execute(
        select(List).where(List.id == list_id)
    ).scalars().first()

    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    if data:
        card_title = data.title
        card_desc = data.description
        card_position = data.position
        card_due_date = data.due_date or due_date
        assigned_value = data.assigned_to
    elif title:
        card_title = title
        card_desc = description
        card_position = 0
        card_due_date = due_date
        assigned_value = assigned_to
    else:
        raise HTTPException(status_code=400, detail="Title required")

    card_priority = data.priority if data else None

    card = Card(
        title=card_title,
        description=card_desc,
        position=card_position,
        list_id=list_id,
        board_id=lst.board_id,
        assigned_to=assigned_value,
        due_date=card_due_date,
        priority=card_priority,
    )

    db.add(card)
    db.commit()
    db.refresh(card)

    if assigned_value:
        create_notification(
            db=db,
            user_id=assigned_value,
            title="New Task Assigned",
            message=f"You were assigned: {card.title}",
            type="assignment",
            category="personal",
            entity_id=card.id
        )
        db.commit()

    return card


# ✅ UPDATE CARD
@router.patch("/cards/{card_id}", response_model=CardRead)
def update_card(
    card_id: UUID,
    data: CardCreate,
    db: Session = Depends(get_db),
):

    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.title = data.title
    card.description = data.description
    card.position = data.position
    card.due_date = data.due_date

    new_assigned = None

    if data.assigned_to:
        if isinstance(data.assigned_to, str):
            user = db.query(User).filter(User.email == data.assigned_to).first()
            if user:
                new_assigned = user.id
        else:
            new_assigned = data.assigned_to

    if new_assigned:
        card.assigned_to = new_assigned

        create_notification(
            db=db,
            user_id=new_assigned,
            title="Task Assigned",
            message=f"You were assigned: {card.title}",
            type="assignment",
            category="personal",
            entity_id=card.id
        )

    elif data.assigned_to is None:
        card.assigned_to = None

    db.commit()
    db.refresh(card)

    return card


# ✅ MOVE CARD (DRAG & DROP)
@router.patch("/cards/{card_id}/move", response_model=None)
def move_card(
    card_id: UUID,
    list_id: UUID,
    position: int = 0,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.list_id = list_id
    card.position = position

    cards_in_list = db.query(Card).filter(
        Card.list_id == list_id,
        Card.id != card_id
    ).order_by(Card.position).all()

    for idx, c in enumerate(cards_in_list):
        if idx >= position:
            c.position = idx + 1
        else:
            c.position = idx

    new_list = db.query(List).filter(List.id == list_id).first()

    if new_list and new_list.title.lower() == "completed":
        card.completed_at = datetime.utcnow()

        create_notification(
            db=db,
            user_id=current_user.id,
            title="Task Completed",
            message=f"You completed '{card.title}'",
            type="completion",
            category="personal",
            entity_id=card.id
        )

    db.commit()

    return {"message": "Card moved ✅"}


# ✅ TASK SUMMARY (FIXED ✅)
@router.get("/tasks/summary")
def get_tasks_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    board_join = db.query(Card).join(Board, Card.board_id == Board.id)

    pending = board_join.filter(
        or_(
            Board.owner_id == current_user.id,
            Card.assigned_to == current_user.id,
        ),
        Card.completed_at == None
    ).all()

    completed = board_join.filter(
        or_(
            Board.owner_id == current_user.id,
            Card.assigned_to == current_user.id,
        ),
        Card.completed_at != None
    ).all()

    return {
        "pending": pending,
        "completed": completed
    }