import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    role = Column(String, default="member")  # admin/member