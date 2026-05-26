# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy import func

# from app.core.database import get_db
# from app.models.user import User
# from app.models.team import Team
# from app.models.card import Card
# from app.models.boards import Board
# from app.models.notification import Notification
# from app.api.endpoints.users import get_current_user

# router = APIRouter()

# # ✅ ADMIN CHECK
# def get_admin_user(current_user: User = Depends(get_current_user)):
#     if not getattr(current_user, "is_admin", False):
#         raise HTTPException(status_code=403, detail="Not authorized")
#     return current_user


# # ✅ STATS
# @router.get("/stats")
# def get_stats(
#     db: Session = Depends(get_db),
#     admin=Depends(get_admin_user)
# ):
#     return {
#         "total_users": db.query(User).count(),
#         "total_teams": db.query(Team).count(),
#         "total_boards": db.query(Board).count(),
#         "total_cards": db.query(Card).count(),
#     }


# # ✅ USERS
# @router.get("/users")
# def get_users(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
#     users = db.query(User).all()

#     return [
#         {
#             "id": str(u.id),
#             "email": u.email,
#             "role": "admin" if u.is_admin else "user",
#             "is_active": u.is_active if hasattr(u, "is_active") else True,
#         }
#         for u in users
#     ]


# # ✅ CHANGE ROLE
# @router.patch("/users/{user_id}/role")
# def change_role(user_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
#     user = db.query(User).get(user_id)
#     user.is_admin = not user.is_admin
#     db.commit()
#     return {"message": "Role updated"}


# # ✅ DISABLE USER
# @router.patch("/users/{user_id}/disable")
# def disable_user(user_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
#     user = db.query(User).get(user_id)
#     user.is_active = False
#     db.commit()
#     return {"message": "User disabled"}


# # ✅ DELETE USER
# @router.delete("/users/{user_id}")
# def delete_user(user_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
#     user = db.query(User).get(user_id)
#     db.delete(user)
#     db.commit()
#     return {"message": "User deleted"}


# # ✅ TEAMS
# @router.get("/teams")
# def get_teams(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
#     teams = db.query(Team).all()

#     return [
#         {
#             "id": str(t.id),
#             "name": t.name,
#             "member_count": len(t.members) if hasattr(t, "members") else 0
#         }
#         for t in teams
#     ]


# # ✅ DELETE TEAM
# @router.delete("/teams/{team_id}")
# def delete_team(team_id: str, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
#     team = db.query(Team).get(team_id)
#     db.delete(team)
#     db.commit()
#     return {"message": "Team deleted"}


# # ✅ ACTIVITY
# @router.get("/activity")
# def get_activity(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
#     logs = db.query(Notification).order_by(Notification.created_at.desc()).all()

#     return [
#         {
#             "id": str(log.id),
#             "message": log.message,
#             "created_at": log.created_at
#         }
#         for log in logs
#     ]


# # ✅ ANALYTICS
# @router.get("/analytics")
# def analytics(db: Session = Depends(get_db), admin=Depends(get_admin_user)):

#     total = db.query(Card).count()

#     completed = db.query(Card).filter(Card.completed_at != None).count()
#     pending = db.query(Card).filter(Card.completed_at == None).count()

#     return {
#         "card_status_distribution": {
#             "pending": pending,
#             "in_progress": max(total - completed - pending, 0),
#             "completed": completed,
#         },
#         "team_productivity": [],
#         "active_users": db.query(User).count(),
#     }
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID
from sqlalchemy import cast, DateTime
from app.core.database import get_db
from app.core.admin_deps import get_admin

from app.models.team import Team
from app.models.user import User
from app.models.card import Card
from app.models.boards import Board
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