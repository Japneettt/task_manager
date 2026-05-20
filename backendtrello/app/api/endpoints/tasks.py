from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

# ✅ DB + Dependencies
from app.core.database import get_db
from app.api.endpoints.users import get_current_user

# ✅ Models
from app.models.task import Task
from app.models.user import User
from app.models.lists import List

# ✅ Notification
from app.services.notification_service import create_notification

# ✅ Router
router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ✅ CREATE TASK
@router.post("/")
def create_task(
    title: str,
    list_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ check list exists
    lst = db.query(List).filter(List.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    task = Task(
        title=title,
        list_id=list_id,
        assigned_to=None
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# ✅ GET ALL TASKS
@router.get("/")
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Task).all()


# ✅ GET ONE TASK
@router.get("/{task_id}")
def get_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


# ✅ ASSIGN TASK
@router.patch("/{task_id}/assign")
def assign_task(
    task_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.assigned_to = user_id
    db.commit()
    db.refresh(task)

    # ✅ notification
    create_notification(
        db=db,
        user_id=user_id,
        title="Task Assigned",
        message=f"You were assigned: {task.title}",
        type="assignment",
        entity_id=task.id,
    )

    return {
        "message": "Task assigned successfully",
        "task_id": str(task.id),
    }


# ✅ DELETE TASK
@router.delete("/{task_id}")
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}


# ✅ MOVE TASK
@router.patch("/{task_id}/move")
def move_task(
    task_id: UUID,
    list_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ✅ check target list
    lst = db.query(List).filter(List.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    task.list_id = list_id

    db.commit()
    db.refresh(task)

    return {"message": "Task moved successfully"}
