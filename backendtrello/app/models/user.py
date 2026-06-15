from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)

    role = Column(String, default="member")
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    is_admin = Column(Boolean, default=False) 

    avatar = Column(String, nullable=True)
    cover_photo = Column(String, nullable=True)

    gender = Column(String, nullable=True)  # ✅
    professional_role = Column(String, nullable=True)  # ✅