import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
 
from app.core.database import Base
 
class TeamInvite(Base):
    __tablename__ = "team_invites"
 
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
 
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"))
    invited_email = Column("email", String, nullable=False)
 
    status = Column(String, default="pending")  # pending/accepted/rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
