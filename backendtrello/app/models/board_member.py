import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class BoardMember(Base):
    __tablename__ = "board_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    board_id = Column(UUID(as_uuid=True), ForeignKey("boards.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    role = Column(String, default="member")  # owner | member | viewer
