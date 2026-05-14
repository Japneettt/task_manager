import uuid
from fastapi.params import Depends
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base, get_db
 
 
class Task(Base):
    __tablename__ = "tasks"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
 
    title = Column(String, nullable=False)
 
    list_id = Column(
    UUID(as_uuid=True),
    ForeignKey("lists.id"),
    nullable=True,
)
 
 
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

