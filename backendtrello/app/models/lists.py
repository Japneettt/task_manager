import uuid
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
 
 
class List(Base):
    __tablename__ = "lists"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
 
    title = Column(String, nullable=False)
 
    position = Column(Integer, default=0)
 
   
    board_id = Column(
    UUID(as_uuid=True),
    ForeignKey("boards.id", ondelete="CASCADE"),
)
   
 
    # ✅ relationship to tasks
    # tasks = relationship("Task", backref="list", cascade="all, delete")
    cards = relationship("Card", back_populates="list", cascade="all, delete")
