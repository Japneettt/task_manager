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

router = APIRouter(prefix="/boards", tags=["Boards"])
from app.schemas.board import BoardCreate, BoardRead

#added 24
def serialize_board(board: Board, owner: User):
    return {
        "id": str(board.id),
        "title": board.title,
        "description": board.description,
        "created_at": board.created_at,
        "owner_id": str(owner.id),
        "owner_name": f"{owner.first_name} {owner.last_name}",
        "owner_email": owner.email,
        "team_id": str(board.team_id) if board.team_id else None,
        "archived": board.archived,
    }
    
    
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
    
    # ✅ ✅ CREATE DEFAULT LISTS
    default_lists = ["ToDo", "InProgress", "Done"]

    for index, name in enumerate(default_lists):
        lst = List(
            title=name,
            board_id=board.id,
            position=index
        )
        db.add(lst)

    db.commit()

    return board

@router.get("/personal")
def get_personal_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # boards = db.query(Board).filter(
    #     Board.owner_id == current_user.id,
    #     Board.team_id == None,
    #     Board.archived == False
    # ).all()
    
    rows = db.query(Board, User).join(User, Board.owner_id == User.id).filter(
        Board.owner_id == current_user.id,
        Board.team_id == None,
        Board.archived == False
    ).all()


    # return boards
    #added 24
    return [serialize_board(board, owner) for board, owner in rows]

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

    # boards = db.query(Board).filter(
    #     Board.team_id == team_id
    # ).all()

    # return boards
    #added 24
    rows = db.query(Board, User).join(User, Board.owner_id == User.id).filter(
        Board.team_id == team_id
    ).all()
 
    return [serialize_board(board, owner) for board, owner in rows]
 

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

@router.patch("/{board_id}/archive")
def archive_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    board = db.query(Board).filter(Board.id == board_id).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    if board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    board.archived = True
    db.commit()

    return {"message": "Board archived"}

@router.patch("/{board_id}/restore")
def restore_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    board = db.query(Board).filter(Board.id == board_id).first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    if board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    board.archived = False

    db.commit()

    return {"message": "Board restored"}
@router.get("/archived")
def get_archived_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # boards = db.query(Board).filter(
    #     Board.owner_id == current_user.id,
    #     Board.archived == True
    # ).all()

    # return boards
    #added 24
    rows = db.query(Board, User).join(User, Board.owner_id == User.id).filter(
        Board.owner_id == current_user.id,
        Board.archived == True
    ).all()
 
    return [serialize_board(board, owner) for board, owner in rows]
 

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
        card_data = []

        for c in cards:
            assigned_user = None

            if c.assigned_to:
                assigned_user = db.query(User).filter(
            User.id == c.assigned_to
        ).first()

            card_data.append({
        "id": str(c.id),
        "title": c.title,
        "description": c.description,
        "due_date": c.due_date if c.due_date else None,
        "badge": c.badge,
        "priority": c.priority,
        "assigned_to": str(c.assigned_to) if c.assigned_to else None,
        "attachment_url": c.attachment_url,
        "attachment_name": c.attachment_name,

        "assigned_member_name":
            f"{assigned_user.first_name} {assigned_user.last_name}"
            if assigned_user else None
    })

        result["lists"].append({
    "id": str(l.id),
    "title": l.title,
    "position": l.position,
    "cards": card_data
})

        # result["lists"].append({
        #     "id": str(l.id),
        #     "title": l.title,
        #     "position": l.position,
        #     "cards": [
        #         {
        #             "id": str(c.id),
        #             "title": c.title,
        #             "description": c.description,
        #             "due_date": c.due_date if c.due_date else None,
        #             # "due_date": c.due_date.isoformat() if c.due_date else None,
        #             "badge": c.badge,
        #             "priority": c.priority,
        #             "assigned_to": str(c.assigned_to) if c.assigned_to else None
        #         }
        #         for c in cards
        #     ]
        # })

    return result
