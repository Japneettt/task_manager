from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import User
from app.models.team import Team
from app.models.card import Card
from app.models.boards import Board
from app.models.notification import Notification
from app.api.endpoints.users import get_current_user

router = APIRouter()

# ✅ ADMIN CHECK
def get_admin_user(current_user: User = Depends(get_current_user)):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user


# ✅ STATS
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    return {
        "total_users": db.query(User).count(),
        "total_teams": db.query(Team).count(),
        "total_boards": db.query(Board).count(),
        "total_cards": db.query(Card).count(),
    }


# ✅ USERS
@router.get("/users")
def get_users(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    users = db.query(User).all()

    return [
        {
            "id": str(u.id),
            "email": u.email,
            "role": "admin" if u.is_admin else "user",
            "is_active": u.is_active if hasattr(u, "is_active") else True,
        }
        for u in users
    ]


# ✅ CHANGE ROLE
@router.patch("/users/{user_id}/role")
def change_role(user_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    user = db.query(User).get(user_id)
    user.is_admin = not user.is_admin
    db.commit()
    return {"message": "Role updated"}


# ✅ DISABLE USER
@router.patch("/users/{user_id}/disable")
def disable_user(user_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    user = db.query(User).get(user_id)
    user.is_active = False
    db.commit()
    return {"message": "User disabled"}


# ✅ DELETE USER
@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    user = db.query(User).get(user_id)
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ✅ TEAMS
@router.get("/teams")
def get_teams(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    teams = db.query(Team).all()

    return [
        {
            "id": str(t.id),
            "name": t.name,
            "member_count": len(t.members) if hasattr(t, "members") else 0
        }
        for t in teams
    ]


# ✅ DELETE TEAM
@router.delete("/teams/{team_id}")
def delete_team(team_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    team = db.query(Team).get(team_id)
    db.delete(team)
    db.commit()
    return {"message": "Team deleted"}


# ✅ ACTIVITY
@router.get("/activity")
def get_activity(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    logs = db.query(Notification).order_by(Notification.created_at.desc()).all()

    return [
        {
            "id": str(log.id),
            "message": log.message,
            "created_at": log.created_at
        }
        for log in logs
    ]


# ✅ ANALYTICS
@router.get("/analytics")
def analytics(db: Session = Depends(get_db), admin=Depends(get_admin_user)):

    total = db.query(Card).count()

    completed = db.query(Card).filter(Card.completed_at != None).count()
    pending = db.query(Card).filter(Card.completed_at == None).count()

    return {
        "card_status_distribution": {
            "pending": pending,
            "in_progress": max(total - completed - pending, 0),
            "completed": completed,
        },
        "team_productivity": [],
        "active_users": db.query(User).count(),
    }
