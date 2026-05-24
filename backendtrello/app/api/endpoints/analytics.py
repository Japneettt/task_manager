from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.card import Card
from app.models.lists import List
from app.models.boards import Board
from app.models.team_member import TeamMember
from app.api.endpoints.users import get_current_user
from uuid import UUID
from sqlalchemy import func
# router = APIRouter(tags=["Analytics"])
router = APIRouter(prefix="/analytics", tags=["Analytics"])
@router.get("/boards")
def board_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        personal_board_ids = [
            board.id for board in db.query(Board).filter(
                Board.owner_id == current_user.id,
                Board.team_id == None,
            ).all()
        ]
 
        team_ids = [
            membership.team_id for membership in db.query(TeamMember).filter(
                TeamMember.user_id == current_user.id
            ).all()
        ]
 
        team_board_ids = []
        if team_ids:
            team_board_ids = [
                board.id for board in db.query(Board).filter(Board.team_id.in_(team_ids)).all()
            ]
 
        def compute_performance(board_ids):
            if not board_ids:
                return 0.0
 
            cards = db.query(Card).join(List).filter(Card.board_id.in_(board_ids))
            total_cards = cards.count()
            if total_cards == 0:
                return 0.0

            # Normalize by title variants to handle inconsistencies
            completed_count = cards.filter(func.lower(List.title).in_(["done", "completed"]) ).count()
            in_progress_count = cards.filter(func.lower(List.title).in_(["in progress", "progress", "doing", "inprogress"]) ).count()
            performance = (completed_count + in_progress_count * 0.5) / total_cards
 
            return float(round(performance, 4))
 
        personal_performance = compute_performance(personal_board_ids)
        team_performance = compute_performance(team_board_ids)

        # Debug logs
        try:
            print("Analytics - User:", getattr(current_user, 'id', current_user))
            print("Analytics - Personal boards:", personal_board_ids)
            print("Analytics - Team boards:", team_board_ids)
        except Exception:
            pass

        return {
            "personal": {
                "performance": personal_performance,
            },
            "team": {
                "performance": team_performance,
            },
        }
 
    except Exception as e:
        print("Analytics error:", e)
        return {
            "personal": {
                "performance": 0.0,
            },
            "team": {
                "performance": 0.0,
            },
        }
 
 
 
 
@router.get("/team/{team_id}")
def get_team_stats(team_id: UUID, db: Session = Depends(get_db)):
 
    # ✅ get all boards of team
    boards = db.query(Board).filter(Board.team_id == team_id).all()
    board_ids = [b.id for b in boards]
 
    # ✅ get lists
    lists = db.query(List).filter(List.board_id.in_(board_ids)).all()
    list_map = {l.id: l.title for l in lists}
    list_ids = list_map.keys()
 
    # ✅ get cards
    cards = db.query(Card).filter(Card.list_id.in_(list_ids)).all()
 
    # ✅ counters
    done = 0
    in_progress = 0
    todo = 0
 
    def normalize_title(t: str) -> str:
        if not t:
            return ""
        s = t.strip().lower()
        if s in ("pending", "todo", "to do"):
            return "pending"
        if s in ("progress", "in progress", "doing"):
            return "in_progress"
        if s in ("completed", "done"):
            return "done"
        return s

    for c in cards:
        list_name = normalize_title(list_map.get(c.list_id, ""))

        if list_name == "done":
            done += 1
        elif list_name == "in_progress":
            in_progress += 1
        else:
            todo += 1
 
    return {
        "done": done,
        "in_progress": in_progress,
        "todo": todo
    }
 

