from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.list import List
from app.schemas.list import ListCreate, ListRead

router = APIRouter()

@router.post("/boards/{board_id}/lists", response_model=ListRead)
def create_list(
    board_id: UUID,
    data: ListCreate,
    db: Session = Depends(get_db),
):
    lst = List(
        board_id=board_id,
        title=data.title,
        position=data.position,
    )
    db.add(lst)
    db.commit()
    db.refresh(lst)
    return lst
