import uuid
from sqlalchemy import Boolean, Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
 
from app.core.database import Base
 
class Team(Base):
    __tablename__ = "teams"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
 
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)  # public/private/company
    description = Column(String, nullable=True)
 
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    archived = Column(Boolean, default=False)