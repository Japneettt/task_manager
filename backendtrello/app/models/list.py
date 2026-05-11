import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class List(Base):
    __tablename__ = "lists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    position = Column(Integer, nullable=False)

    board_id = Column(UUID(as_uuid=True), ForeignKey("boards.id"), nullable=False)
    is_archived = Column(Boolean, default=False)

    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", cascade="all, delete")