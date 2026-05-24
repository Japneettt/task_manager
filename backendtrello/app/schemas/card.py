from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position: int = 0
    
    assigned_to: Optional[UUID] = None   # ✅ email
    priority: Optional[str] = "Medium"
    due_date: Optional[datetime] = None


class CardRead(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    position: int

    assigned_to: Optional[UUID]
    priority: Optional[str]
    due_date: Optional[datetime]

    class Config:
        from_attributes = True
