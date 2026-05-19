from sqlalchemy.orm import Session
from uuid import UUID
from app.models.notification import Notification

def create_notification(
    db: Session,
    user_id: UUID,
    title: str,
    message: str,
    type: str | None = None,
    entity_id: UUID | None = None,
    category: str = "personal",
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        entity_id=entity_id,
        category=category,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification