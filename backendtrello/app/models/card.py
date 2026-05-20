import uuid
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime,
    ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base

class Card(Base):
    __tablename__ = "cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    position = Column(Integer, nullable=False)

    list_id = Column(UUID(as_uuid=True), ForeignKey("lists.id"), nullable=False)
    board_id = Column(UUID(as_uuid=True), ForeignKey("boards.id"), nullable=False)

    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    due_date = Column(String, nullable=True)

    list = relationship("List", back_populates="cards")
    # addedtoday
    depends_on = Column(UUID(as_uuid=True), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    priority = Column(String, default="Medium") 