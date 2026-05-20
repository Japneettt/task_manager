from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy import cast, Date
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict

from app.core.database import get_db
from app.api.endpoints.users import get_current_user

from app.models.notification import Notification
from app.models.card import Card
from app.models.boards import Board
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = db.query(Notification)\
        .filter(Notification.user_id == current_user.id)\
        .order_by(Notification.created_at.desc())\
        .all()

    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    result = {
        "today": [],
        "yesterday": [],
        "earlier": [],
    }

    for n in notifications:
        if not n.created_at:
            result["earlier"].append(n.message)
            continue

        date = n.created_at.date()

        item = {
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "entity_id": str(n.entity_id) if n.entity_id else None,
            "created_at": n.created_at.isoformat(),
        }

        if date == today:
            result["today"].append(item)
        elif date == yesterday:
            result["yesterday"].append(item)
        else:
            result["earlier"].append(item)

    return result

@router.get("/workload")
def get_workload(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team_ids = [
        tm.team_id
        for tm in db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    ]

    owned_teams = db.query(Team).filter(Team.owner_id == current_user.id).all()
    owned_team_ids = [team.id for team in owned_teams]

    all_team_ids = list({*team_ids, *owned_team_ids})

    result = []

    for team_id in all_team_ids:
        team = db.query(Team).filter(Team.id == team_id).first()
        members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()

        member_data = []
        for member in members:
            user = db.query(User).filter(User.id == member.user_id).first()
            member_data.append({
                "user_id": str(member.user_id),
                "name": f"{user.first_name} {user.last_name}" if user else "Unknown"
            })

        result.append({
            "team_id": str(team_id),
            "team_name": team.name if team else "Team",
            "members": member_data,
        })

    return result

@router.get("/productivity")
def get_productivity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board_join = db.query(Card).join(Board, Card.board_id == Board.id)

    total = board_join.filter(
        or_(
            Board.owner_id == current_user.id,
            Card.assigned_to == current_user.id,
        )
    ).count()

    assigned = board_join.filter(
        Card.assigned_to == current_user.id,
        Board.team_id != None,
    ).count()

    overdue = board_join.filter(
        or_(
            Board.owner_id == current_user.id,
            Card.assigned_to == current_user.id,
        ),
        Card.completed_at == None,
        Card.due_date != None,
        cast(Card.due_date, Date) < datetime.utcnow().date()
        # Card.due_date < datetime.utcnow()
    ).count()

    completed = board_join.filter(
        or_(
            Board.owner_id == current_user.id,
            Card.assigned_to == current_user.id,
        ),
        Card.completed_at != None
    ).count()

    return {
        "total_tasks": total,
        "assigned_tasks": assigned,
        "overdue_tasks": overdue,
        "completed_tasks": completed,
    }

@router.get("/timeline")
def get_timeline(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cards = db.query(Card).filter(Card.assigned_to == current_user.id).all()

    result = []

    for c in cards:
        if c.due_date:
            result.append({
                "id": str(c.id),
                "title": c.title,
                "start": c.created_at.isoformat() if c.created_at else None,
                "end": c.due_date.isoformat(),
                "board_id": str(c.board_id),
            })

    return result

@router.patch("/cards/{card_id}/dependency")
def set_dependency(
    card_id: str,
    depends_on: str,
    db: Session = Depends(get_db),
):
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        return {"error": "Card not found"}

    card.depends_on = depends_on
    db.commit()

    return {"message": "Dependency set"}