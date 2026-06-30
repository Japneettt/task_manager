from fastapi import APIRouter, Depends
from sqlalchemy import or_, func, cast, Date
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type, timezone
 
from app.core.database import get_db
from app.api.endpoints.users import get_current_user
 
from app.models.notification import Notification
from app.models.card import Card
from app.models.boards import Board
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.models.activity_log import ActivityLog
 
router = APIRouter()
 
 
def _naive_utc(dt):
    """
    Strip tzinfo so we can safely diff datetimes that may come back
    from the DB as either offset-aware or offset-naive (depending on
    column type / how they were written). Treats aware values as UTC.
    """
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt
 
 
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
 
        boards = db.query(Board).filter(Board.team_id == team_id).all()
 
        # owner info
        owner = None
        owner_name = None
        owner_role = None
        if team and team.owner_id:
            o = db.query(User).filter(User.id == team.owner_id).first()
            owner = str(team.owner_id)
            if o:
                owner_name = f"{o.first_name} {o.last_name}"
                owner_role = o.role
 
        result.append({
            "team_id": str(team_id),
            "team_name": team.name if team else "Team",
            "members": member_data,
            "board_id": str(boards[0].id) if boards and len(boards) > 0 else None,
            "owner_id": owner,
            "owner_name": owner_name,
            "owner_role": owner_role,
            "archived": bool(team.archived) if team else False
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
 
 
def _accessible_board_ids(db: Session, current_user: User):
    """
    Boards the user can see: ones they own personally, ones under a team
    they own, or ones under a team they're a member of.
    Shared by /recent, /heatmap, /insights for consistent scoping.
    """
    member_team_ids = [tm.team_id for tm in db.query(TeamMember).filter(
        TeamMember.user_id == current_user.id).all()]
    owned_team_ids = [t.id for t in db.query(Team).filter(
        Team.owner_id == current_user.id).all()]
    all_team_ids = list({*member_team_ids, *owned_team_ids})
 
    owned_board_ids = [b.id for b in db.query(Board).filter(
        Board.owner_id == current_user.id).all()]
    team_board_ids = [b.id for b in db.query(Board).filter(
        Board.team_id.in_(all_team_ids)).all()] if all_team_ids else []
 
    return list({*owned_board_ids, *team_board_ids})
 
@router.get("/recent")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20,
):
    board_ids = _accessible_board_ids(db, current_user)
 
    logs = db.query(ActivityLog)\
        .filter(
            or_(
                ActivityLog.actor_id == current_user.id,          # moves YOU made, any board
                ActivityLog.board_id.in_(board_ids) if board_ids else False,  # moves on boards you can still see
            )
        )\
        .order_by(ActivityLog.created_at.desc())\
        .limit(limit)\
        .all()
   
    # rest of the function unchanged ...
 
    # preload boards + teams referenced by these logs to avoid N+1 queries
    referenced_board_ids = list({log.board_id for log in logs if log.board_id})
    boards_by_id = {
        b.id: b for b in db.query(Board).filter(Board.id.in_(referenced_board_ids)).all()
    } if referenced_board_ids else {}
 
    referenced_team_ids = list({b.team_id for b in boards_by_id.values() if b.team_id})
    teams_by_id = {
        t.id: t for t in db.query(Team).filter(Team.id.in_(referenced_team_ids)).all()
    } if referenced_team_ids else {}
 
    result = []
    for log in logs:
        actor = db.query(User).filter(User.id == log.actor_id).first()
        board = boards_by_id.get(log.board_id)
        team = teams_by_id.get(board.team_id) if board and board.team_id else None
 
        result.append({
            "id": str(log.id),
            "card_title": log.card_title,
            "from_status": log.from_status,
            "to_status": log.to_status,
            "actor_name": f"{actor.first_name} {actor.last_name}" if actor else "Unknown",
            "actor_initial": (actor.first_name[0].upper() if actor and actor.first_name else "?"),
            "is_self": bool(actor and actor.id == current_user.id),
            "board_id": str(board.id) if board else None,
            "board_name": board.title if board else None,
            "team_id": str(team.id) if team else None,
            "team_name": team.name if team else None,
            "created_at": log.created_at.isoformat(),
        })
    return result
 
 
def _user_card_query(db: Session, current_user: User):
    """Cards the user owns the board of, or is assigned to — same scope as /productivity."""
    return db.query(Card).join(Board, Card.board_id == Board.id).filter(
        or_(
            Board.owner_id == current_user.id,
            Card.assigned_to == current_user.id,
        )
    )
 
 
@router.get("/heatmap")
def get_activity_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 182,  # ~6 months, matches the design
):
    """
    Returns one entry per calendar day with the count of tasks
    completed that day, for the last `days` days.
    -> [{ date: "2025-05-14", count: 7 }, ...]
    """
    start_date = datetime.utcnow().date() - timedelta(days=days - 1)
 
    rows = (
        _user_card_query(db, current_user)
        .filter(
            Card.completed_at != None,
            cast(Card.completed_at, Date) >= start_date,
        )
        .with_entities(
            cast(Card.completed_at, Date).label("day"),
            func.count(Card.id).label("count"),
        )
        .group_by("day")
        .all()
    )
 
    counts_by_day = {row.day.isoformat(): row.count for row in rows}
 
    result = []
    cursor = start_date
    today = datetime.utcnow().date()
    while cursor <= today:
        iso = cursor.isoformat()
        result.append({"date": iso, "count": counts_by_day.get(iso, 0)})
        cursor += timedelta(days=1)
 
    return result
 
 
