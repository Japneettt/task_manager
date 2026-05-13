from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationRead
from app.api.endpoints.users import get_current_user
from app.models.user import User

# ✅ Router
router = APIRouter(prefix="", tags=["Notifications"])

@router.get("/", response_model=list[NotificationRead])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return notifications


@router.get("/{notification_id}", response_model=NotificationRead)
def get_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404, detail="Notification not found"
        )

    return notification

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ Correct query
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    # ✅ Not found check
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    # ✅ Update
    notification.is_read = True

    # ✅ Save changes
    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "id": str(notification.id)
    }

@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})

    db.commit()

    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404, detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return {"message": "Notification deleted"}



