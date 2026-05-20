from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime, timedelta

class OTP(Base):
    __tablename__ = "otps"

    email = Column(String, primary_key=True)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    @staticmethod
    def create_expiry():
        return datetime.utcnow() + timedelta(minutes=5)  # ✅ 5 mins expiry