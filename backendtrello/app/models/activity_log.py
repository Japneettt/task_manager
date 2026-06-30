import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
 
 
class ActivityLog(Base):
    __tablename__ = "activity_logs"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
 
    board_id = Column(UUID(as_uuid=True), ForeignKey("boards.id"), nullable=False)
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
 
    card_title = Column(String, nullable=False)
    from_status = Column(String, nullable=True)   # e.g. "To Do"
    to_status = Column(String, nullable=False)    # e.g. "In Progress"
 
    created_at = Column(DateTime(timezone=True), server_default=func.now())