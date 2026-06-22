import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func

from app.core.database import Base


class TeamMessage(Base):
    __tablename__ = "team_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    content = Column(Text, nullable=False)

    # ✅ list of user_ids that were @mentioned in this message
    mentioned_user_ids = Column(ARRAY(UUID(as_uuid=True)), default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())