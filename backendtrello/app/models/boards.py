import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from app.core.database import Base
from sqlalchemy.sql import func



class Board(Base):
    __tablename__ = "boards"
 
    # ✅ primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
 
    # ✅ board name
    title = Column(String, nullable=False)
 
    # ✅ owner
    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
   
    lists = relationship(
    "List",
    backref="board",
    cascade="all, delete",
)
 
 
    # ✅ OPTIONAL BUT IMPORTANT 🔥 (for future)
    owner = relationship("User", backref="boards")
   
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
 
 
 

  