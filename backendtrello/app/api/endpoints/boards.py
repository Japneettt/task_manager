from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.core.database import get_db
from app.api.endpoints.users import get_current_user

from app.models.boards import Board
from app.models.lists import List
from app.models.user import User
from app.models.card import Card

from app.schemas.board import BoardCreate, BoardRead

router = APIRouter(prefix="", tags=["Boards"])

@router.post("/", response_model=BoardRead)
def create_board(
    data: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = Board(
        title=data.title,
        description=data.description,
        owner_id=current_user.id,
        team_id=getattr(data, "team_id", None),  # ✅ optional
    )

    db.add(board)
    db.commit()
    db.refresh(board)

    # ✅ DEFAULT LISTS
    default_lists = ["Pending", "Progress", "Completed"]

    for index, name in enumerate(default_lists):
        new_list = List(
            title=name,
            position=index,
            board_id=board.id,
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
        Board.owner_id == current_user.id,
        Board.team_id == None   # ✅ IMPORTANT FILTER
    ).all()

    return {
        "boards": [
            {
                "id": str(b.id),
                "title": b.title
            }
            for b in boards
        ]
    }

@router.get("/teams/{team_id}/boards")
def get_team_boards(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.team_member import TeamMember

    # ✅ check membership
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not allowed")

    boards = db.query(Board).filter(
        Board.team_id == team_id
    ).all()

    return {
        "boards": [
            {
                "id": str(b.id),
                "title": b.title
            }
            for b in boards
        ]
    }

@router.get("/{board_id}")
def get_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    # ✅ PERSONAL BOARD ACCESS
    if board.team_id is None:
        if board.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    # ✅ TEAM BOARD ACCESS
    else:
        from app.models.team_member import TeamMember

        member = db.query(TeamMember).filter(
            TeamMember.team_id == board.team_id,
            TeamMember.user_id == current_user.id
        ).first()

        if not member:
            raise HTTPException(status_code=403, detail="Not allowed")

    # ✅ FETCH LISTS
    lists = db.query(List).filter(
        List.board_id == board.id
    ).order_by(List.position).all()

    result = {
        "id": str(board.id),
        "title": board.title,
        "lists": []
    }

    for l in lists:
        cards = db.query(Card).filter(
            Card.list_id == l.id
        ).order_by(Card.position).all()

        result["lists"].append({
            "id": str(l.id),
            "title": l.title,
            "position": l.position,
            "cards": [
                {
                    "id": str(c.id),
                    "title": c.title,
                    "description": c.description,
                    "due_date": c.due_date.isoformat() if c.due_date else None,
                    "priority": c.priority,
                }
                for c in cards
            ]
        })

    return result

@router.delete("/{board_id}")
def delete_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = db.query(Board).filter(Board.id == board_id).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    if board.team_id is None:
        if board.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    else:
        from app.models.team_member import TeamMember

        member = db.query(TeamMember).filter(
            TeamMember.team_id == board.team_id,
            TeamMember.user_id == current_user.id,
            TeamMember.role == "admin"
        ).first()

        if not member:
            raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(board)
    db.commit()

    return {"message": "Board deleted"}

@router.get("/analytics/boards", response_model=None)
def board_stats(
    db = Depends(get_db),
    current_user = Depends(get_current_user),
):

    boards = db.query(Board).all()

    result = []

    for board in boards:
        completed_count = db.query(Card).filter(
            Card.board_id == board.id,
            Card.completed_at != None
        ).count()

        result.append({
            "board_name": board.name,
            "completed": completed_count
        })

    return result
