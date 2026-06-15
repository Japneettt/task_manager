from calendar import monthrange
from datetime import datetime, timedelta

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


 
@router.get("/recent-tasks")
def recent_tasks(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    personal_board_ids = [
        b.id for b in db.query(Board).filter(
            Board.owner_id == current_user.id
        ).all()
    ]
 
    team_ids = [
        m.team_id for m in db.query(TeamMember).filter(
            TeamMember.user_id == current_user.id
        ).all()
    ]
 
    team_board_ids = []
 
    if team_ids:
        team_board_ids = [
            b.id for b in db.query(Board).filter(
                Board.team_id.in_(team_ids)
            ).all()
        ]
 
    board_ids = list({
        *personal_board_ids,
        *team_board_ids
    })
 
    cards = db.query(Card)\
        .join(List)\
        .filter(Card.board_id.in_(board_ids))\
        .order_by(Card.created_at.desc())\
        .limit(5)\
        .all()
 
    result = []
 
    for c in cards:
 
        list_name = db.query(List).filter(
            List.id == c.list_id
        ).first()
 
        status = (
            list_name.title
            if list_name else "Todo"
        )
 
        result.append({
            "id": str(c.id),
            "title": c.title,
            "status": status,
            "priority": c.priority,
            "due_date": c.due_date,
        })
 
    return result
@router.get("/upcoming-deadlines")
def upcoming_deadlines(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
 
    cards = db.query(Card).filter(
        Card.assigned_to == current_user.id,
        Card.due_date != None
    ).order_by(Card.due_date.asc()).limit(5).all()
 
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "due_date": c.due_date,
            "priority": c.priority
        }
        for c in cards
    ]
   
@router.get("/analytics-graph")
def analytics_graph(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    personal_board_ids = [
        b.id for b in db.query(Board).filter(
            Board.owner_id == current_user.id
        ).all()
    ]
 
    team_ids = [
        m.team_id for m in db.query(TeamMember).filter(
            TeamMember.user_id == current_user.id
        ).all()
    ]
 
    team_board_ids = []
 
    if team_ids:
        team_board_ids = [
            b.id for b in db.query(Board).filter(
                Board.team_id.in_(team_ids)
            ).all()
        ]
 
    board_ids = list({
        *personal_board_ids,
        *team_board_ids
    })
 
    total_days = monthrange(year, month)[1]
 
    result = []
 
    for day in range(1, total_days + 1):
 
        completed = 0
        progress = 0
        todo = 0
 
        cards = db.query(Card).join(List).filter(
            Card.board_id.in_(board_ids)
        ).all()
 
        for c in cards:
 
            if not c.created_at:
                continue
 
            created = c.created_at
 
            if (
                created.day == day and
                created.month == month and
                created.year == year
            ):
 
                list_name = (
                    c.list.title.lower()
                    if c.list else ""
                )
 
                if "done" in list_name:
                    completed += 1
 
                elif "progress" in list_name:
                    progress += 1
 
                else:
                    todo += 1
 
        if completed > 0 or progress > 0 or todo > 0:
          result.append({
        "date": str(day),
        "completed": completed,
        "progress": progress,
        "todo": todo
    })
 
    return result
 
@router.get("/task-overview")
def task_overview(
    week_offset: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    personal_board_ids = [
        b.id for b in db.query(Board).filter(
            Board.owner_id == current_user.id
        ).all()
    ]
 
    team_ids = [
        m.team_id for m in db.query(TeamMember).filter(
            TeamMember.user_id == current_user.id
        ).all()
    ]
 
    team_board_ids = []
 
    if team_ids:
        team_board_ids = [
            b.id for b in db.query(Board).filter(
                Board.team_id.in_(team_ids)
            ).all()
        ]
 
    board_ids = list({
        *personal_board_ids,
        *team_board_ids
    })
   
    today = datetime.utcnow()
 
    start_of_week = today - timedelta(
    days=today.weekday()
)
 
    start_of_week = start_of_week + timedelta(
    weeks=week_offset
)
 
    end_of_week = start_of_week + timedelta(days=7)
 
 
   
    cards = db.query(Card).join(List).filter(
    Card.board_id.in_(board_ids),
    Card.created_at >= start_of_week,
    Card.created_at < end_of_week
).all()
 
 
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
 
    result = []
 
    for index, day in enumerate(days):
 
        todo = 0
        progress = 0
        done = 0
 
        for c in cards:
 
            if not c.created_at:
                continue
 
            try:
                weekday = c.created_at.weekday()
            except:
                continue
 
            if weekday == index:
 
                list_name = (
                    c.list.title.lower()
                    if c.list else ""
                )
 
                if "done" in list_name or "completed" in list_name:
                    done += 1
 
                elif "progress" in list_name:
                    progress += 1
 
                else:
                    todo += 1
 
        result.append({
            "day": day,
            "todo": todo,
            "progress": progress,
            "done": done,
        })
 
    return result
 
