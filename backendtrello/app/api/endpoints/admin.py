
from fastapi import APIRouter, Depends, HTTPException
import re
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy import cast, DateTime, func, extract
from app.core.database import get_db
from app.core.admin_deps import get_admin
 
from app.models.team import Team
from app.models.user import User
from app.models.card import Card
from app.models.boards import Board
from app.models.team_member import TeamMember
from app.models.team_invite import TeamInvite
router = APIRouter()
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), admin=Depends(get_admin)):
    today = datetime.utcnow().date()
 
    total_teams = db.query(Team).count()
    active_users = db.query(User).filter(User.is_active == True).count()
 
    completed_today = db.query(Card).filter(
        Card.completed_at != None
    ).count()
 
   
    overdue = db.query(Card).filter(
    Card.completed_at == None,
    Card.due_date != None,
    Card.due_date < datetime.utcnow().isoformat()  # ✅ FIX
).count()
 
 
    productivity = round((completed_today / (completed_today + overdue + 1)) * 100, 2)
 
    return {
        "total_teams": total_teams,
        "active_users": active_users,
        "completed_today": completed_today,
        "overdue": overdue,
        "productivity": productivity
    }
   
from fastapi import Query
 
@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    admin=Depends(get_admin),
    search: str = Query(default=""),
    page: int = 1,
    limit: int = 10,
    status: str = "all"
):
    query = db.query(User)
 
    # ✅ SEARCH
    if search:
        query = query.filter(
            User.email.ilike(f"%{search}%") |
            User.first_name.ilike(f"%{search}%") |
            User.last_name.ilike(f"%{search}%")
        )
 
    # ✅ FILTER
    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)
    elif status == "admin":
        query = query.filter(User.is_admin == True)
 
    total = query.count()
 
    users = query.offset((page - 1) * limit).limit(limit).all()
 
    return {
        "data": users,
        "total": total
    }

def _build_team_image_url(image_url: str | None, team_id: UUID) -> str:
    default_url = f"https://source.unsplash.com/800x600?abstract,team&sig={team_id}"
    if not image_url:
        return default_url
    if "<a" in image_url.lower():
        clean_url = re.sub(r"<.*?>", "", image_url).strip()
        return clean_url or default_url
    return image_url


@router.get("/teams")
def get_teams(db: Session = Depends(get_db), admin=Depends(get_admin)):
    teams = db.query(Team).all()
    result = []
    for team in teams:
        owner = db.query(User).filter(User.id == team.owner_id).first()
        member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
        result.append({
            "id": str(team.id),
            "name": team.name,
            "description": team.description,
            "type": team.type,
            "image_url": _build_team_image_url(team.image_url, team.id),
            "owner": owner and f"{owner.first_name} {owner.last_name}",
            "members_count": member_count,
        })
    return result

@router.delete("/teams/{team_id}")
def delete_team(team_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    db.query(Board).filter(Board.team_id == team_id).delete()
    db.query(TeamMember).filter(TeamMember.team_id == team_id).delete()
    db.query(TeamInvite).filter(TeamInvite.team_id == team_id).delete()
    db.delete(team)
    db.commit()

    return {"message": "Team deleted"}

@router.get("/admin/team/{team_id}")
def team_stats(team_id: UUID, db: Session = Depends(get_db)):
    cards = db.query(Card).join(Board).filter(Board.team_id == team_id).all()
 
    done = len([c for c in cards if c.completed_at])
    total = len(cards)
 
    return {
        "done": done,
        "total": total
    }
   
@router.get("/team/{team_id}")
def team_stats(team_id: UUID, db: Session = Depends(get_db)):
    cards = db.query(Card).join(Board).filter(Board.team_id == team_id).all()
 
    done = len([c for c in cards if c.completed_at])
    total = len(cards)
 
    return {
        "done": done,
        "total": total
    }
   
from app.models.team_member import TeamMember  # ✅ make sure exists
 
@router.get("/users/{user_id}/insights")
def user_insights(user_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin)):
 
    assigned = db.query(Card).filter(
        Card.assigned_to == str(user_id)
    ).count()
 
    completed = db.query(Card).filter(
        Card.assigned_to == str(user_id),
        Card.completed_at != None
    ).count()
 
    overdue = db.query(Card).filter(
        Card.assigned_to == str(user_id),
        Card.completed_at == None,
        cast(Card.due_date, DateTime) < datetime.utcnow()
).count()
 
 
    teams = db.query(TeamMember).filter(
        TeamMember.user_id == user_id
    ).count()
 
    productivity = int((completed / assigned) * 100) if assigned else 0
 
    streak = completed // 2 if completed else 0  # simple logic
 
    return {
        "assigned": assigned,
        "completed": completed,
        "overdue": overdue,
        "teams": teams,
        "productivity": productivity,
        "streak": streak
    }
