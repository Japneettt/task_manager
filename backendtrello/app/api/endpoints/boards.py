from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

# ✅ DB + dependencies
from app.core.database import get_db
from app.api.endpoints.users import get_current_user

# ✅ Models
from app.models.boards import Board
from app.models.lists import List
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="", tags=["Boards"])

@router.post("/")
def create_board(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ create board
    board = Board(
        title=title,
        owner_id=current_user.id
    )

    db.add(board)
    db.commit()
    db.refresh(board)

    # ✅ AUTO CREATE LISTS
    default_lists = ["Pending", "In Progress", "Completed"]

    for index, name in enumerate(default_lists):
        new_list = List(
            title=name,
            position=index,
            board_id=board.id
        )
        db.add(new_list)

    db.commit()

    return board


@router.get("/")
def get_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    boards = db.query(Board).filter(
        Board.owner_id == current_user.id
    ).all()

    return {"boards": boards}

@router.get("/{board_id}")
def get_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ get board
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.owner_id == current_user.id
    ).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    # ✅ get lists
    lists = db.query(List).filter(
        List.board_id == board.id
    ).order_by(List.position).all()

    result = {
        "id": str(board.id),
        "title": board.title,
        "lists": []
    }

    # ✅ attach tasks inside lists
    for l in lists:
        tasks = db.query(Task).filter(
            Task.list_id == l.id
        ).all()

        result["lists"].append({
            "id": str(l.id),
            "title": l.title,
            "position": l.position,
            "cards": [
                {
                    "id": str(t.id),
                    "title": t.title,
                    "assigned_to": str(t.assigned_to) if t.assigned_to else None
                }
                for t in tasks
            ]
        })

    return result

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





