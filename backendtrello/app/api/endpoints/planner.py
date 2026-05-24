from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime
from app.core.database import get_db
from app.models.user import User
from app.models.card import Card
from app.models.lists import List
from app.models.boards import Board
from app.models.team_member import TeamMember
from app.models.team import Team
from app.api.endpoints.users import get_current_user

router = APIRouter()


def serialize_card(card: Card, db: Session):
    board = db.query(Board).filter(Board.id == card.board_id).first()
    list_obj = db.query(List).filter(List.id == card.list_id).first()
    list_name = list_obj.title if list_obj else None
    team_id = str(board.team_id) if board and board.team_id else None

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

    canonical = normalize_title(list_name) if list_name else None
    # standardized status keys for kanban grouping: 'to_do', 'in_progress', 'done'
    if card.completed_at or canonical == "Done":
        status_key = "done"
    elif canonical == "In Progress":
        status_key = "in_progress"
    else:
        status_key = "to_do"

    due_date = None
    if card.due_date:
        try:
            due_date = card.due_date.isoformat()
        except Exception:
            due_date = str(card.due_date)

    completed_at = None
    if card.completed_at:
        try:
            completed_at = card.completed_at.isoformat()
        except Exception:
            completed_at = str(card.completed_at)

    return {
        "id": str(card.id),
        "title": card.title,
        "description": card.description,
        "due_date": due_date,
        "completed_at": completed_at,
        "assigned_to": str(card.assigned_to) if card.assigned_to else None,
        "user_id": str(card.assigned_to) if card.assigned_to else None,
        "team_id": team_id,
        "board_id": str(card.board_id) if card.board_id else None,
        "list_id": str(card.list_id) if card.list_id else None,
        "list_name": canonical or list_name,
        "status": status_key,
    }


@router.get("/planner")
def get_planner_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    team_ids = [
        membership.team_id
        for membership in db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    ]
    owned_team_ids = [team.id for team in db.query(Team).filter(Team.owner_id == current_user.id).all()]
    all_team_ids = list({*team_ids, *owned_team_ids})

    # Include all cards on personal boards owned by the current user
    personal_cards = db.query(Card).join(Board).filter(
        Board.owner_id == current_user.id,
        Board.team_id == None,
    ).all()

    team_cards = []
    if all_team_ids:
        team_cards = db.query(Card).join(Board).filter(Board.team_id.in_(all_team_ids)).all()

    cards = personal_cards + team_cards
    assigned = []
    overdue = []
    today_tasks = []
    kanban = {"to_do": [], "in_progress": [], "done": []}

    for c in cards:
        serialized = serialize_card(c, db)
        is_done = bool(c.completed_at) or (serialized.get("list_name") == "Done") or (serialized.get("status") == "done")

        # only include active (not done) tasks in assigned/today/overdue
        if not is_done:
            if c.due_date:
                try:
                    if isinstance(c.due_date, str):
                        due = datetime.fromisoformat(c.due_date).date()
                    else:
                        due = c.due_date.date()
                except Exception:
                    due = None

                if due:
                    if due == today:
                        today_tasks.append(serialized)
                    elif due < today:
                        overdue.append(serialized)
                    else:
                        assigned.append(serialized)
                else:
                    assigned.append(serialized)
            else:
                assigned.append(serialized)

        # build kanban including done/in_progress/to_do
        if is_done:
            kanban["done"].append(serialized)
            continue

        if serialized["status"] == "in_progress":
            kanban["in_progress"].append(serialized)
        else:
            kanban["to_do"].append(serialized)

    return {
        "assigned": assigned,
        "overdue": overdue,
        "today": today_tasks,
        "kanban": kanban,
    }
