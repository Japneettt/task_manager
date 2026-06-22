

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api.endpoints.users import get_current_user
from app.websocket.manager import manager

from app.models.card import Card
from app.models.boards import Board
from app.models.team_member import TeamMember
from app.models.team import Team
from app.models.card_comment import CardComment
from app.models.user import User

from app.schemas.message import MessageCreate
from app.utils.mentions import resolve_mentions_in_team
from app.services.notification_service import create_notification

router = APIRouter()


def _get_card_and_team(db: Session, card_id: UUID):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    board = db.query(Board).filter(Board.id == card.board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found for this card")

    team = db.query(Team).filter(Team.id == board.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found for this board")

    return card, board, team


def _ensure_team_member(db: Session, team_id: UUID, user_id: UUID):
    team = db.query(Team).filter(Team.id == team_id).first()
    if team and team.owner_id == user_id:
        return
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id,
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this team")


def _serialize_comment(comment: CardComment, sender: User) -> dict:
    return {
        "id": str(comment.id),
        "card_id": str(comment.card_id),
        "content": comment.content,
        "sender": {
            "id": str(sender.id),
            "name": f"{sender.first_name} {sender.last_name}",
            "avatar": sender.avatar,
        },
        "mentioned_user_ids": [str(u) for u in (comment.mentioned_user_ids or [])],
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
    }


# ✅ GET COMMENTS FOR A CARD
@router.get("/cards/{card_id}/comments")
def get_card_comments(
    card_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card, board, team = _get_card_and_team(db, card_id)
    _ensure_team_member(db, team.id, current_user.id)

    comments = (
        db.query(CardComment)
        .filter(CardComment.card_id == card_id)
        .order_by(CardComment.created_at.asc())
        .all()
    )

    result = []
    for c in comments:
        sender = db.query(User).filter(User.id == c.sender_id).first()
        if sender:
            result.append(_serialize_comment(c, sender))

    return result


# ✅ POST A COMMENT (saved + broadcast live + mention notifications)
@router.post("/cards/{card_id}/comments")
async def add_card_comment(
    card_id: UUID,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card, board, team = _get_card_and_team(db, card_id)
    _ensure_team_member(db, team.id, current_user.id)

    if not data.content or not data.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    mentioned_users = resolve_mentions_in_team(db, team.id, data.content)

    comment = CardComment(
        card_id=card_id,
        sender_id=current_user.id,
        content=data.content.strip(),
        mentioned_user_ids=[u.id for u in mentioned_users],
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    payload = _serialize_comment(comment, current_user)

    # ✅ everyone on the team sees comments live (so anyone with the
    # board open watches the conversation update without refreshing)
    member_rows = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    recipient_ids = {str(m.user_id) for m in member_rows}
    recipient_ids.add(str(team.owner_id))

    await manager.broadcast_to_users(
        recipient_ids,
        {"type": "card_comment", "data": payload},
    )

    for user in mentioned_users:
        if user.id == current_user.id:
            continue
        create_notification(
            db=db,
            user_id=user.id,
            title=f"{current_user.first_name} mentioned you on \"{card.title}\"",
            message=data.content.strip()[:100],
            type="mention",
            category="card_comment",
            entity_id=card.id,
        )

    return payload
