# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy import select
# from uuid import UUID
# from app.services.notification_service import create_notification
# from fastapi import Query
# from typing import Optional

# # ✅ DB
# from app.core.database import get_db

# # ✅ Models
# from app.models.card import Card
# from app.models.lists import List

# # ✅ Schemas
# from app.schemas.card import CardCreate, CardRead
# #ADDED TODAY
# from app.websocket.manager import manager
# from app.models.notification import Notification

# router = APIRouter()



# # ✅ CREATE CARD


# @router.post("/lists/{list_id}/cards", response_model=CardRead)
# def create_card(
#     list_id: UUID,
#     db: Session = Depends(get_db),

#     # ✅ support query params
#     title: Optional[str] = Query(None),
#     description: Optional[str] = Query(None),
#     assigned_to: Optional[UUID] = Query(None),
#     due_date: Optional[str] = Query(None),

#     # ✅ also support body (no breaking change)
#     data: CardCreate = None,
# ):
#     # ✅ check list exists
#     lst = db.execute(
#         select(List).where(List.id == list_id)
#     ).scalars().first()

#     if not lst:
#         raise HTTPException(status_code=404, detail="List not found")

#     # ✅ choose source
#     card_title = None
#     card_desc = None
#     card_position = 0

#     if data:
#         card_title = data.title
#         card_desc = data.description
#         card_position = data.position
#     elif title:
#         card_title = title
#         card_desc = description
#     else:
#         raise HTTPException(status_code=400, detail="Title required")

#     card = Card(
#         title=card_title,
#         description=card_desc,
#         position=card_position,
#         list_id=list_id,
#         board_id=lst.board_id,
#         assigned_to=assigned_to,   # ✅ NEW
#         due_date=due_date          # ✅ NEW
#     )

#     db.add(card)
#     db.commit()
#     db.refresh(card)
    
#     if assigned_to:
#        create_notification(
#         db=db,
#         user_id=assigned_to,
#         title="New Task Assigned",
#         message=f"You were assigned: {card.title}",
#         type="assignment",
#         entity_id=card.id
#     )
       
#     return card


# # ✅ GET CARD BY ID
# @router.get("/cards/{card_id}", response_model=CardRead)
# def get_card(
#     card_id: UUID,
#     db: Session = Depends(get_db),
# ):
#     card = db.query(Card).filter(Card.id == card_id).first()

#     if not card:
#         raise HTTPException(status_code=404, detail="Card not found")

#     return card


# # ✅ UPDATE CARD
# @router.patch("/cards/{card_id}", response_model=CardRead)
# def update_card(
#     card_id: UUID,
#     data: CardCreate,
#     db: Session = Depends(get_db),
# ):
#     card = db.query(Card).filter(Card.id == card_id).first()

#     if not card:
#         raise HTTPException(status_code=404, detail="Card not found")

#     # ✅ update fields
#     card.title = data.title
#     card.description = data.description
#     card.position = data.position

#     db.commit()
#     db.refresh(card)

#     return card


# # ✅ DELETE CARD
# @router.delete("/cards/{card_id}")
# def delete_card(
#     card_id: UUID,
#     db: Session = Depends(get_db),
# ):
#     card = db.query(Card).filter(Card.id == card_id).first()

#     if not card:
#         raise HTTPException(status_code=404, detail="Card not found")

#     db.delete(card)
#     db.commit()

#     return {"message": "Card deleted successfully"}


# # ✅ MOVE CARD (drag & drop)
# @router.patch("/cards/{card_id}/move")
# def move_card(
#     card_id: UUID,
#     list_id: UUID,
#     position: int = 0,
#     db: Session = Depends(get_db)
# ):
#     card = db.query(Card).filter(Card.id == card_id).first()

#     if not card:
#         raise HTTPException(status_code=404, detail="Card not found")

#     card.list_id = list_id
#     card.position = position

#     db.commit()
#     db.refresh(card)

#     return {"message": "Card moved"}

# @router.patch("/cards/{card_id}/update-due-date")
# def update_due_date(
#     card_id: UUID,
#     due_date: str,
#     db: Session = Depends(get_db)
# ):
#     card = db.query(Card).filter(Card.id == card_id).first()

#     if not card:
#         raise HTTPException(status_code=404, detail="Card not found")

#     card.due_date = due_date

#     db.commit()
#     db.refresh(card)

#     return {"message": "Due date updated"}

# @router.delete("/cards/{card_id}/complete")
# def complete_card(card_id: UUID, db: Session = Depends(get_db)):
#     card = db.query(Card).filter(Card.id == card_id).first()

#     if not card:
#         raise HTTPException(status_code=404, detail="Card not found")

#     db.delete(card)
#     db.commit()

#     return {"message": "Task completed ✅"}

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import Optional
# import asyncio

# ✅ DB
from app.core.database import get_db

# ✅ Models
from app.models.card import Card
from app.models.lists import List
from app.models.notification import Notification

# ✅ Schemas
from app.schemas.card import CardCreate, CardRead

# # ✅ WebSocket Manager
# from app.websocket.manager import manager

router = APIRouter()


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


# ✅ CREATE CARD
@router.post("/lists/{list_id}/cards", response_model=CardRead)
def create_card(
    list_id: UUID,
    db: Session = Depends(get_db),

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
    elif title:
        card_title = title
        card_desc = description
        card_position = 0
        card_assigned = assigned_to
        card_due_date =due_date
    else:
        raise HTTPException(status_code=400, detail="Title required")

    # ✅ Create card
    card = Card(
        title=card_title,
        description=card_desc,
        position=card_position,
        list_id=list_id,
        board_id=lst.board_id,
        assigned_to=card_assigned,
        due_date=str(card_due_date) if card_due_date else None   # ✅ FIXED
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
    db: Session = Depends(get_db)
):
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.list_id = list_id
    card.position = position

    db.commit()
    db.refresh(card)

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

    return {"message": "Due date updated"}

from datetime import datetime

@router.patch("/cards/{card_id}/complete")
def complete_card(card_id: UUID, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # ✅ mark as completed instead of deleting
    card.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(card)

    return {"message": "Task completed ✅"}