@router.get("/insights")
def get_activity_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    All-time insights (no rolling window).
    -> {
         most_productive_day: "2025-05-14" | null,
         most_productive_count: 12,
         completion_rate: 0.72,
         avg_completion_days: 2.4 | null,
       }
    """
    base = _user_card_query(db, current_user)
 
    # ── Most productive day (all-time, completed tasks only) ──────────────
    top_day_row = (
        base.filter(Card.completed_at != None)
        .with_entities(
            cast(Card.completed_at, Date).label("day"),
            func.count(Card.id).label("count"),
        )
        .group_by("day")
        .order_by(func.count(Card.id).desc())
        .first()
    )
    most_productive_day = top_day_row.day.isoformat() if top_day_row else None
    most_productive_count = top_day_row.count if top_day_row else 0
 
    # ── Completion rate (all-time) ─────────────────────────────────────────
    total = base.count()
    completed_count = base.filter(Card.completed_at != None).count()
    completion_rate = (completed_count / total) if total else 0.0
 
    # ── Avg completion time (all-time) ──────────────────────────────────────
    rows = base.filter(
        Card.completed_at != None,
    ).with_entities(Card.created_at, Card.completed_at).all()
 
    # ✅ FIX: normalize both sides before subtracting — created_at/completed_at
    # can come back as a mix of offset-aware and offset-naive datetimes
    # depending on column type / how they were written, which previously
    # raised "TypeError: can't subtract offset-naive and offset-aware datetimes".
    deltas = [
        (_naive_utc(completed_at) - _naive_utc(created_at)).total_seconds() / 86400
        for created_at, completed_at in rows
        if created_at and completed_at
    ]
    avg_completion_days = round(sum(deltas) / len(deltas), 1) if deltas else None
 
    return {
        "most_productive_day": most_productive_day,
        "most_productive_count": most_productive_count,
        "completion_rate": round(completion_rate, 4),
        "avg_completion_days": avg_completion_days,
    }
 
# from fastapi import APIRouter, Depends
# from sqlalchemy import or_
# from sqlalchemy import cast, Date
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# from collections import defaultdict

# from app.core.database import get_db
# from app.api.endpoints.users import get_current_user

# from app.models.notification import Notification
# from app.models.card import Card
# from app.models.boards import Board
# from app.models.team import Team
# from app.models.team_member import TeamMember
# from app.models.user import User

# router = APIRouter()

# @router.get("/")
# def get_activity(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     notifications = db.query(Notification)\
#         .filter(Notification.user_id == current_user.id)\
#         .order_by(Notification.created_at.desc())\
#         .all()

#     today = datetime.utcnow().date()
#     yesterday = today - timedelta(days=1)

#     result = {
#         "today": [],
#         "yesterday": [],
#         "earlier": [],
#     }

#     for n in notifications:
#         if not n.created_at:
#             result["earlier"].append(n.message)
#             continue

#         date = n.created_at.date()

#         item = {
#             "id": str(n.id),
#             "title": n.title,
#             "message": n.message,
#             "type": n.type,
#             "entity_id": str(n.entity_id) if n.entity_id else None,
#             "created_at": n.created_at.isoformat(),
#         }

#         if date == today:
#             result["today"].append(item)
#         elif date == yesterday:
#             result["yesterday"].append(item)
#         else:
#             result["earlier"].append(item)

#     return result

# @router.get("/workload")
# def get_workload(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     team_ids = [
#         tm.team_id
#         for tm in db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
#     ]

#     owned_teams = db.query(Team).filter(Team.owner_id == current_user.id).all()
#     owned_team_ids = [team.id for team in owned_teams]

#     all_team_ids = list({*team_ids, *owned_team_ids})

#     result = []

#     for team_id in all_team_ids:
#         team = db.query(Team).filter(Team.id == team_id).first()
#         members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()

#         member_data = []
#         for member in members:
#             user = db.query(User).filter(User.id == member.user_id).first()
#             member_data.append({
#                 "user_id": str(member.user_id),
#                 "name": f"{user.first_name} {user.last_name}" if user else "Unknown"
#             })

#         # result.append({
#         #     "team_id": str(team_id),
#         #     "team_name": team.name if team else "Team",
#         #     "members": member_data,
#         # })
        
#         boards = db.query(Board).filter(Board.team_id == team_id).all()
#         # owner info
#         owner = None
#         owner_name = None
#         owner_role = None
#         if team and team.owner_id:
#             o = db.query(User).filter(User.id == team.owner_id).first()
#             owner = str(team.owner_id)
#             if o:
#                 owner_name = f"{o.first_name} {o.last_name}"
#                 owner_role = o.role

#         result.append({
#     "team_id": str(team_id),
#     "team_name": team.name if team else "Team",
#     "members": member_data,
#     "board_id": str(boards[0].id) if boards and len(boards) > 0 else None,
#     "owner_id": owner,
#     "owner_name": owner_name,
#     "owner_role": owner_role,
#     "archived": bool(team.archived) if team else False
#     # "board_id": str(boards[0].id) if boards else None   # ✅ ADD THIS
# })

        

#     return result

# @router.get("/productivity")
# def get_productivity(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     board_join = db.query(Card).join(Board, Card.board_id == Board.id)

#     total = board_join.filter(
#         or_(
#             Board.owner_id == current_user.id,
#             Card.assigned_to == current_user.id,
#         )
#     ).count()

#     assigned = board_join.filter(
#         Card.assigned_to == current_user.id,
#         Board.team_id != None,
#     ).count()

#     overdue = board_join.filter(
#         or_(
#             Board.owner_id == current_user.id,
#             Card.assigned_to == current_user.id,
#         ),
#         Card.completed_at == None,
#         Card.due_date != None,
#         cast(Card.due_date, Date) < datetime.utcnow().date()
#         # Card.due_date < datetime.utcnow()
#     ).count()

#     completed = board_join.filter(
#         or_(
#             Board.owner_id == current_user.id,
#             Card.assigned_to == current_user.id,
#         ),
#         Card.completed_at != None
#     ).count()

#     return {
#         "total_tasks": total,
#         "assigned_tasks": assigned,
#         "overdue_tasks": overdue,
#         "completed_tasks": completed,
#     }

# @router.get("/timeline")
# def get_timeline(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     cards = db.query(Card).filter(Card.assigned_to == current_user.id).all()

#     result = []

#     for c in cards:
#         if c.due_date:
#             result.append({
#                 "id": str(c.id),
#                 "title": c.title,
#                 "start": c.created_at.isoformat() if c.created_at else None,
#                 "end": c.due_date.isoformat(),
#                 "board_id": str(c.board_id),
#             })

#     return result

# @router.patch("/cards/{card_id}/dependency")
# def set_dependency(
#     card_id: str,
#     depends_on: str,
#     db: Session = Depends(get_db),
# ):
#     card = db.query(Card).filter(Card.id == card_id).first()

#     if not card:
#         return {"error": "Card not found"}

#     card.depends_on = depends_on
#     db.commit()

#     return {"message": "Dependency set"}