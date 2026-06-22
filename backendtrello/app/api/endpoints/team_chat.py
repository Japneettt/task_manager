from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.api.endpoints.users import get_current_user
from app.websocket.manager import manager

from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.team_message import TeamMessage
from app.models.user import User

from app.schemas.message import MessageCreate, TeamMessageRead, SenderInfo
from app.utils.mentions import resolve_mentions_in_team
from app.services.notification_service import create_notification

router = APIRouter()


def _ensure_team_member(db: Session, team_id: UUID, user_id: UUID):
    """Guard: only people who belong to the team can read/post its chat."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team.owner_id == user_id:
        return team

    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id,
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    return team


def _serialize_message(msg: TeamMessage, sender: User) -> dict:
    return {
        "id": str(msg.id),
        "team_id": str(msg.team_id),
        "content": msg.content,
        "sender": {
            "id": str(sender.id),
            "name": f"{sender.first_name} {sender.last_name}",
            "avatar": sender.avatar,
        },
        "mentioned_user_ids": [str(u) for u in (msg.mentioned_user_ids or [])],
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


# ✅ GET CHAT HISTORY
@router.get("/teams/{team_id}/messages")
def get_team_messages(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_team_member(db, team_id, current_user.id)

    messages = (
        db.query(TeamMessage)
        .filter(TeamMessage.team_id == team_id)
        .order_by(TeamMessage.created_at.asc())
        .all()
    )

    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        if sender:
            result.append(_serialize_message(msg, sender))

    return result


# ✅ SEND A MESSAGE (saved + broadcast live + mention notifications)
@router.post("/teams/{team_id}/messages")
async def send_team_message(
    team_id: UUID,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = _ensure_team_member(db, team_id, current_user.id)

    if not data.content or not data.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    mentioned_users = resolve_mentions_in_team(db, team_id, data.content)

    message = TeamMessage(
        team_id=team_id,
        sender_id=current_user.id,
        content=data.content.strip(),
        mentioned_user_ids=[u.id for u in mentioned_users],
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    payload = _serialize_message(message, current_user)

    # ✅ figure out who should receive this live (all team members)
    member_rows = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    recipient_ids = {str(m.user_id) for m in member_rows}
    recipient_ids.add(str(team.owner_id))

    # ✅ broadcast the new message to every connected team member
    await manager.broadcast_to_users(
        recipient_ids,
        {"type": "team_message", "data": payload},
    )

    # ✅ notify mentioned users specifically (in-app notification + live push)
    for user in mentioned_users:
        if user.id == current_user.id:
            continue  # don't notify yourself if you mention yourself
        create_notification(
            db=db,
            user_id=user.id,
            title=f"{current_user.first_name} mentioned you",
            message=f"in {team.name}: {data.content.strip()[:100]}",
            type="mention",
            category="team_chat",
            entity_id=team.id,
        )

    return payload