@router.delete("/users/{user_id}")
def delete_user(user_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# -----------------------------
# New analytics endpoints (minimal implementations)
# -----------------------------


@router.get("/analytics/overview")
def analytics_overview(db: Session = Depends(get_db), admin=Depends(get_admin)):
    total_users = db.query(User).count()
    total_teams = db.query(Team).count()
    total_boards = db.query(Board).count()
    total_tasks = db.query(Card).count()

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    active_7d = db.query(User).filter(User.last_login != None, User.last_login >= seven_days_ago).count()

    completed = db.query(Card).filter(Card.completed_at != None).count()
    completed_pct = round((completed / total_tasks * 100), 2) if total_tasks else 0

    return {
        "total_users": total_users,
        "total_teams": total_teams,
        "total_boards": total_boards,
        "total_tasks": total_tasks,
        "active_users_7d": active_7d,
        "completed_tasks_pct": completed_pct,
    }


@router.get("/analytics/top-users")
def analytics_top_users(db: Session = Depends(get_db), admin=Depends(get_admin)):
    # top users by completed tasks
    q = (
        db.query(User.id.label("id"), User.first_name, User.last_name, func.count(Card.id).label("completed"))
        .join(Card, Card.assigned_to == User.id)
        .filter(Card.completed_at != None)
        .group_by(User.id)
        .order_by(func.count(Card.id).desc())
        .limit(5)
    )

    results = q.all()
    return [
        {"id": str(r.id), "name": f"{r.first_name} {r.last_name}", "completed_tasks": int(r.completed)} for r in results
    ]


@router.get("/analytics/top-teams")
def analytics_top_teams(db: Session = Depends(get_db), admin=Depends(get_admin)):
    teams = db.query(Team).all()
    out = []
    for t in teams:
        boards_count = db.query(Board).filter(Board.team_id == t.id).count()
        # completed tasks across boards in team
        completed = (
            db.query(Card)
            .join(Board, Board.id == Card.board_id)
            .filter(Board.team_id == t.id, Card.completed_at != None)
            .count()
        )
        out.append({"id": str(t.id), "name": t.name, "boards_count": boards_count, "completed_tasks": completed})

    # sort and return top 5
    out = sorted(out, key=lambda x: x["completed_tasks"], reverse=True)[:5]
    return out


@router.get("/analytics/all-teams")
def analytics_all_teams(db: Session = Depends(get_db), admin=Depends(get_admin)):
    """Return ALL teams (not limited to top 5)"""
    teams = db.query(Team).all()
    out = []
    for t in teams:
        boards_count = db.query(Board).filter(Board.team_id == t.id).count()
        completed = (
            db.query(Card)
            .join(Board, Board.id == Card.board_id)
            .filter(Board.team_id == t.id, Card.completed_at != None)
            .count()
        )
        out.append({"id": str(t.id), "name": t.name, "boards_count": boards_count, "completed_tasks": completed})

    # sort by completed tasks descending
    out = sorted(out, key=lambda x: x["completed_tasks"], reverse=True)
    return out


@router.get("/analytics/tasks-trend")
def analytics_tasks_trend(days: int = 14, db: Session = Depends(get_db), admin=Depends(get_admin)):
    # return list of {date, completed}
    points = []
    for i in range(days - 1, -1, -1):
        d = (datetime.utcnow() - timedelta(days=i)).date()
        # count completed on that date
        start = datetime(d.year, d.month, d.day)
        end = start + timedelta(days=1)
        cnt = db.query(Card).filter(Card.completed_at != None, Card.completed_at >= start, Card.completed_at < end).count()
        points.append({"date": d.isoformat(), "completed": cnt})
    return points


@router.get("/analytics/activity-heatmap")
def analytics_activity_heatmap(db: Session = Depends(get_db), admin=Depends(get_admin)):
    # build counts by day (0=Sun) and hour (0-23) based on card created_at
    rows = db.query(Card.created_at).filter(Card.created_at != None).all()
    heat = {}
    for (created,) in rows:
        if not created:
            continue
        dt = created
        # ensure datetime
        day = int(dt.weekday())  # Monday=0
        # convert to Sunday=0 index
        # weekday Monday=0 -> convert: (weekday+1)%7
        day = (day + 1) % 7
        hour = dt.hour
        key = (day, hour)
        heat[key] = heat.get(key, 0) + 1

    out = [{"day": k[0], "hour": k[1], "count": v} for k, v in heat.items()]
    return out


@router.get("/tasks")
def admin_tasks(db: Session = Depends(get_db), admin=Depends(get_admin), status: str = "all", team_id: str = "all"):
    q = db.query(Card)
    
    if status != "all":
        if status == "Done":
            q = q.filter(Card.completed_at != None)
        elif status == "To Do":
            q = q.filter(Card.completed_at == None)
    
    if team_id != "all":
        q = q.join(Board, Board.id == Card.board_id).filter(Board.team_id == team_id)

    cards = q.order_by(Card.due_date.asc().nullsfirst()).limit(100).all()

    out = []
    for c in cards:
        assigned = None
        if c.assigned_to:
            u = db.query(User).filter(User.id == c.assigned_to).first()
            if u:
                assigned = {"id": str(u.id), "name": f"{u.first_name} {u.last_name}"}

        board = db.query(Board).filter(Board.id == c.board_id).first()
        team = None
        if board and board.team_id:
            t = db.query(Team).filter(Team.id == board.team_id).first()
            if t:
                team = {"id": str(t.id), "name": t.name}

        out.append({
            "id": str(c.id),
            "title": c.title,
            "assigned_user": assigned,
            "team": team,
            "board": {"id": str(board.id), "title": board.title} if board else None,
            "due_date": c.due_date.isoformat() if c.due_date else None,
            "status": "Done" if c.completed_at else ("To Do" if not c.completed_at else "In Progress"),
        })

    return out
 