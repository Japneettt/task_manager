from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position: int = 0

    assigned_to: Optional[UUID] = None  # user id
    priority: Optional[str] = "Medium"
    
    badge: Optional[str] = None  # ✅ Custom badge/status
    due_date: Optional[datetime] = None  # ✅ FIXED


class CardRead(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    position: int

    assigned_to: Optional[UUID]
    priority: Optional[str]

    badge: Optional[str]  # ✅ Custom badge/status
    due_date: Optional[datetime]

    class Config:
        from_attributes = True
