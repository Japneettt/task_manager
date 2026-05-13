from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

# ✅ DB + Dependencies
from app.core.database import get_db
from app.api.endpoints.users import get_current_user

# ✅ Models
from app.models.task import Task
from app.models.user import User

# ✅ Notification
from app.services.notification_service import create_notification

# ✅ Router
router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/")
def create_task(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        title=title,
        assigned_to=None  # initially unassigned
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task

@router.get("/")
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = db.query(Task).all()
    return tasks


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

@router.patch("/{task_id}/assign")
def assign_task(
    task_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ Find task
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ✅ Assign user
    task.assigned_to = user_id
    db.commit()
    db.refresh(task)

    # ✅ Create notification 🔥
    create_notification(
        db=db,
        user_id=user_id,  # person receiving notification
        title="Task Assigned",
        message=f"You were assigned: {task.title}",
        type="assignment",
        entity_id=task.id,
    )

    return {
        "message": "Task assigned successfully",
        "task_id": str(task.id),
    }

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


@router.patch("/{task_id}/move")
def move_task(
    task_id: UUID,
    list_id: UUID,
    db: Session = Depends(get_db),  # ✅ FIX HERE
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        return {"error": "Task not found"}

    task.list_id = list_id

    db.commit()
    db.refresh(task)

    return {"message": "Task moved successfully"} 



