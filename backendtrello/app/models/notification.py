from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid
 
from sqlalchemy.sql import func
from sqlalchemy import DateTime
 
class Notification(Base):
    __tablename__ = "notifications"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message = Column(String, nullable=False)
 
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    board_id = Column(UUID(as_uuid=True), nullable=True)
 
    is_read = Column(Boolean, default=False)
    title = Column(String, nullable=False)
    type = Column(String, nullable=True)
    category = Column(String, default="personal")
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


