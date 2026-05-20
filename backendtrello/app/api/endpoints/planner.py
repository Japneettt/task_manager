from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.models.user import User
from app.models.card import Card

from datetime import datetime

from app.api.endpoints.users import get_current_user
# router = APIRouter()

# @router.get("/planner")
# def get_planner_data(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     today = date.today()

#     cards = db.query(Card).filter(
#         Card.assigned_to == current_user.id
#     ).all()

#     assigned = cards

#     overdue = [c for c in cards if c.due_date and c.due_date < str(today)]

#     today_tasks = [c for c in cards if c.due_date == str(today)]

#     return {
#         "assigned": assigned,
#         "overdue": overdue,
#         "today": today_tasks
#     }
from datetime import datetime
router = APIRouter()
@router.get("/planner")
def get_planner_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    # cards = db.query(Card).filter(
    #     Card.assigned_to == current_user.id
    # ).all()
    cards = db.query(Card).all()

    assigned = []
    overdue = []
    today_tasks = []

    for c in cards:
        if not c.due_date:
            continue

        try:
            # ✅ FIX: convert string → date
            due = datetime.fromisoformat(c.due_date).date()
        except:
            continue

        if due == today:
            today_tasks.append(c)
        elif due < today:
            overdue.append(c)
        else:
            assigned.append(c)

    return {
        "assigned": assigned,
        "overdue": overdue,
        "today": today_tasks
    }