from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api.endpoints.users import get_current_user

from app.models.card import Card
from app.models.lists import List
from app.models.user import User

from app.schemas.card import CardCreate, CardRead

from app.utils.helper_function import create_notification

router = APIRouter()


# ✅ CREATE CARD (FIXED 🔥)
@router.post("/lists/{list_id}/cards", response_model=CardRead)
def create_card(
    list_id: UUID,
    data: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ check list exists
    lst = db.query(List).filter(List.id == list_id).first()

    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    # ✅ calculate position
    position = db.query(Card).filter(Card.list_id == list_id).count()

    # ✅ ✅ FIX: convert email → user_id
    assigned_user_id = None
    if data.assigned_to:
        user = db.query(User).filter(User.email == data.assigned_to).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found"
            )
        assigned_user_id = user.id

    # ✅ create card
    card = Card(
        title=data.title,
        description=data.description,
        assigned_to=assigned_user_id,   # ✅ FIXED
        priority=data.priority,
        due_date=data.due_date,
        position=position,
        list_id=list_id,
        board_id=lst.board_id,
    )

    db.add(card)

    # ✅ notification (creator)
    create_notification(
        db,
        message=f"Card '{card.title}' added",
        user_id=current_user.id,
        board_id=lst.board_id
    )

    # ✅ OPTIONAL: notify assigned user
    if assigned_user_id and assigned_user_id != current_user.id:
        create_notification(
            db,
            message=f"You were assigned to '{card.title}'",
            user_id=assigned_user_id,
            board_id=lst.board_id
        )

    db.commit()
    db.refresh(card)

    return card


# ✅ MOVE CARD
@router.patch("/cards/{card_id}/move")
def move_card(
    card_id: UUID,
    list_id: UUID,
    position: int = 0,
    db: Session = Depends(get_db),
):
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # ✅ validate list
    target_list = db.query(List).filter(List.id == list_id).first()

    if not target_list:
        raise HTTPException(status_code=404, detail="Target list not found")

    # ✅ update
    card.list_id = list_id
    card.position = position

    db.commit()
    db.refresh(card)

    return {"message": "Card moved"}
