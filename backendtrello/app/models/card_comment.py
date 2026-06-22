import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func

from app.core.database import Base


class CardComment(Base):
    __tablename__ = "card_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    content = Column(Text, nullable=False)

    mentioned_user_ids = Column(ARRAY(UUID(as_uuid=True)), default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())