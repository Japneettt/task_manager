from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID

from app.core.database import get_db
from app.api.endpoints.users import get_current_user

from app.models.boards import Board
from app.models.lists import List
from app.models.card import Card
from app.models.user import User

from app.utils.helper_function import create_notification

router = APIRouter(prefix="", tags=["Boards"])


@router.post("/")
def create_board(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = Board(title=title, owner_id=current_user.id)
    db.add(board)
    db.flush()  # ✅ important (get id before commit)

    # ✅ create lists
    default_lists = ["Pending", "In Progress", "Completed"]

    for index, name in enumerate(default_lists):
        db.add(List(title=name, position=index, board_id=board.id))

    # ✅ notification BEFORE commit
    create_notification(
    db,
    message=f"You created board '{title}'",
    user_id=current_user.id,
    board_id=board.id
)


    db.commit() 
    db.refresh(board)

    return {
        "id": str(board.id),
        "title": board.title,
    }

from sqlalchemy import or_
from app.models.card import Card

# ✅ GET ALL BOARDS (FIXED 🔥)
@router.get("/")
def get_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    boards = db.query(Board).filter(
        or_(
            # ✅ boards created by user
            Board.owner_id == current_user.id,

            # ✅ boards where user is assigned tasks
            Board.id.in_(
                db.query(Card.board_id).filter(
                    Card.assigned_to == current_user.id
                )
            )
        )
    ).all()

    return {
        "boards": [
            {"id": str(b.id), "title": b.title}
            for b in boards
        ]
    }


from sqlalchemy import or_
from app.models.card import Card

# ✅ GET BOARD (FIXED 🔥)
@router.get("/{board_id}")
def get_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = db.query(Board).filter(
        Board.id == board_id,
        or_(
            # ✅ owner
            Board.owner_id == current_user.id,

            # ✅ assigned user access
            Board.id.in_(
                db.query(Card.board_id).filter(
                    Card.assigned_to == current_user.id
                )
            )
        )
    ).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    # ✅ FETCH LISTS
    lists = db.query(List)\
        .filter(List.board_id == board_id)\
        .order_by(List.position)\
        .all()

    result = {
        "id": str(board.id),
        "title": board.title,
        "lists": []
    }

    # ✅ FETCH CARDS
    for l in lists:
        cards = db.query(Card)\
            .filter(Card.list_id == l.id)\
            .order_by(Card.position)\
            .all()

        result["lists"].append({
            "id": str(l.id),
            "title": l.title,
            "position": l.position,
            "cards": [
                {
                    "id": str(c.id),
                    "title": c.title,
                    "description": c.description,   # ✅ added
                    "priority": c.priority,         # ✅ added
                }
                for c in cards
            ]
        })

    return result

# ✅ DELETE BOARD
@router.delete("/{board_id}")
def delete_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.owner_id == current_user.id
    ).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    db.delete(board)
    db.commit()

    return {"message": "Board deleted"}