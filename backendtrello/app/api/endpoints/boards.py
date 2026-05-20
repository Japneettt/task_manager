from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
# ✅ DB + dependencies
from app.core.database import get_db
from app.api.endpoints.users import get_current_user
# ✅ Models
from app.models.boards import Board
from app.models.lists import List
# from app.models.task import Task
from app.models.user import User
from app.models.card import Card

router = APIRouter(prefix="", tags=["Boards"])
from app.schemas.board import BoardCreate, BoardRead

@router.post("/",response_model=BoardRead)
def create_board(
    data: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = Board(
        title=data.title,
        description=data.description,
        owner_id=current_user.id,
        team_id=data.team_id
    )

    db.add(board)
    db.commit()
    db.refresh(board)
    return board
    # return {
    #     "id": str(board.id),
    #     "title": board.title,
    #     "owner_id": str(board.owner_id),
    #     "team_id": str(board.team_id) if board.team_id else None
    # }
# @router.post("/")
# def create_board(
#     title: str,
#     team_id: Optional[UUID] = None,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     # ✅ create board
#     board = Board(
#         title=title,
#         owner_id=current_user.id,
#         team_id=team_id
#     )

#     db.add(board)
#     db.commit()
#     db.refresh(board)

#     return {
#     "id": str(board.id),
#     "title": board.title,
#     "owner_id": str(board.owner_id),
#     "team_id": str(board.team_id) if board.team_id else None
# }


# @router.get("/")
# def get_boards(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     boards = db.query(Board).filter(
#         Board.owner_id == current_user.id
#     ).all()

#     return {"boards": boards}
@router.get("/personal")
def get_personal_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    boards = db.query(Board).filter(
        Board.owner_id == current_user.id,
        Board.team_id == None
    ).all()

    return boards

@router.get("/teams/{team_id}/boards")
def get_team_boards(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.team_member import TeamMember

    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not allowed")

    boards = db.query(Board).filter(
        Board.team_id == team_id
    ).all()

    return boards



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

    # ✅ GET LISTS
    lists = db.query(List).filter(
        List.board_id == board.id
    ).order_by(List.position).all()

    result = {
        "id": str(board.id),
        "title": board.title,
        "lists": []
    }

    # ✅ ADD CARDS
    for l in lists:
        cards = db.query(Card).filter(Card.list_id == l.id).all()

        result["lists"].append({
            "id": str(l.id),
            "title": l.title,
            "position": l.position,
            "cards": [
                {
                    "id": str(c.id),
                    "title": c.title,
                    "assigned_to": str(c.assigned_to) if c.assigned_to else None
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

    # ✅ PERSONAL BOARD
    if board.team_id is None:
        if board.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    # ✅ TEAM BOARD
    else:
        from app.models.team_member import TeamMember

        member = db.query(TeamMember).filter(
            TeamMember.team_id == board.team_id,
            TeamMember.user_id == current_user.id,
            TeamMember.role == "admin"   # ✅ only admin can delete
        ).first()

        if not member:
            raise HTTPException(status_code=403, detail="Not allowed")

    # ✅ DELETE BOARD (outside both conditions)
    db.delete(board)
    db.commit()

    return {"message": "Board deleted"}



