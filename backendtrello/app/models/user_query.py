from sqlalchemy import Column, String, DateTime, Text
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