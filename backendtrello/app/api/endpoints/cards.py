from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.models.card import Card
from app.models.list import List
from app.schemas.card import CardCreate, CardRead

router = APIRouter()

@router.post("/lists/{list_id}/cards", response_model=CardRead)
def create_card(
    list_id: UUID,
    data: CardCreate,
    db: Session = Depends(get_db),
):
    lst = db.execute(
        select(List).where(List.id == list_id)
    ).scalars().first()

    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    card = Card(
        title=data.title,
        description=data.description,
        position=data.position,
        list_id=list_id,
        board_id=lst.board_id,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card