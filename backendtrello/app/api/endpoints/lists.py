 
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from fastapi import Query
# ✅ DB
from app.core.database import get_db
 
# ✅ Models
from app.models.lists import List
from app.models.boards import Board
 
# ✅ Schemas
from app.schemas.list import ListCreate, ListRead
 
router = APIRouter(prefix="/boards")
 
 
# ✅ CREATE LIST
@router.post("/{board_id}/lists", response_model=ListRead)
def create_list(
    board_id: UUID,
    db: Session = Depends(get_db),
    data: ListCreate = None,   # ✅ optional body
    title: str = Query(None),  # ✅ optional query
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
 
    # ✅ handle both cases
    list_title = None
    position = 0
 
    if data:
        list_title = data.title
        position = data.position
    elif title:
        list_title = title
    else:
        raise HTTPException(status_code=400, detail="Title is required")
 
    # Normalize incoming title to canonical set
    def normalize_title(t: str) -> str:
        if not t:
            return t
        s = t.strip().lower()
        if s in ("pending", "todo", "to do"):
            return "To Do"
        if s in ("progress", "in progress", "doing", "inprogress"):
            return "In Progress"
        if s in ("completed", "done"):
            return "Done"
        return t.strip()

    canonical_title = normalize_title(list_title)

    # Gather existing lists for this board and deduplicate by canonical title
    existing_lists = db.query(List).filter(List.board_id == board_id).all()
    matched = [L for L in existing_lists if normalize_title(L.title).lower() == canonical_title.lower()]

    if matched:
        # If duplicates exist, merge cards into the first and remove extras
        primary = matched[0]
        duplicates = matched[1:]
        if duplicates:
            # Move cards from duplicates to primary
            from app.models.card import Card

            for dup in duplicates:
                cards = db.query(Card).filter(Card.list_id == dup.id).all()
                for c in cards:
                    c.list_id = primary.id
                    db.add(c)
                db.delete(dup)

        # update title/position of primary if needed
        primary.title = canonical_title
        primary.position = position or primary.position
        db.add(primary)
        db.commit()
        db.refresh(primary)
        return primary

    # Create new canonical list
    lst = List(
        board_id=board_id,
        title=canonical_title,
        position=position,
    )

    db.add(lst)
    db.commit()
    db.refresh(lst)

    return lst
# @router.post("/boards/{board_id}/lists", response_model=ListRead)
# @router.post("/{board_id}/lists", response_model=ListRead)
# def create_list(
#     board_id: UUID,
#     data: ListCreate=None,
#     title:str=Query(None),
#     db: Session = Depends(get_db),
# ):
#     # ✅ check board exists
#     board = db.query(Board).filter(Board.id == board_id).first()
#     if not board:
#         raise HTTPException(status_code=404, detail="Board not found")
 
#     lst = List(
#         board_id=board_id,
#         title=data.title,
#         position=data.position,
#     )
 
#     db.add(lst)
#     db.commit()
#     db.refresh(lst)
 
#     return lst
 
 
# ✅ GET ALL LISTS OF A BOARD
@router.get("/boards/{board_id}/lists", response_model=list[ListRead])
def get_lists(
    board_id: UUID,
    db: Session = Depends(get_db),
):
    lists = db.query(List).filter(List.board_id == board_id)\
                          .order_by(List.position).all()
 
    return lists
 
 
# ✅ GET SINGLE LIST
@router.get("/lists/{list_id}", response_model=ListRead)
def get_list(
    list_id: UUID,
    db: Session = Depends(get_db),
):
    lst = db.query(List).filter(List.id == list_id).first()
 
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
 
    return lst
 
 
# ✅ UPDATE LIST
@router.patch("/lists/{list_id}", response_model=ListRead)
def update_list(
    list_id: UUID,
    data: ListCreate,
    db: Session = Depends(get_db),
):
    lst = db.query(List).filter(List.id == list_id).first()
 
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
 
    lst.title = data.title
    lst.position = data.position
 
    db.commit()
    db.refresh(lst)
 
    return lst
 
 
# ✅ DELETE LIST
@router.delete("/lists/{list_id}")
def delete_list(
    list_id: UUID,
    db: Session = Depends(get_db),
):
    lst = db.query(List).filter(List.id == list_id).first()
 
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
 
    db.delete(lst)
    db.commit()
 
    return {"message": "List deleted successfully"}
 
 