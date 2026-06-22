from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.core.database import Base

class UserQuery(Base):
    __tablename__ = "user_queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # NEW
    admin_reply = Column(Text, nullable=True)

    replied = Column(Boolean, default=False)

    replied_at = Column(DateTime, nullable=True)
