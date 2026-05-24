from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.endpoints.users import get_current_user
from app.models.card import Card
from app.models.boards import Board
from app.models.lists import List
from app.models.team_member import TeamMember

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard_counts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Personal board ids (owned by user, not part of a team)
    personal_board_ids = [b.id for b in db.query(Board).filter(Board.owner_id == current_user.id, Board.team_id == None).all()]

    # Team ids where user is a member or owner
    team_ids = [m.team_id for m in db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()]
    owned_team_ids = [t.id for t in db.query(Board).filter(Board.owner_id == current_user.id, Board.team_id != None).all()]
    all_team_ids = list({*team_ids, *owned_team_ids})

    team_board_ids = []
    if all_team_ids:
        team_board_ids = [b.id for b in db.query(Board).filter(Board.team_id.in_(all_team_ids)).all()]

    board_ids = list({*personal_board_ids, *team_board_ids})

    # join cards -> lists for title
    cards_q = db.query(Card).join(List).filter(Card.board_id.in_(board_ids))

    # counts by normalized title variants
    todo_count = cards_q.filter(func.lower(List.title).in_(["to do", "todo", "pending"]) ).count()
    in_progress_count = cards_q.filter(func.lower(List.title).in_(["in progress", "progress", "doing", "inprogress"]) ).count()
    done_count = cards_q.filter(func.lower(List.title).in_(["done", "completed"]) ).count()

    return {
        "todo": todo_count,
        "in_progress": in_progress_count,
        "done": done_count,
    }
