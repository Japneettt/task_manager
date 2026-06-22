from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position: int = 0
    assigned_to: Optional[UUID] = None
    # assigned_to: Optional[str] = None   # ✅ email
    priority: Optional[str] = "Medium"
    due_date: Optional[datetime] = None
    badge: Optional[str] = None  # ✅ Custom badge/status

class CardRead(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    position: int

    assigned_to: Optional[UUID]
    priority: Optional[str]
    due_date: Optional[datetime]
    badge: Optional[str]  # ✅ Custom badge/status
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None


    class Config:
        from_attributes = True

