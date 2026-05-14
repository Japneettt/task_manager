from app.models.notification import Notification

def create_notification(db, message, user_id, board_id=None):
    notif = Notification(
        title="Activity",   # ✅ ADD THIS (IMPORTANT)
        message=message,
        user_id=user_id,
        board_id=board_id
    )
    db.add(notif)